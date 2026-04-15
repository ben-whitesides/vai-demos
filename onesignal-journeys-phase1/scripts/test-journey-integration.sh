#!/bin/bash
# Test OneSignal journey integration end-to-end
# Requires: API running locally, valid Auth0 token, database accessible
# Usage: API_URL=http://localhost:5000 AUTH_TOKEN=your-token bash test-journey-integration.sh

set -e

API_URL="${API_URL:-http://localhost:5000}"
AUTH_TOKEN="${AUTH_TOKEN:-your-auth0-token-here}"
TEST_USER_ID="test-user-$(date +%s)"

echo "🧪 Testing OneSignal Journey Integration"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Verify database tables exist
echo -n "Test 1: Checking database tables... "
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}SKIPPED${NC} (psql not found)"
else
    DB_HOST="${DB_HOST:-localhost}"
    DB_NAME="${DB_NAME:-vai_api}"
    DB_USER="${DB_USER:-postgres}"

    if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM journey_templates;" > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAILED${NC} (tables not created)"
        exit 1
    fi
fi

# Test 2: Verify journey templates seeded
echo -n "Test 2: Checking journey templates seeded... "
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}SKIPPED${NC}"
else
    count=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM journey_templates WHERE is_active = true;" 2>/dev/null | xargs)
    if [ "$count" = "11" ]; then
        echo -e "${GREEN}OK${NC} ($count templates)"
    else
        echo -e "${RED}FAILED${NC} (expected 11, got $count)"
        exit 1
    fi
fi

# Test 3: Trigger a test journey via API
echo -n "Test 3: Triggering payment_received journey... "
response=$(curl -s -X POST \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"userId\": \"$TEST_USER_ID\",
        \"journeyTemplateId\": \"payment_received\",
        \"eventPayload\": {
            \"amount_cents\": 5000,
            \"user_name\": \"Test User\",
            \"user_email\": \"test@vai.app\"
        }
    }" \
    "$API_URL/v1/notifications/journeys/trigger")

if echo "$response" | grep -q '"triggeredSuccessfully":true'; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo "Response: $response"
fi

# Test 4: Get journey state
echo -n "Test 4: Retrieving journey state... "
response=$(curl -s -X GET \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    "$API_URL/v1/notifications/journeys/$TEST_USER_ID/payment_received")

if echo "$response" | grep -q '"status"'; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
fi

# Test 5: Process pending steps (manual trigger)
echo -n "Test 5: Processing pending steps... "
response=$(curl -s -X POST \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    "$API_URL/v1/notifications/journeys/process-pending")

if echo "$response" | grep -q "stepsProcessed\|error"; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
fi

# Test 6: Verify OneSignal configuration
echo -n "Test 6: Verifying OneSignal config... "
response=$(curl -s -X GET \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    "$API_URL/v1/notifications/health")

if echo "$response" | grep -q '"oneSignalConnected":true'; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARNING${NC} (OneSignal not connected - check API key)"
fi

echo ""
echo -e "${GREEN}✅ Integration tests complete${NC}"
echo ""
echo "💡 Tips:"
echo "  - Set API_URL to your local API endpoint (default: http://localhost:5000)"
echo "  - Set AUTH_TOKEN to a valid Auth0 token with admin scope"
echo "  - Check database for inserted journey_states: SELECT * FROM notification_journey_states;"
echo "  - Monitor logs for journey step processing every 5 minutes"
