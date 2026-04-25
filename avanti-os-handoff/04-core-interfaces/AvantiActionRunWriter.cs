using System.Data;
using System.Text.Json;
using Dapper;

namespace Vai.Api.Features.Avanti.Core;

public interface IAvantiActionRunWriter
{
    Task<Guid> WriteAsync(AvantiActionRunWriteDto dto, CancellationToken ct);
    Task UpdateStatusAsync(Guid actionRunId, string status, JsonElement? result, string? failureCode, string? failureMessage, CancellationToken ct);
    Task UpdateConfirmAsync(Guid actionRunId, Guid confirmedByUserId, JsonElement confirmationPayload, CancellationToken ct);
    Task<AvantiActionRunDto?> GetByIdAsync(Guid actionRunId, CancellationToken ct);
    Task<AvantiActionRunDto?> GetByIdempotencyAsync(Guid actorUserId, string idempotencyKey, CancellationToken ct);
    Task<IReadOnlyList<AvantiActionRunDto>> GetHistoryAsync(AvantiActionHistoryQuery query, CancellationToken ct);
}

public sealed record AvantiActionRunWriteDto(
    Guid ActorUserId,
    string ActorRole,
    string ActorTier,
    string TileId,
    string FeatureKey,
    string ActionType,
    string RiskLevel,
    string Status,
    string? ContextEntityType,
    Guid? ContextEntityId,
    string? TargetEntityType,
    Guid? TargetEntityId,
    string IdempotencyKey,
    bool RequiresConfirmation,
    JsonElement PreparedPayload,
    JsonElement? ConfirmationPayload,
    JsonElement? ExecutionPayload,
    DateTimeOffset? ExpiresAt
);

