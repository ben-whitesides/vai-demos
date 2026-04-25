using Dapper;
using System.Text.Json;

namespace Vai.Api.Features.Avanti.Core;

public interface IAvantiProactiveScanWriter
{
    Task<Guid> StartScanAsync(AvantiScanStartDto dto, CancellationToken ct);
    Task CompleteScanAsync(Guid scanId, string status, string? highestRiskLevel, Guid[]? preparedActionRunIds, string? errorCode, CancellationToken ct);
}

public sealed record AvantiScanStartDto(
    Guid UserId,
    string Role,
    string ScanScope,
    string TriggerType,
    string Status,
    DateTimeOffset? StartedAt,
    string? StripContext
);

public sealed class AvantiProactiveScanWriter(
    IDbConnectionProvider dbConnectionProvider) : IAvantiProactiveScanWriter
{
    public async Task<Guid> StartScanAsync(AvantiScanStartDto dto, CancellationToken ct)
    {
        var stripContextJson = NormalizeJson(dto.StripContext);

        const string sql = """
            INSERT INTO avanti_proactive_scan_runs (
                user_id,
                role,
                scan_scope,
                trigger_type,
                status,
                started_at,
                strip_context,
                created_at
            )
            VALUES (
                @UserId,
                @Role,
                @ScanScope,
                @TriggerType,
                @Status,
                @StartedAt,
                CAST(@StripContext AS jsonb),
                NOW()
            )
            RETURNING id;
            """;

        using var connection = dbConnectionProvider.GetConnection();
        return await connection.ExecuteScalarAsync<Guid>(new CommandDefinition(
            sql,
            new
            {
                dto.UserId,
                dto.Role,
                dto.ScanScope,
                dto.TriggerType,
                dto.Status,
                StartedAt = dto.StartedAt ?? DateTimeOffset.UtcNow,
                StripContext = stripContextJson
            },
            cancellationToken: ct)).ConfigureAwait(false);
    }

    public async Task CompleteScanAsync(Guid scanId, string status, string? highestRiskLevel, Guid[]? preparedActionRunIds, string? errorCode, CancellationToken ct)
    {
        const string sql = """
            UPDATE avanti_proactive_scan_runs
            SET status = @Status,
                highest_risk_level = @HighestRiskLevel,
                prepared_action_run_ids = @PreparedActionRunIds,
                error_code = @ErrorCode,
                error_message = CASE WHEN @ErrorCode IS NULL THEN NULL ELSE CONCAT('scan_failed:', @ErrorCode) END,
                finished_at = NOW()
            WHERE id = @ScanId;
            """;

        using var connection = dbConnectionProvider.GetConnection();
        await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                ScanId = scanId,
                Status = status,
                HighestRiskLevel = highestRiskLevel,
                PreparedActionRunIds = preparedActionRunIds ?? Array.Empty<Guid>(),
                ErrorCode = errorCode
            },
            cancellationToken: ct)).ConfigureAwait(false);
    }

    private static string NormalizeJson(string? rawJson)
    {
        var candidate = string.IsNullOrWhiteSpace(rawJson) ? "{}" : rawJson;
        using var doc = JsonDocument.Parse(candidate);
        return doc.RootElement.GetRawText();
    }
}
