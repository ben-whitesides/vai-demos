using System.Text.Json;

namespace Vai.Api.Features.Avanti.Core;

public interface IAvantiActionService
{
    Task<AvantiPrepareResultDto> PrepareAsync(PrepareAvantiActionRequest request, CancellationToken ct = default);
    Task<AvantiConfirmResultDto> ConfirmAsync(ConfirmAvantiActionRequest request, CancellationToken ct = default);
    Task<AvantiExecuteResultDto> ExecuteAsync(ExecuteAvantiActionRequest request, CancellationToken ct = default);
    Task<AvantiActionHistoryResultDto> GetHistoryAsync(AvantiActionHistoryQuery query, CancellationToken ct = default);
}

public sealed class PrepareAvantiActionRequest
{
    public Guid ActorUserId { get; set; }
    public string ActorRole { get; set; } = string.Empty;
    public string ActorTier { get; set; } = string.Empty;
    public string TileId { get; set; } = string.Empty;
    public string FeatureKey { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty;
    public string? ContextEntityType { get; set; }
    public Guid? ContextEntityId { get; set; }
    public Guid? AthleteId { get; set; }
    public Guid? ClubId { get; set; }
    public Guid? OrgId { get; set; }
    public string? Surface { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
}

public sealed class ConfirmAvantiActionRequest
{
    public Guid ActionRunId { get; set; }
    public Guid ActorUserId { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
    public JsonElement ConfirmationPayload { get; set; }
}

public sealed class ExecuteAvantiActionRequest
{
    public Guid ActionRunId { get; set; }
    public Guid ActorUserId { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
}

public sealed class AvantiActionHistoryQuery
{
    public Guid ActorUserId { get; set; }
    public string ActorRole { get; set; } = string.Empty;
    public string? FeatureKey { get; set; }
    public string? Status { get; set; }
    public DateTimeOffset? From { get; set; }
    public DateTimeOffset? To { get; set; }
    public int Limit { get; set; } = 50;
    public string? Cursor { get; set; }
}

public sealed record AvantiPrepareResultDto(
    Guid? ActionRunId,
    string? RiskLevel,
    string Status,
    bool RequiresConfirmation,
    string? Label,
    string? Summary,
    JsonElement? Preview,
    DateTimeOffset? ExpiresAt,
    bool Success,
    string? ErrorCode,
    string? ErrorMessage
);

public sealed record AvantiConfirmResultDto(
    Guid ActionRunId,
    string Status,
    bool Success,
    string? ErrorCode,
    string? ErrorMessage
);

public sealed record AvantiExecuteResultDto(
    Guid ActionRunId,
    string Status,
    bool Success,
    string? FailureCode,
    string? FailureMessage,
    JsonElement? Result
);

public sealed record AvantiActionHistoryItemDto(
    Guid ActionRunId,
    string FeatureKey,
    string ActionType,
    string RiskLevel,
    string Status,
    string? Summary,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ExecutedAt,
    JsonElement? PreparedPayload,
    JsonElement? ConfirmationPayload,
    JsonElement? ExecutionPayload,
    JsonElement? ExecutionResult
);

public sealed record AvantiActionHistoryResultDto(
    IReadOnlyList<AvantiActionHistoryItemDto> Items,
    string? NextCursor
);
