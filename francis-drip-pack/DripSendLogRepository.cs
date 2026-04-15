using System.Data;
using Dapper;
using Vai.Api.Infrastructure.Data;

namespace Vai.Api.Infrastructure.Drip;

public class DripSendLogRepository(IDbConnectionProvider dbConnectionProvider) : IDripSendLogRepository
{
    private readonly IDbConnectionProvider _db = dbConnectionProvider;

    // ───────────────────────── Connection helpers ─────────────────────────
    // Five wrappers consolidate the `using var conn = _db.GetConnection()` boilerplate
    // that was repeated across 11 public methods. Behavior is unchanged — the helpers
    // just move the connection lifecycle out of every callsite.

    private async Task<T> QuerySingleAsync<T>(string sql, object? param = null)
    {
        using var conn = _db.GetConnection();
        return await conn.QuerySingleAsync<T>(sql, param);
    }

    private async Task<T?> ExecuteScalarAsync<T>(string sql, object? param = null)
    {
        using var conn = _db.GetConnection();
        return await conn.ExecuteScalarAsync<T?>(sql, param);
    }

    private async Task<IReadOnlyList<T>> QueryListAsync<T>(string sql, object? param = null)
    {
        using var conn = _db.GetConnection();
        return (await conn.QueryAsync<T>(sql, param)).AsList();
    }

    private async Task<int> ExecuteAsync(string sql, object? param = null)
    {
        using var conn = _db.GetConnection();
        return await conn.ExecuteAsync(sql, param);
    }

