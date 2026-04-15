using System.Globalization;
using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Vai.Api.Infrastructure.Services;
using Vai.Api.Infrastructure.Templates.Drip;

namespace Vai.Api.Infrastructure.Drip;

public class DripSendJob(
    IServiceScopeFactory scopeFactory,
    DripSendRateLimiter rateLimiter,
    ILogger<DripSendJob> logger)
{
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private readonly DripSendRateLimiter _rateLimiter = rateLimiter;
    private readonly ILogger<DripSendJob> _logger = logger;

    [AutomaticRetry(Attempts = 0)]
    public async Task ProcessDueAsync(CancellationToken cancellationToken = default)
    {
        // Resolve all scoped dependencies once at the start of the run.
        // Factory pattern keeps the hot loop free of service-locator boilerplate.
        using var scope = _scopeFactory.CreateScope();
        var ctx = DripJobContext.From(scope.ServiceProvider);
        if (!ctx.Options.Enabled)
            return;

        var due = await ctx.Repo.GetDuePendingAsync(ctx.Options.SendRateLimitPerMinute * 2, DateTime.UtcNow);
        foreach (var row in due)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (!_rateLimiter.TryConsume(ctx.Options.SendRateLimitPerMinute, out var wait))
            {
                _logger.LogInformation("Drip rate limit reached; will resume next run after {Wait}", wait);
                break;
            }

            await ProcessRowAsync(ctx, row);
        }
    }

    // Single-row pipeline split out from ProcessDueAsync for clarity + cyclomatic-complexity drop.
    private async Task ProcessRowAsync(DripJobContext ctx, DripSendLogRow row)
    {
        var step = SequenceMap.GetStep(row.SequenceName, row.EmailIndex);
        if (step is null)
        {
            await ctx.Repo.MarkFailedAsync(row.Id, "Unknown sequence step", DateTime.UtcNow);
            return;
        }

        var userCtx = await ctx.Users.GetAsync(row.UserId);
        if (userCtx is null || string.IsNullOrWhiteSpace(userCtx.Email))
        {
            await ctx.Repo.MarkFailedAsync(row.Id, "User not found or no email", DateTime.UtcNow);
            return;
        }

        var model = BuildViewModel(step, userCtx, ctx.Options.WebBaseUrl);

        try
        {
            await ctx.Email.SendDripTemplateAsync(step.TemplatePath, model, step.Subject, userCtx.Email);
            await ctx.Repo.MarkSentAsync(row.Id, DateTime.UtcNow);
        }
        catch (Exception ex) when (IsTransient(ex))
        {
            // Transient: schedule a retry with exponential backoff
            await HandleSendFailureAsync(ctx, row, ex, retry: true);
        }
        catch (Exception ex)
        {
            // Permanent: mark as retry-eligible based on retry budget; final exhaustion → failed
            _logger.LogWarning(ex, "Drip send failed for log {Id}", row.Id);
            await HandleSendFailureAsync(ctx, row, ex, retry: false);
        }
    }

    private static async Task HandleSendFailureAsync(DripJobContext ctx, DripSendLogRow row, Exception ex, bool retry)
    {
        var nextRetry = row.RetryCount + 1;
        if (nextRetry >= ctx.Options.MaxRetries)
        {
            await ctx.Repo.MarkFailedAsync(row.Id, ex.Message, DateTime.UtcNow);
            return;
        }
        var delay = CalculateBackoff(nextRetry);
        await ctx.Repo.MarkRetryAsync(row.Id, DateTime.UtcNow.Add(delay), ex.Message, nextRetry, DateTime.UtcNow);
    }

    private static DripEmailViewModel BuildViewModel(DripSequenceStep step, DripUserEmailContext userCtx, string webBaseUrl)
    {
        var handle = userCtx.Handle ?? "";
        var baseUrl = webBaseUrl.TrimEnd('/');
        return new DripEmailViewModel
        {
            Subject = step.Subject,
            FirstName = userCtx.FirstName ?? "",
            Handle = handle,
            ProfileUrl = $"{baseUrl}/profile",
            ShareLinkUrl = string.IsNullOrEmpty(handle) ? $"{baseUrl}/share" : $"{baseUrl}/share/{handle}",
            UnsubscribeUrl = $"{baseUrl}/unsubscribe",
            AppUrl = baseUrl,
            AvantiUrl = $"{baseUrl}/avanti",
            UpgradeUrl = $"{baseUrl}/upgrade",
            ContentBriefUrl = $"{baseUrl}/builder/content-briefs",
            ExpiryDate = DateTime.UtcNow.AddDays(7).ToString("MMMM d, yyyy", CultureInfo.InvariantCulture),
        };
    }

    // Exponential backoff: 2^attempt minutes (2, 4, 8, 16, ...). Capped via MaxRetries in caller.
    private static TimeSpan CalculateBackoff(int attempt) =>
        TimeSpan.FromMinutes(Math.Pow(2, attempt));

    // Transient = network/timeout/5xx-class. Anything else is treated as a candidate-for-retry
    // unless the retry budget is exhausted. Conservative: SES rejects + template errors are NOT transient.
    private static bool IsTransient(Exception ex) => ex is TimeoutException
                                                  || ex is HttpRequestException
                                                  || ex is TaskCanceledException;
}

// Aggregates all scoped dependencies the job needs in a single immutable record.
// Pulled out of ProcessDueAsync so the hot loop is free of service-locator noise,
// which was a primary contributor to SonarQube's cognitive-complexity finding on the original.
internal sealed record DripJobContext(
    DripOptions Options,
    IDripSendLogRepository Repo,
    IEmailService Email,
    IDripUserLookup Users)
{
    public static DripJobContext From(IServiceProvider sp) => new(
        Options: sp.GetRequiredService<IOptions<DripOptions>>().Value,
        Repo: sp.GetRequiredService<IDripSendLogRepository>(),
        Email: sp.GetRequiredService<IEmailService>(),
        Users: sp.GetRequiredService<IDripUserLookup>());
}
