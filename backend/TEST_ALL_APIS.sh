#!/bin/bash

# Tally ERP - Complete API Testing Suite
# Tests all microservices: Auth, Product, Inventory, Sales, Purchase, Invoice

BASE_URL="http://localhost:3000/api"
TOKEN=""
CUSTOMER_ID=""
PRODUCT_ID=""
SUPPLIER_ID=""
INVOICE_ID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TALLY ERP - API TESTING SUITE${NC}"
echo -e "${BLUE}========================================${NC}\n"

# ============================================================================
# AUTH SERVICE TESTS
# ============================================================================
echo -e "${YELLOW}[1] TESTING AUTH SERVICE${NC}\n"

# Register new user
echo -e "${BLUE}Testing: POST /auth/register${NC}"
REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123456"
  }')
echo "Response: $REGISTER"
echo ""

# Login
echo -e "${BLUE}Testing: POST /auth/login${NC}"
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }')
echo "Response: $LOGIN"
TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Extracted Token: $TOKEN"
echo ""

# Get current user
echo -e "${BLUE}Testing: GET /auth/me${NC}"
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n\n"

# Update profile
echo -e "${BLUE}Testing: PUT /auth/profile${NC}"
curl -s -X PUT "$BASE_URL/auth/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Test User",
    "email": "test@example.com"
  }' | head -c 200
echo -e "\n\n"

# ============================================================================
# PRODUCT SERVICE TESTS
# ============================================================================
echo -e "${YELLOW}[2] TESTING PRODUCT SERVICE${NC}\n"

# Create product
echo -e "${BLUE}Testing: POST /products (Create)${NC}"
CREATE_PRODUCT=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Product",
    "sku": "TEST-001",
    "group": "Electronics",
    "category": "Gadgets",
    "unit": "pcs",
    "opening_qty": 100,
    "item_type": "FINISHED"
  }')
echo "Response: $CREATE_PRODUCT"
PRODUCT_ID=$(echo "$CREATE_PRODUCT" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Extracted Product ID: $PRODUCT_ID"
echo ""

# Get all products
echo -e "${BLUE}Testing: GET /products (Get All)${NC}"
curl -s -X GET "$BASE_URL/products" \
  -H "Authorization: Bearer $TOKEN" | head -c 300
echo -e "\n\n"

# Get product by ID
if [ ! -z "$PRODUCT_ID" ]; then
  echo -e "${BLUE}Testing: GET /products/{id}${NC}"
  curl -s -X GET "$BASE_URL/products/$PRODUCT_ID" \
    -H "Authorization: Bearer $TOKEN" | head -c 200
  echo -e "\n\n"
fi

# Search by group
echo -e "${BLUE}Testing: GET /products/group/Electronics${NC}"
curl -s -X GET "$BASE_URL/products/group/Electronics" \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n\n"

# Toggle status
if [ ! -z "$PRODUCT_ID" ]; then
  echo -e "${BLUE}Testing: PATCH /products/{id}/toggle-status${NC}"
  curl -s -X PATCH "$BASE_URL/products/$PRODUCT_ID/toggle-status" \
    -H "Authorization: Bearer $TOKEN" | head -c 200
  echo -e "\n\n"
fi

# ============================================================================
# INVENTORY SERVICE TESTS
# ============================================================================
echo -e "${YELLOW}[3] TESTING INVENTORY SERVICE${NC}\n"

# Get inventory levels
echo -e "${BLUE}Testing: GET /inventory/levels${NC}"
curl -s -X GET "$BASE_URL/inventory/levels" \
  -H "Authorization: Bearer $TOKEN" | head -c 300
echo -e "\n\n"

# Record inward movement
if [ ! -z "$PRODUCT_ID" ]; then
  echo -e "${BLUE}Testing: POST /inventory/inward${NC}"
  curl -s -X POST "$BASE_URL/inventory/inward" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"product_id\": \"$PRODUCT_ID\",
      \"quantity\": 50,
      \"reference\": \"PO-001\"
    }" | head -c 200
  echo -e "\n\n"
fi

# Record outward movement
if [ ! -z "$PRODUCT_ID" ]; then
  echo -e "${BLUE}Testing: POST /inventory/outward${NC}"
  curl -s -X POST "$BASE_URL/inventory/outward" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"product_id\": \"$PRODUCT_ID\",
      \"quantity\": 10,
      \"reference\": \"SO-001\"
    }" | head -c 200
  echo -e "\n\n"
