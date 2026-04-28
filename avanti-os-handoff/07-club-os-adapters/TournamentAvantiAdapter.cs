using System.Text.Json;
using Vai.Api.Features.Avanti.Core;
using Vai.Api.Features.ClubOS.Gameday.Tournaments;
using Vai.Api.Features.ClubOS.Gameday.Schedule;

namespace Vai.Api.Features.ClubOS.Avanti.Adapters;

public sealed class TournamentAvantiAdapter(
    ITournamentService tournamentService,
    IScheduleService scheduleService,
    IAvantiActionRunWriter actionRunWriter) : IAvantiFeatureAdapter
{
    public string FeatureKey => "tournaments";

    public async Task<AvantiFeatureContextDto> GetContextAsync(
        AvantiContextRequest request,
        CancellationToken cancellationToken = default)
    {
        var bracket = request.ContextEntityId.HasValue
            ? await tournamentService
                .GetBracketHealthAsync(request.ContextEntityId.Value, cancellationToken)
                .ConfigureAwait(false)
            : null;

        var hasConflict = bracket?.HasConflict ?? false;

        return new AvantiFeatureContextDto(
            TileId: "tournaments",
            FeatureKey: FeatureKey,
            Title: "Tournaments",
            RiskLevel: hasConflict ? "yellow" : "green",
            Summary: bracket is not null
                ? $"{bracket.MatchCount} matches · {(hasConflict ? "Conflict detected" : "No conflicts")}"
                : "No active tournament selected",
            QuickPrompts: [
                "Explain this bracket conflict",
                "Who has a bye in Round 2?",
                "Preview finalization impact"
            ],
            Navigate: new AvantiNavigateDto("Open Tournaments", "/club-os/tournaments")
        );
    }

    public async Task<IReadOnlyList<AvantiPreparedActionDto>> GetPreparedActionsAsync(
        AvantiContextRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!request.ContextEntityId.HasValue)
            return [];

        var conflicts = await tournamentService
            .GetBracketConflictsAsync(request.ContextEntityId.Value, cancellationToken)
            .ConfigureAwait(false);

        if (!conflicts.Any())
            return [];

        return [new AvantiPreparedActionDto(
            FeatureKey: FeatureKey,
            TileId: "tournaments",
            ActionType: "tournaments.prepare_bracket_edit",
            RiskLevel: "yellow",
            RequiresConfirmation: true,
            Label: "Review bracket conflict",
            Summary: $"{conflicts.Count} conflict(s) need admin resolution before Sunday",
            Preview: JsonSerializer.SerializeToElement(new
            {
                conflictCount = conflicts.Count,
                conflicts = conflicts.Select(c => new { c.Description, c.AffectedTeams })
            }),
            TargetEntityType: "tournament",
            TargetEntityId: request.ContextEntityId,
            ExpiresAt: DateTimeOffset.UtcNow.AddHours(48)
        )];
    }

    public async Task<AvantiExecutionResultDto> ExecuteAsync(
        AvantiConfirmedActionRequest request,
        CancellationToken cancellationToken = default)
    {
        // Bracket edits dispatch through tournament service — append-only via existing scoring APIs
        var outboxId = await tournamentService
            .ApplyBracketEditAsync(request, cancellationToken)
            .ConfigureAwait(false);

        // Fail closed: null outbox id means the bracket edit didn't apply.
        if (string.IsNullOrEmpty(outboxId))
        {
            return new AvantiExecutionResultDto(
                Success: false,
                OutboxEventId: null,
                FailureCode: "service_returned_no_outbox",
                FailureMessage: "TournamentService.ApplyBracketEditAsync returned null/empty outbox id; bracket edit was not applied.",
                Result: JsonSerializer.SerializeToElement(new { applied = false })
            );
        }

        return new AvantiExecutionResultDto(
            Success: true,
            OutboxEventId: outboxId,
            FailureCode: null,
            FailureMessage: null,
            Result: JsonSerializer.SerializeToElement(new { applied = true })
        );
    }
}
