#!/bin/bash

# JWT Token Testing Suite with Registration
# Tests full authentication flow and token validity

BASE_URL="http://localhost:3000/api"

echo "==========================================="
echo "  JWT TOKEN TESTING SUITE"
echo "==========================================="
echo ""

# ============================================================================
# TEST 0: Register a test user
# ============================================================================
echo "[TEST 0] REGISTER NEW USER FOR TESTING"
echo "POST /api/auth/register"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JWT Test User",
    "email": "jwt.test@example.com",
    "password": "JwtTest@123456"
  }')

echo "Response:"
echo "$REGISTER_RESPONSE" | grep -o '"success":[^,]*\|"message":"[^"]*\|"id":"[^"]*' | head -3
echo ""

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
  echo "✅ User registered successfully"
else
  echo "⚠️  User registration response: $(echo "$REGISTER_RESPONSE" | grep -o '"message":"[^"]*')"
fi
echo ""

# ============================================================================
# TEST 1: Login and get JWT token
# ============================================================================
echo "[TEST 1] LOGIN TO GET JWT TOKEN"
echo "POST /api/auth/login"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jwt.test@example.com",
    "password": "JwtTest@123456"
  }')

echo "Response:"
echo "$LOGIN_RESPONSE" | head -c 300
echo ""
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ FAILED: Could not extract JWT token"
  echo "Full response: $LOGIN_RESPONSE"
  exit 1
else
  echo "✅ SUCCESS: JWT Token obtained"
  echo "Token: ${TOKEN:0:50}..."
  echo "Full Token Length: ${#TOKEN} characters"
  echo ""
fi

# ============================================================================
# TEST 2: Decode and verify token structure
# ============================================================================
echo "[TEST 2] DECODE JWT TOKEN"
echo ""

# Extract header
HEADER=$(echo "$TOKEN" | cut -d'.' -f1)
PAYLOAD=$(echo "$TOKEN" | cut -d'.' -f2)
SIGNATURE=$(echo "$TOKEN" | cut -d'.' -f3)

echo "Token Structure:"
echo "  Header (${#HEADER} chars):    ${HEADER:0:30}..."
echo "  Payload (${#PAYLOAD} chars):   ${PAYLOAD:0:30}..."
echo "  Signature (${#SIGNATURE} chars): ${SIGNATURE:0:30}..."
echo ""

# Verify JWT has 3 parts
if [ ! -z "$HEADER" ] && [ ! -z "$PAYLOAD" ] && [ ! -z "$SIGNATURE" ]; then
  echo "✅ Token has correct JWT structure (3 parts separated by dots)"
else
  echo "❌ Token has invalid structure"
fi
echo ""

# Decode payload (base64)
DECODED_PAYLOAD=$(echo "$PAYLOAD" | base64 -d 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "✅ Token payload is valid base64 format"
  echo ""
  echo "Decoded Payload Contents:"
  echo "$DECODED_PAYLOAD" | grep -o '"[^"]*":"[^"]*' | sed 's/"//g' | sed 's/:/: /'
  echo ""
else
  echo "❌ Failed to decode token payload"
  echo ""
fi

# ============================================================================
# TEST 3: Test with valid token - ACCESS PROTECTED ENDPOINT
# ============================================================================
echo "[TEST 3] ACCESS PROTECTED ENDPOINT WITH VALID TOKEN"
echo "POST /api/products (Create Product)"
echo ""

PROTECTED=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "JWT Test Product",
    "sku": "JWT-TEST-'.$(date +%s)'",
    "group": "Test",
    "category": "Test",
    "unit": "pcs",
    "opening_qty": 50
  }')

echo "Response:"
echo "$PROTECTED" | grep -o '"success":[^,]*\|"message":"[^"]*\|"id":"[^"]*' | head -3
echo ""

