using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Vai.Api.Features.Avanti.Core;
using Vai.Api.Features.ClubOS.Avanti.Adapters;
using Vai.Api.Infrastructure.Auth;

namespace Vai.Api.Features.Avanti;

// ─────────────────────────────────────────────────────────────────────────────
// AvantiDependencyResolution
//
// Per-feature static Configure() — called from central DependencyResolution.cs:
//   AvantiDependencyResolution.Configure(configuration, services);
//
// DO NOT inline registrations in central DependencyResolution.cs.
// ─────────────────────────────────────────────────────────────────────────────

public static class AvantiDependencyResolution
{
    public static void Configure(IConfiguration configuration, IServiceCollection services)
    {
        // Core AVANTI OS Brain services
        services.AddScoped<IAvantiActionService, AvantiActionService>();
        services.AddScoped<IAvantiActionRunWriter, AvantiActionRunWriter>();
        services.AddScoped<IAvantiProactiveScanWriter, AvantiProactiveScanWriter>();

        // Club OS feature adapters
        // Each adapter resolves by FeatureKey from the DI collection.
        // The AvantiActionService resolves IEnumerable<IAvantiFeatureAdapter>
        // and finds the matching adapter by FeatureKey.
        services.AddScoped<IAvantiFeatureAdapter, PlayStatusAvantiAdapter>();
        services.AddScoped<IAvantiFeatureAdapter, RosterAvantiAdapter>();
        services.AddScoped<IAvantiFeatureAdapter, TournamentAvantiAdapter>();
        services.AddScoped<IAvantiFeatureAdapter, StandingsAvantiAdapter>();
        services.AddScoped<IAvantiFeatureAdapter, ExceptionsAvantiAdapter>();

        // OR-scope authorization handler for mixed-scope endpoints
        // (e.g. compliance endpoints that accept compliance:read:self OR gameday:read)
        services.AddSingleton<IAuthorizationHandler, AnyScopeAuthorizationHandler>();

        // Francis: if using a dynamic policy provider, register it here.
        // If registering named policies individually, add them in Program.cs
        // under builder.Services.AddAuthorization(options => { ... }).
    }
}
