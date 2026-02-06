#!/bin/bash

# Tally ERP - Simple API Testing Suite
# Tests all microservices with correct endpoints

BASE_URL="http://localhost:3000/api"
TOKEN=""
CUSTOMER_ID=""
PRODUCT_ID=""
SUPPLIER_ID=""
INVOICE_ID=""

echo "========================================";
echo "  TALLY ERP - API TESTING SUITE         ";
echo "========================================";
echo "";

# ============================================================================
# AUTH SERVICE TESTS
# ============================================================================
echo "[AUTH SERVICE]";
echo "1. Register new user...";
REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123456"
  }');
echo "$REGISTER" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

echo "2. Login...";
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }');
echo "$LOGIN" | grep -q "token" && echo "✓ PASSED" || echo "✗ FAILED";
TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4);
echo "Token: ${TOKEN:0:20}...";
echo "";

# ============================================================================
# PRODUCT SERVICE TESTS
# ============================================================================
echo "[PRODUCT SERVICE]";
echo "3. Create product...";
CREATE_PRODUCT=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Product",
    "sku": "TEST-SKU-001",
    "group": "Electronics",
    "category": "Gadgets",
    "unit": "pcs",
    "opening_qty": 100
  }');
echo "$CREATE_PRODUCT" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
PRODUCT_ID=$(echo "$CREATE_PRODUCT" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4);
echo "Product ID: ${PRODUCT_ID:0:20}...";
echo "";

echo "4. Get all products...";
PRODUCTS=$(curl -s -X GET "$BASE_URL/products" \
  -H "Authorization: Bearer $TOKEN");
echo "$PRODUCTS" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

echo "5. Get product by ID...";
GET_PRODUCT=$(curl -s -X GET "$BASE_URL/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN");
echo "$GET_PRODUCT" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

echo "6. Get products by group...";
GET_GROUP=$(curl -s -X GET "$BASE_URL/products/group/Electronics" \
  -H "Authorization: Bearer $TOKEN");
echo "$GET_GROUP" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

echo "7. Toggle product status...";
TOGGLE=$(curl -s -X PATCH "$BASE_URL/products/$PRODUCT_ID/toggle" \
  -H "Authorization: Bearer $TOKEN");
echo "$TOGGLE" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

# ============================================================================
# INVENTORY SERVICE TESTS
# ============================================================================
echo "[INVENTORY SERVICE]";
echo "8. Get inventory levels...";
LEVELS=$(curl -s -X GET "$BASE_URL/inventory/levels" \
  -H "Authorization: Bearer $TOKEN");
echo "$LEVELS" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

echo "9. Record stock movement (IN)...";
INWARD=$(curl -s -X POST "$BASE_URL/inventory" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"product_id\": \"$PRODUCT_ID\",
    \"type\": \"IN\",
    \"quantity\": 50,
    \"reference\": \"PO-001\"
  }");
echo "$INWARD" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

echo "10. Get inventory summary...";
SUMMARY=$(curl -s -X GET "$BASE_URL/inventory/summary" \
  -H "Authorization: Bearer $TOKEN");
echo "$SUMMARY" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

# ============================================================================
# CUSTOMER SERVICE TESTS
# ============================================================================
echo "[CUSTOMER SERVICE]";
echo "11. Create customer...";
CREATE_CUSTOMER=$(curl -s -X POST "$BASE_URL/customers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Customer",
    "email": "customer@example.com",
    "phone": "9876543210",
    "address": "123 Test Street"
  }');
echo "$CREATE_CUSTOMER" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
CUSTOMER_ID=$(echo "$CREATE_CUSTOMER" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4);
echo "Customer ID: ${CUSTOMER_ID:0:20}...";
echo "";

echo "12. Get all customers...";
CUSTOMERS=$(curl -s -X GET "$BASE_URL/customers" \
  -H "Authorization: Bearer $TOKEN");
echo "$CUSTOMERS" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

# ============================================================================
# SALES SERVICE TESTS
# ============================================================================
echo "[SALES SERVICE]";
if [ ! -z "$CUSTOMER_ID" ] && [ ! -z "$PRODUCT_ID" ]; then
  echo "13. Create sale...";
  CREATE_SALE=$(curl -s -X POST "$BASE_URL/sales" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"customer_id\": \"$CUSTOMER_ID\",
      \"product_id\": \"$PRODUCT_ID\",
      \"quantity\": 5,
      \"unit_price\": 1000
    }");
  echo "$CREATE_SALE" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
  echo "";
fi

echo "14. Get all sales...";
SALES=$(curl -s -X GET "$BASE_URL/sales" \
  -H "Authorization: Bearer $TOKEN");
echo "$SALES" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

echo "15. Get sales summary...";
SALES_SUMMARY=$(curl -s -X GET "$BASE_URL/sales/summary" \
  -H "Authorization: Bearer $TOKEN");
echo "$SALES_SUMMARY" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