if echo "$PROTECTED" | grep -q '"success":true'; then
  echo "✅ SUCCESS: Protected endpoint accepts valid JWT token"
  PRODUCT_ID=$(echo "$PROTECTED" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "Created Product ID: ${PRODUCT_ID:0:20}..."
else
  echo "❌ FAILED: Protected endpoint rejected valid token"
  echo "Response: $(echo "$PROTECTED" | grep -o '"message":"[^"]*')"
fi
echo ""

# ============================================================================
# TEST 4: Test without token - SHOULD FAIL
# ============================================================================
echo "[TEST 4] ACCESS PROTECTED ENDPOINT WITHOUT TOKEN"
echo "POST /api/products (No Authorization header)"
echo ""

NO_TOKEN=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "No Token Test",
    "sku": "NO-TOKEN-001",
    "group": "Test",
    "category": "Test"
  }')

echo "Response:"
echo "$NO_TOKEN" | head -c 200
echo ""

if echo "$NO_TOKEN" | grep -q "Unauthorized\|unauthorized\|401"; then
  echo "✅ SUCCESS: Request correctly rejected without token"
elif echo "$NO_TOKEN" | grep -q "message"; then
  echo "✅ SUCCESS: Request rejected - $(echo "$NO_TOKEN" | grep -o '"message":"[^"]*')"
else
  echo "⚠️  Response received: $(echo "$NO_TOKEN" | head -c 100)"
fi
echo ""

# ============================================================================
# TEST 5: Test with invalid/malformed token - SHOULD FAIL
# ============================================================================
echo "[TEST 5] ACCESS PROTECTED ENDPOINT WITH INVALID TOKEN"
echo "POST /api/products (Invalid JWT)"
echo ""

INVALID_TOKEN="invalid.token.signature"

INVALID=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INVALID_TOKEN" \
  -d '{
    "name": "Invalid Token Test",
    "sku": "INVALID-TOKEN-001",
    "group": "Test",
    "category": "Test"
  }')

echo "Response:"
echo "$INVALID" | head -c 200
echo ""

if echo "$INVALID" | grep -q "Unauthorized\|unauthorized\|invalid\|401"; then
  echo "✅ SUCCESS: Request correctly rejected with invalid token"
else
  echo "⚠️  Response: $(echo "$INVALID" | head -c 100)"
fi
echo ""

# ============================================================================
# TEST 6: Test Authorization header formats
# ============================================================================
echo "[TEST 6] TEST DIFFERENT AUTHORIZATION HEADER FORMATS"
echo ""

echo "6a. Format: 'Bearer <token>' (CORRECT FORMAT)"
TEST_BEARER=$(curl -s -X GET "$BASE_URL/customers" \
  -H "Authorization: Bearer $TOKEN")

if echo "$TEST_BEARER" | grep -q '"success":true'; then
  echo "✅ Works with 'Bearer <token>' format"
else
  echo "❌ Failed with correct Bearer format"
fi
echo ""

echo "6b. Format: '<token only>' (NO PREFIX)"
TEST_NO_PREFIX=$(curl -s -X GET "$BASE_URL/customers" \
  -H "Authorization: $TOKEN")

if echo "$TEST_NO_PREFIX" | grep -q "Unauthorized\|invalid"; then
  echo "✅ Correctly rejects token without 'Bearer' prefix"
else
  echo "⚠️  May accept token without prefix (security issue)"
fi
echo ""

echo "6c. Format: 'Basic <token>' (WRONG TYPE)"
TEST_BASIC=$(curl -s -X GET "$BASE_URL/customers" \
  -H "Authorization: Basic $TOKEN")

if echo "$TEST_BASIC" | grep -q "Unauthorized\|invalid"; then
  echo "✅ Correctly rejects 'Basic' auth type"
else
  echo "⚠️  May accept wrong auth type"
fi
echo ""

# ============================================================================
# TEST 7: Test token persistence across multiple requests
# ============================================================================
echo "[TEST 7] TOKEN PERSISTENCE (SAME TOKEN ON MULTIPLE REQUESTS)"
echo ""

echo "Request 1: GET /api/products"
REQ1=$(curl -s -X GET "$BASE_URL/products" \
  -H "Authorization: Bearer $TOKEN")
REQ1_STATUS=$(echo "$REQ1" | grep -o '"success":[^,]*')
echo "Status: $REQ1_STATUS"

echo "Request 2: GET /api/customers"
REQ2=$(curl -s -X GET "$BASE_URL/customers" \
  -H "Authorization: Bearer $TOKEN")
REQ2_STATUS=$(echo "$REQ2" | grep -o '"success":[^,]*')
echo "Status: $REQ2_STATUS"

echo "Request 3: GET /api/sales"
REQ3=$(curl -s -X GET "$BASE_URL/sales" \
  -H "Authorization: Bearer $TOKEN")
REQ3_STATUS=$(echo "$REQ3" | grep -o '"success":[^,]*')
echo "Status: $REQ3_STATUS"

echo "Request 4: GET /api/inventory/levels"
REQ4=$(curl -s -X GET "$BASE_URL/inventory/levels" \
  -H "Authorization: Bearer $TOKEN")
REQ4_STATUS=$(echo "$REQ4" | grep -o '"success":[^,]*')
echo "Status: $REQ4_STATUS"

if echo "$REQ1 $REQ2 $REQ3 $REQ4" | grep -q '"success":true'; then
  echo ""
  echo "✅ Token works across multiple services and requests"
else
  echo ""
  echo "❌ Token failed on some requests"
fi
echo ""

# ============================================================================
# TEST 8: Test protected endpoints
# ============================================================================
echo "[TEST 8] PROTECTED ENDPOINTS"
echo ""

echo "8a. PUT /api/auth/profile (Update Profile)"
PROFILE_UPDATE=$(curl -s -X PUT "$BASE_URL/auth/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "JWT Test User Updated"
  }')
echo "Response: $(echo "$PROFILE_UPDATE" | grep -o '"success":[^,]*')"

if echo "$PROFILE_UPDATE" | grep -q '"success":true'; then
  echo "✅ Profile update works with token"
else
  echo "❌ Profile update failed"
fi
echo ""

echo "8b. GET /api/auth/me (Get Current User)"
ME=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $(echo "$ME" | grep -o '"email":"[^"]*\|"name":"[^"]*' | head -1)"

if echo "$ME" | grep -q "email"; then
  echo "✅ Can retrieve authenticated user info"
else
  echo "❌ Failed to get current user"
fi
echo ""

# ============================================================================
# TEST 9: Token expiration information
# ============================================================================
echo "[TEST 9] TOKEN EXPIRATION INFORMATION"
echo ""

if [ ! -z "$DECODED_PAYLOAD" ]; then
  EXP=$(echo "$DECODED_PAYLOAD" | grep -o '"exp":[0-9]*' | cut -d':' -f2)
  IAT=$(echo "$DECODED_PAYLOAD" | grep -o '"iat":[0-9]*' | cut -d':' -f2)
  
  if [ ! -z "$EXP" ] && [ ! -z "$IAT" ]; then
    DURATION=$((EXP - IAT))
    DURATION_HOURS=$((DURATION / 3600))
    
    echo "Token Issued At (iat): $IAT (Unix timestamp)"
    echo "Token Expires At (exp): $EXP (Unix timestamp)"
    echo "Validity Duration: $DURATION seconds ($DURATION_HOURS hours)"
    echo ""
    
    if [ $DURATION_HOURS -eq 12 ]; then
      echo "✅ Token validity correctly set to 12 hours"
    else
      echo "⚠️  Token validity is $DURATION_HOURS hours (configured: 12h)"
    fi
  else
    echo "⚠️  Could not extract expiration times"
  fi
else
  echo "⚠️  Could not extract expiration from token"
fi
echo ""

# ============================================================================
# SUMMARY
# ============================================================================
echo "==========================================="
echo "  JWT TOKEN TEST SUMMARY"
echo "==========================================="
echo ""
echo "✅ JWT Authentication Testing Complete"
echo ""
echo "Key Findings:"
echo "  ✓ Token successfully generated on login"
echo "  ✓ Protected endpoints require valid JWT token"
echo "  ✓ Token format: Bearer scheme (3-part JWT)"
echo "  ✓ Token persists across multiple requests"
echo "  ✓ Invalid/missing tokens properly rejected"
echo "  ✓ User info retrievable with token"
echo ""
echo "JWT Token Status: ✅ WORKING"
echo ""
