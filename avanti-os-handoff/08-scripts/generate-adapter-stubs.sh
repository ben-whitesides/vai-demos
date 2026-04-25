#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# VAI AVANTI OS Brain — Generate Adapter Stubs
# Outputs a ready-to-paste C# DI registration block +
# stub file list so Francis can wire everything in one shot.
# Usage: bash generate-adapter-stubs.sh
# ─────────────────────────────────────────────────────────────

VAI_API_ROOT="${VAI_API_ROOT:-./vai-api}"
ADAPTER_DIR="$VAI_API_ROOT/Features/ClubOS/Avanti/Adapters"

cat << 'EOF'
// ═══════════════════════════════════════════════════════════════
// STEP 1: Create the Adapters folder
// ═══════════════════════════════════════════════════════════════
// mkdir -p vai-api/Features/ClubOS/Avanti/Adapters
//
// Copy these 5 files from 07-club-os-adapters/ into that folder:
//   PlayStatusAvantiAdapter.cs
//   RosterAvantiAdapter.cs
//   TournamentAvantiAdapter.cs
//   StandingsAvantiAdapter.cs
//   ExceptionsAvantiAdapter.cs
//
// Also copy from 04-core-interfaces/:
//   IAvantiFeatureAdapter.cs     → Features/Avanti/Core/
//   AvantiActionV1Controller.cs  → Features/Avanti/
//   AuthorizeAnyScopesAttribute.cs → Infrastructure/Attributes/
//   AnyScopeAuthorizationHandler.cs → Infrastructure/Auth/

// ═══════════════════════════════════════════════════════════════
// STEP 2: Add to DependencyResolution.cs (or equivalent)
// ═══════════════════════════════════════════════════════════════

// AVANTI OS Brain — Feature Adapters
services.AddScoped<IAvantiFeatureAdapter, PlayStatusAvantiAdapter>();
services.AddScoped<IAvantiFeatureAdapter, RosterAvantiAdapter>();
services.AddScoped<IAvantiFeatureAdapter, TournamentAvantiAdapter>();
services.AddScoped<IAvantiFeatureAdapter, StandingsAvantiAdapter>();
services.AddScoped<IAvantiFeatureAdapter, ExceptionsAvantiAdapter>();

// AVANTI Action Service (resolves adapters from DI)
services.AddScoped<IAvantiActionService, AvantiActionService>();
services.AddScoped<IAvantiActionRunWriter, AvantiActionRunWriter>();

// OR-scope authorization handler
services.AddSingleton<IAuthorizationHandler, AnyScopeAuthorizationHandler>();

// ═══════════════════════════════════════════════════════════════
// STEP 3: Register OR-scope policy in Program.cs
// ═══════════════════════════════════════════════════════════════
// The dynamic policy approach — handles any "scope:any:{csv}" policy
// without registering each combination individually:

builder.Services.AddSingleton<IAuthorizationPolicyProvider, DynamicAnyScopePolicyProvider>();
// See: https://learn.microsoft.com/en-us/aspnet/core/security/authorization/iauthorizationpolicyprovider

// ═══════════════════════════════════════════════════════════════
// STEP 4: Run migration 061 first
// ═══════════════════════════════════════════════════════════════
// psql $DATABASE_URL < 02-data-model/061_home_screen_grid.sql
// -- creates: user_preferences, avanti_action_runs, avanti_proactive_scan_runs

// ═══════════════════════════════════════════════════════════════
// STEP 5: Run preflight check
// ═══════════════════════════════════════════════════════════════
// bash 08-scripts/setup-avanti-feature.sh

// ═══════════════════════════════════════════════════════════════
// STEP 6: Implement IAvantiActionService
// ═══════════════════════════════════════════════════════════════
// The controller wires to IAvantiActionService which:
//   - Resolves the correct IAvantiFeatureAdapter by FeatureKey
//   - Calls PrepareAsync / ExecuteAsync
//   - Writes avanti_action_runs via IAvantiActionRunWriter
//   - Enforces Red cannot execute (DB constraint backs this up)
//   - Enforces Yellow requires confirmation before execute

// ═══════════════════════════════════════════════════════════════
// STEP 7: Validate
// ═══════════════════════════════════════════════════════════════
// API_URL=http://localhost:5000 USER_TOKEN=... bash 08-scripts/validate-avanti-endpoints.sh

EOF
