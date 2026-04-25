using Microsoft.AspNetCore.Authorization;

namespace Vai.Api.Infrastructure.Attributes;

// ─────────────────────────────────────────────────────────────────────────────
// AuthorizeAnyScopesAttribute — OR semantics
//
// Unlike AuthorizeScopesAttribute (AND semantics, requires ALL listed scopes),
// this attribute authorizes when the bearer token contains AT LEAST ONE of
// the listed scopes.
//
// Usage:
//   [AuthorizeAnyScopes("compliance:read:self,gameday:read,gameday:admin")]
//
// Register the matching policy handler in Program.cs:
//   builder.Services.AddAuthorization(options =>
//   {
//       // existing AND-scope policies remain untouched
//       options.AddPolicy("scope:any:compliance:read:self,gameday:read,gameday:admin",
//           policy => policy.Requirements.Add(
//               new AnyScopeRequirement("compliance:read:self", "gameday:read", "gameday:admin")));
//   });
//
// Or register a dynamic handler that parses "scope:any:{csv}" policy names
// so individual endpoints do not need manual policy registration.
// See AnyScopeAuthorizationHandler.cs for the dynamic approach.
// ─────────────────────────────────────────────────────────────────────────────

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
public sealed class AuthorizeAnyScopesAttribute : AuthorizeAttribute
{
    public string Scopes { get; }

    public AuthorizeAnyScopesAttribute(string scopes)
    {
        Scopes = scopes;
        Policy = $"scope:any:{scopes}";
    }
}
