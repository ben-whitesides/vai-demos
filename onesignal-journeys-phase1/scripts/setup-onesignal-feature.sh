#!/bin/bash
# Setup script for OneSignal Journeys Phase 1 implementation
# Run this once before starting JourneyOrchestrationService implementation

set -e

echo "🚀 Setting up OneSignal Journeys Phase 1 for implementation..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Verify database connectivity
echo "${BLUE}[1/4]${NC} Checking database connectivity..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql not found. Skipping database check."
    echo "   You'll need to run migrations manually:"
    echo "   psql -U postgres -d vai_api -f Vai.Database/Scripts/055_JourneyTemplatesAndStates.sql"
    echo "   psql -U postgres -d vai_api -f Vai.Database/Scripts/056_NotificationDeliveryTracking.sql"
else
    DB_HOST="${DB_HOST:-localhost}"
    DB_NAME="${DB_NAME:-vai_api}"
    DB_USER="${DB_USER:-postgres}"

    if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
        echo "${GREEN}✓${NC} Database connection OK"
    else
        echo "❌ Could not connect to database at $DB_HOST"
        echo "   Set DB_HOST, DB_NAME, DB_USER environment variables and try again"
        exit 1
    fi
fi

# Step 2: Verify feature structure
echo ""
echo "${BLUE}[2/4]${NC} Verifying OneSignal feature structure..."
required_files=(
    "Services/IJourneyOrchestrationService.cs"
    "Services/JourneyOrchestrationService.cs"
    "Models/JourneyModels.cs"
    "Jobs/ProcessPendingJourneyStepsHostedService.cs"
    "INTEGRATION_POINTS.md"
    "Scripts/generate-method-stubs.sh"
)

missing=0
for file in "${required_files[@]}"; do
    if [ -f "Vai.Api/Features/Notifications/$file" ]; then
        echo "${GREEN}✓${NC} $file"
    else
        echo "❌ Missing: $file"
        missing=$((missing + 1))
    fi
done

if [ $missing -gt 0 ]; then
    echo ""
    echo "❌ $missing files missing. Scaffold incomplete."
    exit 1
fi

# Step 3: Check DI registration
echo ""
echo "${BLUE}[3/4]${NC} Checking DI registration in Program.cs..."
if grep -q "AddScoped<IJourneyOrchestrationService, JourneyOrchestrationService>" Vai.Api/Program.cs; then
    echo "${GREEN}✓${NC} IJourneyOrchestrationService registered in DI"
else
    echo "⚠️  IJourneyOrchestrationService NOT registered in Program.cs"
    echo "   Add these lines to Program.cs (around other .AddScoped calls):"
    echo "   ${BLUE}builder.Services.AddScoped<IJourneyOrchestrationService, JourneyOrchestrationService>();${NC}"
    echo "   ${BLUE}builder.Services.AddHostedService<ProcessPendingJourneyStepsHostedService>();${NC}"
fi

# Step 4: Summary
echo ""
echo "${BLUE}[4/4]${NC} Setup summary..."
echo ""
echo "${GREEN}✓ OneSignal Journeys scaffold ready for implementation${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. Add DI registration to Program.cs (if not already done)"
echo "  2. Run database migrations: psql -U postgres -d vai_api -f Vai.Database/Scripts/055_JourneyTemplatesAndStates.sql"
echo "  3. Verify 11 journey templates seeded: SELECT COUNT(*) FROM journey_templates;"
echo "  4. Review INTEGRATION_POINTS.md for what to integrate"
echo "  5. Implement JourneyOrchestrationService methods (6 total)"
echo "  6. Add journey event emission to 6 existing services"
echo "  7. Test with: bash Vai.Api/Features/Notifications/Scripts/test-journey-integration.sh"
echo ""
echo "📚 Reference files:"
echo "  - README.md                                    (architecture overview)"
echo "  - INTEGRATION_POINTS.md                        (where to add event emission)"
echo "  - Services/IJourneyOrchestrationService.cs    (method signatures + XML docs)"
echo "  - Services/JourneyOrchestrationService.cs     (stubs to implement)"
echo "  - generate-method-stubs.sh                     (SQL hints for each method)"
echo ""
echo "✅ Ready to build!"
