#!/bin/bash

# Quick AI Validation Test
# Tests all AI endpoints with sample data

echo "🧪 Quick AI Validation Test"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

# Test 1: Check if server is running
echo "1️⃣ Checking if server is running..."
if curl -s -f "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running. Start with: npm run dev${NC}"
    exit 1
fi

# Test 2: Check Anthropic API Key
echo ""
echo "2️⃣ Checking Anthropic API Key..."
if [ -z "$ANTHROPIC_API_KEY" ]; then
    if [ -f .env.local ]; then
        if grep -q "ANTHROPIC_API_KEY" .env.local; then
            echo -e "${GREEN}✅ ANTHROPIC_API_KEY found in .env.local${NC}"
        else
            echo -e "${YELLOW}⚠️  ANTHROPIC_API_KEY not found in .env.local${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    fi
else
    echo -e "${GREEN}✅ ANTHROPIC_API_KEY is set${NC}"
fi

# Test 3: Test analyze-idea endpoint (will fail with 404, but endpoint exists)
echo ""
echo "3️⃣ Testing /api/analyze-idea endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/analyze-idea" \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "00000000-0000-0000-0000-000000000000"}' 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Endpoint exists (returned $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected response: $HTTP_CODE${NC}"
fi

# Test 4: Test feedback endpoint
echo ""
echo "4️⃣ Testing /api/ideas/feedback endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/ideas/feedback" \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "00000000-0000-0000-0000-000000000000"}' 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Endpoint exists (returned $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected response: $HTTP_CODE${NC}"
fi

# Test 5: Run TypeScript validation test
echo ""
echo "5️⃣ Running TypeScript validation tests..."
if command -v npx &> /dev/null; then
    npx tsx scripts/test-ai-validation.ts
else
    echo -e "${YELLOW}⚠️  npx not found. Install Node.js and npm${NC}"
fi

echo ""
echo "============================"
echo "✅ Quick validation complete!"
echo ""
echo "📖 For detailed testing, see: docs/ai-validation-guide.md"