# ============================================================================
# SUPPLIER SERVICE TESTS
# ============================================================================
echo "[SUPPLIER SERVICE]";
echo "16. Create supplier...";
CREATE_SUPPLIER=$(curl -s -X POST "$BASE_URL/suppliers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Supplier",
    "email": "supplier@example.com",
    "phone": "9876543211",
    "address": "456 Supplier Lane"
  }');
echo "$CREATE_SUPPLIER" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
SUPPLIER_ID=$(echo "$CREATE_SUPPLIER" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4);
echo "Supplier ID: ${SUPPLIER_ID:0:20}...";
echo "";

echo "17. Get all suppliers...";
SUPPLIERS=$(curl -s -X GET "$BASE_URL/suppliers" \
  -H "Authorization: Bearer $TOKEN");
echo "$SUPPLIERS" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

# ============================================================================
# PURCHASE SERVICE TESTS
# ============================================================================
echo "[PURCHASE SERVICE]";
if [ ! -z "$SUPPLIER_ID" ] && [ ! -z "$PRODUCT_ID" ]; then
  echo "18. Create purchase...";
  CREATE_PURCHASE=$(curl -s -X POST "$BASE_URL/purchases" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"supplier_id\": \"$SUPPLIER_ID\",
      \"product_id\": \"$PRODUCT_ID\",
      \"quantity\": 100,
      \"unit_price\": 500
    }");
  echo "$CREATE_PURCHASE" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
  echo "";
fi

echo "19. Get all purchases...";
PURCHASES=$(curl -s -X GET "$BASE_URL/purchases" \
  -H "Authorization: Bearer $TOKEN");
echo "$PURCHASES" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

echo "20. Get purchases summary...";
PURCHASE_SUMMARY=$(curl -s -X GET "$BASE_URL/purchases/summary" \
  -H "Authorization: Bearer $TOKEN");
echo "$PURCHASE_SUMMARY" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

# ============================================================================
# INVOICE SERVICE TESTS
# ============================================================================
echo "[INVOICE SERVICE]";
if [ ! -z "$CUSTOMER_ID" ] && [ ! -z "$PRODUCT_ID" ]; then
  echo "21. Create invoice...";
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
          \"unitPrice\": 1000
        }
      ],
      \"tax\": 50,
      \"discount\": 100
    }");
  echo "$CREATE_INVOICE" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
  INVOICE_ID=$(echo "$CREATE_INVOICE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4);
  echo "Invoice ID: ${INVOICE_ID:0:20}...";
  echo "";
fi

echo "22. Get all invoices...";
INVOICES=$(curl -s -X GET "$BASE_URL/invoices" \
  -H "Authorization: Bearer $TOKEN");
echo "$INVOICES" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

echo "23. Get invoices by status...";
STATUS_INVOICES=$(curl -s -X GET "$BASE_URL/invoices/status/DRAFT" \
  -H "Authorization: Bearer $TOKEN");
echo "$STATUS_INVOICES" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

echo "24. Get invoice summary...";
INVOICE_SUMMARY=$(curl -s -X GET "$BASE_URL/invoices/summary" \
  -H "Authorization: Bearer $TOKEN");
echo "$INVOICE_SUMMARY" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

if [ ! -z "$INVOICE_ID" ]; then
  echo "25. Send invoice...";
  SEND=$(curl -s -X POST "$BASE_URL/invoices/$INVOICE_ID/send" \
    -H "Authorization: Bearer $TOKEN");
  echo "$SEND" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
  echo "";

  echo "26. Record payment on invoice...";
  PAYMENT=$(curl -s -X POST "$BASE_URL/invoices/$INVOICE_ID/payment" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "amount": 2000,
      "paymentMethod": "cash"
    }');
  echo "$PAYMENT" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
  echo "";
fi

echo "27. Get overdue invoices...";
OVERDUE=$(curl -s -X GET "$BASE_URL/invoices/overdue" \
  -H "Authorization: Bearer $TOKEN");
echo "$OVERDUE" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

# ============================================================================
# API INFO
# ============================================================================
echo "[API GATEWAY]";
echo "28. Health check...";
HEALTH=$(curl -s -X GET "$BASE_URL/health");
echo "$HEALTH" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

echo "29. API Info...";
INFO=$(curl -s -X GET "$BASE_URL/info");
echo "$INFO" | grep -q "success" && echo "✓ PASSED" || echo "✗ FAILED";
echo "";

# ============================================================================
# SUMMARY
# ============================================================================
echo "========================================";
echo "  TESTING COMPLETE                     ";
echo "========================================";
echo "";
echo "Extracted IDs:";
echo "  Token: ${TOKEN:0:30}...";
echo "  Product ID: $PRODUCT_ID";
echo "  Customer ID: $CUSTOMER_ID";
echo "  Supplier ID: $SUPPLIER_ID";
echo "  Invoice ID: $INVOICE_ID";
