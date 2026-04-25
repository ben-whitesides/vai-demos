using Microsoft.AspNetCore.Authorization;

namespace Vai.Api.Infrastructure.Auth;

// ─────────────────────────────────────────────────────────────────────────────
// AnyScopeRequirement + AnyScopeAuthorizationHandler
//
// Handles policies named "scope:any:{csv-of-scopes}".
// Authorizes if the JWT contains at least one of the listed scope values.
//
// Register in Program.cs:
//   builder.Services.AddSingleton<IAuthorizationHandler, AnyScopeAuthorizationHandler>();
//   builder.Services.AddAuthorization(options =>
//   {
//       options.AddPolicy("scope:any", policy =>
//           policy.Requirements.Add(new AnyScopeRequirement()));
//   });
//
// The dynamic policy provider resolves "scope:any:{scopes}" at runtime —
// no need to register each combination individually.
// See DynamicAuthorizationPolicyProvider.cs if a provider is wired.
// ─────────────────────────────────────────────────────────────────────────────

public sealed class AnyScopeRequirement(params string[] allowedScopes) : IAuthorizationRequirement
{
    public IReadOnlyList<string> AllowedScopes { get; } = allowedScopes;
}

public sealed class AnyScopeAuthorizationHandler : AuthorizationHandler<AnyScopeRequirement>
{
    private const string ScopeClaimType = "scope";

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        AnyScopeRequirement requirement)
    {
        // Policy name is "scope:any:{scope1,scope2,...}" — parse scopes from it
        var policyName = context.Resource as string
            ?? requirement.AllowedScopes.FirstOrDefault() ?? string.Empty;

        var allowedScopes = requirement.AllowedScopes.Count > 0
            ? requirement.AllowedScopes
            : ParseFromPolicy(policyName);

        var tokenScopes = context.User
            .FindAll(ScopeClaimType)
            .SelectMany(c => c.Value.Split(' ', StringSplitOptions.RemoveEmptyEntries))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        if (allowedScopes.Any(s => tokenScopes.Contains(s)))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }

    private static string[] ParseFromPolicy(string policyName)
    {
        // "scope:any:compliance:read:self,gameday:read,gameday:admin"
        const string prefix = "scope:any:";
        if (!policyName.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            return [];

        return policyName[prefix.Length..]
            .Split(',', StringSplitOptions.RemoveEmptyEntries);
    }
}