fi

# Get inventory summary
echo -e "${BLUE}Testing: GET /inventory/summary${NC}"
curl -s -X GET "$BASE_URL/inventory/summary" \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n\n"

# ============================================================================
# CUSTOMER SERVICE TESTS (via Sales Service)
# ============================================================================
echo -e "${YELLOW}[4] TESTING CUSTOMER SERVICE${NC}\n"

# Create customer
echo -e "${BLUE}Testing: POST /customers (Create)${NC}"
CREATE_CUSTOMER=$(curl -s -X POST "$BASE_URL/customers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Customer",
    "email": "customer@example.com",
    "phone": "9876543210",
    "address": "123 Test Street"
  }')
echo "Response: $CREATE_CUSTOMER"
CUSTOMER_ID=$(echo "$CREATE_CUSTOMER" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Extracted Customer ID: $CUSTOMER_ID"
echo ""

# Get all customers
echo -e "${BLUE}Testing: GET /customers (Get All)${NC}"
curl -s -X GET "$BASE_URL/customers" \
  -H "Authorization: Bearer $TOKEN" | head -c 300
echo -e "\n\n"

# ============================================================================
# SALES SERVICE TESTS
# ============================================================================
echo -e "${YELLOW}[5] TESTING SALES SERVICE${NC}\n"

# Create sale
if [ ! -z "$CUSTOMER_ID" ] && [ ! -z "$PRODUCT_ID" ]; then
  echo -e "${BLUE}Testing: POST /sales (Create)${NC}"
  CREATE_SALE=$(curl -s -X POST "$BASE_URL/sales" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"customer_id\": \"$CUSTOMER_ID\",
      \"product_id\": \"$PRODUCT_ID\",
      \"quantity\": 5,
      \"unit_price\": 1000
    }")
  echo "Response: $CREATE_SALE"
  echo ""
fi

# Get all sales
echo -e "${BLUE}Testing: GET /sales (Get All)${NC}"
curl -s -X GET "$BASE_URL/sales" \
  -H "Authorization: Bearer $TOKEN" | head -c 300
echo -e "\n\n"

# Get sales summary
echo -e "${BLUE}Testing: GET /sales/summary${NC}"
curl -s -X GET "$BASE_URL/sales/summary" \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n\n"

# ============================================================================
# SUPPLIER SERVICE TESTS (via Purchase Service)
# ============================================================================
echo -e "${YELLOW}[6] TESTING SUPPLIER SERVICE${NC}\n"

# Create supplier
echo -e "${BLUE}Testing: POST /suppliers (Create)${NC}"
CREATE_SUPPLIER=$(curl -s -X POST "$BASE_URL/suppliers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Supplier",
    "email": "supplier@example.com",
    "phone": "9876543211",
    "address": "456 Supplier Lane",
    "contact": "Mr. John"
  }')
echo "Response: $CREATE_SUPPLIER"
SUPPLIER_ID=$(echo "$CREATE_SUPPLIER" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Extracted Supplier ID: $SUPPLIER_ID"
echo ""

# Get all suppliers
echo -e "${BLUE}Testing: GET /suppliers (Get All)${NC}"
curl -s -X GET "$BASE_URL/suppliers" \
  -H "Authorization: Bearer $TOKEN" | head -c 300
echo -e "\n\n"

# ============================================================================
# PURCHASE SERVICE TESTS
# ============================================================================
echo -e "${YELLOW}[7] TESTING PURCHASE SERVICE${NC}\n"

# Create purchase
if [ ! -z "$SUPPLIER_ID" ] && [ ! -z "$PRODUCT_ID" ]; then
  echo -e "${BLUE}Testing: POST /purchases (Create)${NC}"
  CREATE_PURCHASE=$(curl -s -X POST "$BASE_URL/purchases" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"supplier_id\": \"$SUPPLIER_ID\",
      \"product_id\": \"$PRODUCT_ID\",
      \"quantity\": 100,
      \"unit_price\": 500
    }")
  echo "Response: $CREATE_PURCHASE"
  echo ""
fi

# Get all purchases
echo -e "${BLUE}Testing: GET /purchases (Get All)${NC}"
curl -s -X GET "$BASE_URL/purchases" \
  -H "Authorization: Bearer $TOKEN" | head -c 300
echo -e "\n\n"

# Get purchase summary
echo -e "${BLUE}Testing: GET /purchases/summary${NC}"
curl -s -X GET "$BASE_URL/purchases/summary" \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n\n"

# ============================================================================
# INVOICE SERVICE TESTS
# ============================================================================
echo -e "${YELLOW}[8] TESTING INVOICE SERVICE${NC}\n"

# Create invoice
if [ ! -z "$CUSTOMER_ID" ] && [ ! -z "$PRODUCT_ID" ]; then
  echo -e "${BLUE}Testing: POST /invoices (Create)${NC}"
  CREATE_INVOICE=$(curl -s -X POST "$BASE_URL/invoices" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"customer_id\": \"$CUSTOMER_ID\",
      \"issue_date\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\",
      \"due_date\": \"$(date -u -d '+30 days' +'%Y-%m-%dT%H:%M:%SZ')\",
      \"items\": [
        {
          \"product_id\": \"$PRODUCT_ID\",
          \"quantity\": 5,
          \"unit_price\": 1000
        }
      ],
      \"tax\": 50,
      \"discount\": 100
    }")
  echo "Response: $CREATE_INVOICE"
  INVOICE_ID=$(echo "$CREATE_INVOICE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "Extracted Invoice ID: $INVOICE_ID"
  echo ""
fi

# Get all invoices
echo -e "${BLUE}Testing: GET /invoices (Get All)${NC}"
curl -s -X GET "$BASE_URL/invoices" \
  -H "Authorization: Bearer $TOKEN" | head -c 300
echo -e "\n\n"

# Get invoices by customer
if [ ! -z "$CUSTOMER_ID" ]; then
  echo -e "${BLUE}Testing: GET /invoices/customer/{customerId}${NC}"
  curl -s -X GET "$BASE_URL/invoices/customer/$CUSTOMER_ID" \
    -H "Authorization: Bearer $TOKEN" | head -c 200
  echo -e "\n\n"
fi

# Get invoices by status
echo -e "${BLUE}Testing: GET /invoices/status/DRAFT${NC}"
curl -s -X GET "$BASE_URL/invoices/status/DRAFT" \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n\n"

# Get invoice summary
echo -e "${BLUE}Testing: GET /invoices/summary${NC}"
curl -s -X GET "$BASE_URL/invoices/summary" \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n\n"

# Send invoice
if [ ! -z "$INVOICE_ID" ]; then
  echo -e "${BLUE}Testing: POST /invoices/{id}/send${NC}"
  curl -s -X POST "$BASE_URL/invoices/$INVOICE_ID/send" \
    -H "Authorization: Bearer $TOKEN" | head -c 200
  echo -e "\n\n"
fi

# Record payment
if [ ! -z "$INVOICE_ID" ]; then
  echo -e "${BLUE}Testing: POST /invoices/{id}/payment${NC}"
  curl -s -X POST "$BASE_URL/invoices/$INVOICE_ID/payment" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "amount": 2000,
      "payment_method": "cash",
      "notes": "Partial payment"
    }' | head -c 200
  echo -e "\n\n"
fi

# Get overdue invoices
echo -e "${BLUE}Testing: GET /invoices/overdue${NC}"
curl -s -X GET "$BASE_URL/invoices/overdue" \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo -e "\n\n"

# ============================================================================
# API INFO & HEALTH
# ============================================================================
echo -e "${YELLOW}[9] API GATEWAY INFO${NC}\n"

echo -e "${BLUE}Testing: GET /api/health${NC}"
curl -s -X GET "$BASE_URL/health" | head -c 300
echo -e "\n\n"

echo -e "${BLUE}Testing: GET /api/info${NC}"
curl -s -X GET "$BASE_URL/info" | head -c 500
echo -e "\n\n"

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  TESTING COMPLETE${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Extracted IDs for Reference:"
echo "  Token: $TOKEN"
echo "  Product ID: $PRODUCT_ID"
echo "  Customer ID: $CUSTOMER_ID"
echo "  Supplier ID: $SUPPLIER_ID"
echo "  Invoice ID: $INVOICE_ID"
echo ""
