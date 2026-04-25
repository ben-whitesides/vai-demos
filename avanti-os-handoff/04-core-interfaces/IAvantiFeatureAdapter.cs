using System.Text.Json;

namespace Vai.Api.Features.Avanti.Core;

// ─────────────────────────────────────────────────────────────────────────────
// IAvantiFeatureAdapter
//
// Every VAI feature that participates in the AVANTI OS Brain registers one
// typed adapter. The adapter knows:
//   • what data it can read for the feature (scoped to the actor)
//   • what Green actions it can complete without confirmation
//   • what Yellow actions it prepares for human confirmation
//   • what Red actions it explains as blocked
//
// Adapters are registered via DI:
//   services.AddScoped<IAvantiFeatureAdapter, PlayStatusAvantiAdapter>();
//
// The adapter framework (AvantiActionService) resolves the correct adapter
// from the registry by FeatureKey and dispatches PrepareAsync / ExecuteAsync.
// ─────────────────────────────────────────────────────────────────────────────

public interface IAvantiFeatureAdapter
{
    string FeatureKey { get; }

    Task<AvantiFeatureContextDto> GetContextAsync(
        AvantiContextRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AvantiPreparedActionDto>> GetPreparedActionsAsync(
        AvantiContextRequest request,
        CancellationToken cancellationToken = default);

    Task<AvantiExecutionResultDto> ExecuteAsync(
        AvantiConfirmedActionRequest request,
        CancellationToken cancellationToken = default);
}

// ─────────────────────────────────────────────────────────────────────────────
// Request / DTO types
// ─────────────────────────────────────────────────────────────────────────────

public sealed record AvantiContextRequest(
    Guid ActorUserId,
    string ActorRole,
    string ActorTier,
    string TileId,
    string? ContextEntityType,
    Guid? ContextEntityId,
    Guid? AthleteId,
    Guid? ClubId,
    Guid? OrgId,
    string? Surface           // e.g. "mobile", "gameday", "home_grid"
);

public sealed record AvantiConfirmedActionRequest(
    Guid ActionRunId,
    Guid ActorUserId,
    string ActionType,
    string FeatureKey,
    JsonElement ConfirmationPayload,
    string IdempotencyKey
);

public sealed record AvantiFeatureContextDto(
    string TileId,
    string FeatureKey,
    string Title,
    string RiskLevel,           // "green" | "yellow" | "red"
    string Summary,
    IReadOnlyList<string> QuickPrompts,
    AvantiNavigateDto Navigate
);

public sealed record AvantiNavigateDto(
    string Label,
    string Route
);

public sealed record AvantiPreparedActionDto(
    string FeatureKey,
    string TileId,
    string ActionType,
    string RiskLevel,
    bool RequiresConfirmation,
    string Label,
    string Summary,
    JsonElement Preview,        // typed at service layer — JsonElement avoids object serialization ambiguity
    string? TargetEntityType,
    Guid? TargetEntityId,
    DateTimeOffset? ExpiresAt
);

public sealed record AvantiExecutionResultDto(
    bool Success,
    string? OutboxEventId,
    string? FailureCode,
    string? FailureMessage,
    JsonElement Result
);