public sealed class AvantiActionRunDto
{
    public Guid Id { get; set; }
    public Guid ActorUserId { get; set; }
    public string ActorRole { get; set; } = string.Empty;
    public string ActorTier { get; set; } = string.Empty;
    public string? TileId { get; set; }
    public string FeatureKey { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ContextEntityType { get; set; }
    public Guid? ContextEntityId { get; set; }
    public string? TargetEntityType { get; set; }
    public Guid? TargetEntityId { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
    public bool RequiresConfirmation { get; set; }
    public Guid? ConfirmedByUserId { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public JsonElement ConfirmationPayload { get; set; }
    public JsonElement PreparedPayload { get; set; }
    public JsonElement ExecutionPayload { get; set; }
    public JsonElement ExecutionResult { get; set; }
    public string? FailureCode { get; set; }
    public string? FailureMessage { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public DateTimeOffset PreparedAt { get; set; }
    public DateTimeOffset? ExecutedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class AvantiActionRunWriter(
    IDbConnectionProvider dbConnectionProvider) : IAvantiActionRunWriter
{
    public async Task<Guid> WriteAsync(AvantiActionRunWriteDto dto, CancellationToken ct)
    {
        const string sql = """
            INSERT INTO avanti_action_runs (
                actor_user_id,
                actor_role,
                actor_tier,
                tile_id,
                feature_key,
                action_type,
                risk_level,
                status,
                context_entity_type,
                context_entity_id,
                target_entity_type,
                target_entity_id,
                idempotency_key,
                requires_confirmation,
                confirmation_payload,
                prepared_payload,
                execution_payload,
                expires_at,
                executed_at,
                prepared_at,
                created_at,
                updated_at
            )
            VALUES (
                @ActorUserId,
                @ActorRole,
                @ActorTier,
                @TileId,
                @FeatureKey,
                @ActionType,
                @RiskLevel,
                @Status,
                @ContextEntityType,
                @ContextEntityId,
                @TargetEntityType,
                @TargetEntityId,
                @IdempotencyKey,
                @RequiresConfirmation,
                CAST(@ConfirmationPayload AS jsonb),
                CAST(@PreparedPayload AS jsonb),
                CAST(@ExecutionPayload AS jsonb),
                @ExpiresAt,
                @ExecutedAt,
                NOW(),
                NOW(),
                NOW()
            )
            RETURNING id;
            """;

        var nowExecuted = dto.Status == "succeeded" ? DateTimeOffset.UtcNow : (DateTimeOffset?)null;
        using var connection = dbConnectionProvider.GetConnection();
        return await connection.ExecuteScalarAsync<Guid>(new CommandDefinition(
            sql,
            new
            {
                dto.ActorUserId,
                dto.ActorRole,
                dto.ActorTier,
                dto.TileId,
                dto.FeatureKey,
                dto.ActionType,
                dto.RiskLevel,
                dto.Status,
                dto.ContextEntityType,
                dto.ContextEntityId,
                dto.TargetEntityType,
                dto.TargetEntityId,
                dto.IdempotencyKey,
                dto.RequiresConfirmation,
                ConfirmationPayload = JsonSerializer.Serialize(dto.ConfirmationPayload ?? JsonSerializer.SerializeToElement(new { })),
                PreparedPayload = JsonSerializer.Serialize(dto.PreparedPayload),
                ExecutionPayload = JsonSerializer.Serialize(dto.ExecutionPayload ?? JsonSerializer.SerializeToElement(new { })),
                dto.ExpiresAt,
                ExecutedAt = nowExecuted
            },
            cancellationToken: ct)).ConfigureAwait(false);
    }

    public async Task UpdateStatusAsync(Guid actionRunId, string status, JsonElement? result, string? failureCode, string? failureMessage, CancellationToken ct)
    {
        const string sql = """
            UPDATE avanti_action_runs
            SET status = @Status,
                execution_result = CAST(@ExecutionResult AS jsonb),
                failure_code = @FailureCode,
                failure_message = @FailureMessage,
                executed_at = CASE WHEN @Status IN ('succeeded','failed') THEN NOW() ELSE executed_at END,
                updated_at = NOW()
            WHERE id = @ActionRunId;
            """;

        using var connection = dbConnectionProvider.GetConnection();
        await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                ActionRunId = actionRunId,
                Status = status,
                ExecutionResult = JsonSerializer.Serialize(result ?? JsonSerializer.SerializeToElement(new { })),
                FailureCode = failureCode,
                FailureMessage = failureMessage
            },
            cancellationToken: ct)).ConfigureAwait(false);
    }

    public async Task UpdateConfirmAsync(Guid actionRunId, Guid confirmedByUserId, JsonElement confirmationPayload, CancellationToken ct)
    {
        const string sql = """
            UPDATE avanti_action_runs
            SET status = 'confirmed',
                confirmed_by_user_id = @ConfirmedByUserId,
                confirmed_at = NOW(),
                confirmation_payload = CAST(@ConfirmationPayload AS jsonb),
                updated_at = NOW()
            WHERE id = @ActionRunId;
            """;

        using var connection = dbConnectionProvider.GetConnection();
        await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                ActionRunId = actionRunId,
                ConfirmedByUserId = confirmedByUserId,
                ConfirmationPayload = JsonSerializer.Serialize(confirmationPayload)
            },
            cancellationToken: ct)).ConfigureAwait(false);
    }

    public async Task<AvantiActionRunDto?> GetByIdAsync(Guid actionRunId, CancellationToken ct)
    {
        const string sql = """
            SELECT
                id,
                actor_user_id AS ActorUserId,
                actor_role AS ActorRole,
                actor_tier AS ActorTier,
                tile_id AS TileId,
                feature_key AS FeatureKey,
                action_type AS ActionType,
                risk_level AS RiskLevel,
                status,
                context_entity_type AS ContextEntityType,
                context_entity_id AS ContextEntityId,
                target_entity_type AS TargetEntityType,
                target_entity_id AS TargetEntityId,
                idempotency_key AS IdempotencyKey,
                requires_confirmation AS RequiresConfirmation,
                confirmed_by_user_id AS ConfirmedByUserId,
                confirmed_at AS ConfirmedAt,
                confirmation_payload AS ConfirmationPayload,
                prepared_payload AS PreparedPayload,
                execution_payload AS ExecutionPayload,
                execution_result AS ExecutionResult,
                failure_code AS FailureCode,
                failure_message AS FailureMessage,
                expires_at AS ExpiresAt,
                prepared_at AS PreparedAt,
                executed_at AS ExecutedAt,
                created_at AS CreatedAt
            FROM avanti_action_runs
            WHERE id = @ActionRunId;
            """;

        using var connection = dbConnectionProvider.GetConnection();
        return await connection.QueryFirstOrDefaultAsync<AvantiActionRunDto>(new CommandDefinition(
            sql,
            new { ActionRunId = actionRunId },
            cancellationToken: ct)).ConfigureAwait(false);
    }

    public async Task<AvantiActionRunDto?> GetByIdempotencyAsync(Guid actorUserId, string idempotencyKey, CancellationToken ct)
    {
        const string sql = """
            SELECT
                id,
                actor_user_id AS ActorUserId,
                actor_role AS ActorRole,
                actor_tier AS ActorTier,
                tile_id AS TileId,
                feature_key AS FeatureKey,
                action_type AS ActionType,
                risk_level AS RiskLevel,
                status,
                context_entity_type AS ContextEntityType,
                context_entity_id AS ContextEntityId,
                target_entity_type AS TargetEntityType,
                target_entity_id AS TargetEntityId,
                idempotency_key AS IdempotencyKey,
                requires_confirmation AS RequiresConfirmation,
                confirmed_by_user_id AS ConfirmedByUserId,
                confirmed_at AS ConfirmedAt,
                confirmation_payload AS ConfirmationPayload,
                prepared_payload AS PreparedPayload,
                execution_payload AS ExecutionPayload,
                execution_result AS ExecutionResult,
                failure_code AS FailureCode,
                failure_message AS FailureMessage,
                expires_at AS ExpiresAt,
                prepared_at AS PreparedAt,
                executed_at AS ExecutedAt,
                created_at AS CreatedAt
            FROM avanti_action_runs
            WHERE actor_user_id = @ActorUserId
              AND idempotency_key = @IdempotencyKey;
            """;

        using var connection = dbConnectionProvider.GetConnection();
        return await connection.QueryFirstOrDefaultAsync<AvantiActionRunDto>(new CommandDefinition(
            sql,
            new { ActorUserId = actorUserId, IdempotencyKey = idempotencyKey },
            cancellationToken: ct)).ConfigureAwait(false);
    }

    public async Task<IReadOnlyList<AvantiActionRunDto>> GetHistoryAsync(AvantiActionHistoryQuery query, CancellationToken ct)
    {
        const string sql = """
            SELECT
                id,
                actor_user_id AS ActorUserId,
                actor_role AS ActorRole,
                actor_tier AS ActorTier,
                tile_id AS TileId,
                feature_key AS FeatureKey,
                action_type AS ActionType,
                risk_level AS RiskLevel,
                status,
                context_entity_type AS ContextEntityType,
                context_entity_id AS ContextEntityId,
                target_entity_type AS TargetEntityType,
                target_entity_id AS TargetEntityId,
                idempotency_key AS IdempotencyKey,
                requires_confirmation AS RequiresConfirmation,
                confirmed_by_user_id AS ConfirmedByUserId,
                confirmed_at AS ConfirmedAt,
                confirmation_payload AS ConfirmationPayload,
                prepared_payload AS PreparedPayload,
                execution_payload AS ExecutionPayload,
                execution_result AS ExecutionResult,
                failure_code AS FailureCode,
                failure_message AS FailureMessage,
                expires_at AS ExpiresAt,
                prepared_at AS PreparedAt,
                executed_at AS ExecutedAt,
                created_at AS CreatedAt
            FROM avanti_action_runs
            WHERE actor_user_id = @ActorUserId
              AND (@FeatureKey IS NULL OR feature_key = @FeatureKey)
              AND (@Status IS NULL OR status = @Status)
              AND (@From IS NULL OR created_at >= @From)
              AND (@To IS NULL OR created_at <= @To)
            ORDER BY created_at DESC
            LIMIT @Limit
            OFFSET @Offset;
            """;

        var parsedCursor = int.TryParse(query.Cursor, out var cursorOffset) ? cursorOffset : 0;
        using var connection = dbConnectionProvider.GetConnection();
        var rows = await connection.QueryAsync<AvantiActionRunDto>(new CommandDefinition(
            sql,
            new
            {
                query.ActorUserId,
                query.FeatureKey,
                query.Status,
                query.From,
                query.To,
                Limit = query.Limit <= 0 ? 50 : query.Limit,
                Offset = Math.Max(parsedCursor, 0)
            },
            cancellationToken: ct)).ConfigureAwait(false);
        return rows.ToList();
    }
}