    private async Task ExecuteInTransactionAsync<T>(string sql, IEnumerable<T> rows)
    {
        using var conn = _db.GetConnection();
        conn.Open();
        using var tx = conn.BeginTransaction();
        try
        {
            foreach (var r in rows)
                await conn.ExecuteAsync(sql, r, tx);
            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    // ───────────────────────── Public API (unchanged signatures) ─────────────────────────

    public Task<bool> SequenceStartedAsync(int userId, string sequenceName)
    {
        const string sql = """
            SELECT EXISTS (
                SELECT 1 FROM drip_send_log
                WHERE user_id = @UserId AND sequence_name = @SequenceName
            );
            """;
        return QuerySingleAsync<bool>(sql, new { UserId = userId, SequenceName = sequenceName });
    }

    public Task<DateTime?> OnboardingSequenceStartUtcAsync(int userId)
    {
        const string sql = """
            SELECT MIN(scheduled_for) FROM drip_send_log
            WHERE user_id = @UserId AND sequence_name = @Seq AND email_index = 0;
            """;
        return ExecuteScalarAsync<DateTime?>(sql, new { UserId = userId, Seq = SequenceNames.Onboarding });
    }

    public async Task<bool> WinBackUrgentCooldownActiveAsync(int userId, DateTime utcNow)
    {
        const string sql = """
            SELECT MAX(sent_at) FROM drip_send_log
            WHERE user_id = @UserId
              AND sequence_name = @Seq
              AND email_index = 1
              AND status = 'sent';
            """;

        var lastUrgentSecondSent = await ExecuteScalarAsync<DateTime?>(sql,
            new { UserId = userId, Seq = SequenceNames.WinBackUrgent });

        if (!lastUrgentSecondSent.HasValue)
            return false;

        return lastUrgentSecondSent.Value.AddDays(90) > utcNow;
    }

    public Task InsertSchedulesAsync(IReadOnlyList<DripSendLogInsert> rows)
    {
        if (rows.Count == 0)
            return Task.CompletedTask;

        const string sql = """
            INSERT INTO drip_send_log (user_id, sequence_name, email_index, scheduled_for, status)
            VALUES (@UserId, @SequenceName, @EmailIndex, @ScheduledFor, 'pending')
            ON CONFLICT (user_id, sequence_name, email_index) DO NOTHING;
            """;

        // Transaction wrapper preserved — required for atomic multi-row insert with ON CONFLICT semantics
        return ExecuteInTransactionAsync(sql, rows);
    }

    public Task<IReadOnlyList<DripSendLogRow>> GetDuePendingAsync(int limit, DateTime utcNow)
    {
        const string sql = """
            SELECT id AS Id, user_id AS UserId, sequence_name AS SequenceName, email_index AS EmailIndex,
                   scheduled_for AS ScheduledFor, sent_at AS SentAt, status AS Status,
                   error_message AS ErrorMessage, retry_count AS RetryCount
            FROM drip_send_log
            WHERE status = 'pending' AND scheduled_for <= @Now
            ORDER BY scheduled_for
            LIMIT @Limit;
            """;
        return QueryListAsync<DripSendLogRow>(sql, new { Now = utcNow, Limit = limit });
    }

    public Task MarkSentAsync(Guid id, DateTime utcNow)
    {
        const string sql = """
            UPDATE drip_send_log
            SET status = 'sent', sent_at = @SentAt, updated_at = @SentAt, error_message = NULL
            WHERE id = @Id;
            """;
        return ExecuteAsync(sql, new { Id = id, SentAt = utcNow });
    }

    public Task MarkRetryAsync(Guid id, DateTime nextScheduledUtc, string error, int retryCount, DateTime utcNow)
    {
        const string sql = """
            UPDATE drip_send_log
            SET scheduled_for = @Next, retry_count = @Retry, error_message = @Err, updated_at = @Upd,
                status = 'pending'
            WHERE id = @Id;
            """;

        return ExecuteAsync(sql, new
        {
            Id = id,
            Next = nextScheduledUtc,
            Retry = retryCount,
            Err = TruncateErr(error),
            Upd = utcNow
        });
    }

    public Task MarkFailedAsync(Guid id, string error, DateTime utcNow)
    {
        const string sql = """
            UPDATE drip_send_log
            SET status = 'failed', error_message = @Err, updated_at = @Upd
            WHERE id = @Id;
            """;
        return ExecuteAsync(sql, new { Id = id, Err = TruncateErr(error), Upd = utcNow });
    }

    public Task<int> SuppressPendingWinBackMildAsync(int userId, DateTime utcNow, string errorMessage)
    {
        const string sql = """
            UPDATE drip_send_log
            SET status = 'suppressed', error_message = @Err, updated_at = @Upd
            WHERE user_id = @UserId
              AND sequence_name = @Seq
              AND status = 'pending'
            """;

        return ExecuteAsync(sql, new
        {
            UserId = userId,
            Seq = SequenceNames.WinBackMild,
            Err = TruncateErr(errorMessage),
            Upd = utcNow
        });
    }

    public Task<IReadOnlyList<WinBackCandidateRow>> GetWinBackCandidatesAsync(DateTime utcNow)
    {
        const string sql = """
            SELECT id AS UserId, last_seen_at AS LastSeenAt, created_at AS CreatedAt
            FROM users
            WHERE deleted_at IS NULL
              AND last_seen_at < @Threshold30;
            """;
        var threshold30 = utcNow.AddDays(-30);
        return QueryListAsync<WinBackCandidateRow>(sql, new { Threshold30 = threshold30 });
    }

    public Task<IReadOnlyList<AvantiCatchupRow>> GetAvantiCatchupCandidatesAsync()
    {
        const string sql = """
            SELECT u.id AS UserId, MIN(ar.started_at) AS FirstRunAt
            FROM users u
            JOIN audit_runs ar ON ar.user_id = u.public_id
            WHERE u.deleted_at IS NULL
            GROUP BY u.id
            HAVING NOT EXISTS (
                SELECT 1 FROM drip_send_log d
                WHERE d.user_id = u.id AND d.sequence_name = @Seq
                LIMIT 1
            );
            """;
        return QueryListAsync<AvantiCatchupRow>(sql, new { Seq = SequenceNames.AvantiNudge });
    }

    private static string? TruncateErr(string error) =>
        error.Length <= 4000 ? error : error[..4000];
}
