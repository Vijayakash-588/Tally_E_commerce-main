# Tally ERP - Microservice Architecture

## Overview

The Tally ERP backend has been refactored to use a **microservice architecture**. Each major feature of the ERP is now an independent service with its own controllers, routes, and business logic.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (app.js)                       │
│                                                                  │
│  - Security (Helmet, CORS, XSS, HPP)                           │
│  - Rate Limiting                                               │
│  - Health Checks                                               │
│  - Error Handling                                              │
└────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┬─────────────────┬──────────────────┐
        │                   │                   │                 │                  │
   ┌────▼──────┐   ┌────────▼────────┐  ┌──────▼─────────┐  ┌────▼────────┐  ┌──────▼──────────┐
   │   Auth    │   │    Product      │  │   Inventory    │  │   Sales     │  │   Purchase      │
   │ Service   │   │    Service      │  │    Service     │  │   Service   │  │    Service      │
   ├───────────┤   ├────────────────┤  ├────────────────┤  ├─────────────┤  ├─────────────────┤
   │ •Register │   │ •CRUD Products  │  │ •Stock Level   │  │ •Sales Mgmt │  │ •Purchase Mgmt  │
   │ •Login    │   │ •Search/Filter  │  │ •Movements     │  │ •Customers  │  │ •Suppliers      │
   │ •Profile  │   │ •Toggle Status  │  │ • IN/OUT Track │  │ •Analytics  │  │ •Analytics      │
   │ •JWT Auth │   │ •Categories     │  │ •Valuation     │  │             │  │                 │
   └───────────┘   └────────────────┘  └────────────────┘  └─────────────┘  └─────────────────┘
        │                   │                   │                 │                  │
        │                   │                   │                 │                  │
        └───────────────────┴───────────────────┴─────────────────┴──────────────────┘
                                      │
                            ┌─────────▼──────────┐
                            │   Prisma ORM       │
                            │   PostgreSQL DB    │
                            └────────────────────┘
```

## Microservices Structure

### 1. **Auth Service** (`src/services/auth/`)
**Purpose:** User authentication and profile management

**Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

**Files:**
- `controllers/auth.controller.js` - Request handlers
- `routes/auth.routes.js` - Route definitions
- No separate service layer (business logic in controller)

---

### 2. **Product Service** (`src/services/product/`)
**Purpose:** Product catalog management

**Endpoints:**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/group/:group` - Get products by group
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `PATCH /api/products/:id/toggle` - Toggle active status (protected)
- `DELETE /api/products/:id` - Delete product (protected)

**Files:**
- `controllers/product.controller.js` - Request handlers
- `routes/product.routes.js` - Route definitions
- `services/product.service.js` - Business logic (CRUD, search, filtering)

**Features:**
- Product CRUD operations
- Search by name/SKU
- Filter by group/category
- Status management
- Updated timestamp tracking

---

### 3. **Inventory Service** (`src/services/inventory/`)
**Purpose:** Stock tracking and warehouse management

**Endpoints:**
- `GET /api/inventory` - Get all movements
- `GET /api/inventory/levels` - Get current stock levels
- `GET /api/inventory/inwards` - Get inward movements
- `GET /api/inventory/outwards` - Get outward movements
- `GET /api/inventory/summary` - Summary by date range
- `GET /api/inventory/product/:productId` - Movements for product
- `GET /api/inventory/:id` - Get movement by ID
- `POST /api/inventory` - Record movement (protected)
- `PUT /api/inventory/:id` - Update movement (protected)
- `DELETE /api/inventory/:id` - Delete movement (protected)

**Files:**
- `controllers/inventory.controller.js` - Request handlers
- `routes/inventory.routes.js` - Route definitions
- `services/inventory.service.js` - Business logic (calculations, summaries)

**Features:**
- Stock IN/OUT tracking
- Real-time stock level calculation
- Date range reporting
- Product-wise movement history
- Inventory valuation

---

### 4. **Sales Service** (`src/services/sales/`)
**Purpose:** Sales transactions and customer management

**Endpoints:**

**Sales:**
- `GET /api/sales` - Get all sales
- `GET /api/sales/summary` - Sales summary
- `GET /api/sales/date-range` - Sales in date range
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create sale (protected)
- `PUT /api/sales/:id` - Update sale (protected)
- `DELETE /api/sales/:id` - Delete sale (protected)

**Customers:**
- `GET /api/customers/list` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `GET /api/customers/:id/sales` - Customer with sales history
- `POST /api/customers/new` - Create customer (protected)
- `PUT /api/customers/:id` - Update customer (protected)
- `DELETE /api/customers/:id` - Delete customer (protected)

**Files:**
- `controllers/sales.controller.js` - Request handlers
- `routes/sales.routes.js` - Route definitions
- `services/sales.service.js` - Business logic

**Features:**
- Sales invoice management
- Customer CRUD
- Sales analytics (total, average)
- Customer order history
- Date range reporting

---

### 5. **Purchase Service** (`src/services/purchase/`)
**Purpose:** Purchase orders and supplier management

**Endpoints:**

**Purchases:**
- `GET /api/purchases` - Get all purchases
- `GET /api/purchases/summary` - Purchase summary
- `GET /api/purchases/date-range` - Purchases in date range
- `GET /api/purchases/:id` - Get purchase by ID
- `POST /api/purchases` - Create purchase (protected)
- `PUT /api/purchases/:id` - Update purchase (protected)
- `DELETE /api/purchases/:id` - Delete purchase (protected)

**Suppliers:**
- `GET /api/suppliers/list` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `GET /api/suppliers/:id/purchases` - Supplier with purchase history
- `POST /api/suppliers/new` - Create supplier (protected)
- `PUT /api/suppliers/:id` - Update supplier (protected)
- `DELETE /api/suppliers/:id` - Delete supplier (protected)

**Files:**
- `controllers/purchase.controller.js` - Request handlers
- `routes/purchase.routes.js` - Route definitions
- `services/purchase.service.js` - Business logic

**Features:**
- Purchase order management
- Supplier CRUD
- Purchase analytics (total, average)
- Supplier order history
- Date range reporting

---

## Directory Structure

```
backend/src/
├── services/
│   ├── auth/
│   │   ├── controllers/
│   │   │   └── auth.controller.js
│   │   └── routes/
│   │       └── auth.routes.js
│   │
│   ├── product/
│   │   ├── controllers/
│   │   │   └── product.controller.js
│   │   ├── routes/
│   │   │   └── product.routes.js
│   │   └── services/
│   │       └── product.service.js
│   │
│   ├── inventory/
│   │   ├── controllers/
│   │   │   └── inventory.controller.js
│   │   ├── routes/
│   │   │   └── inventory.routes.js
│   │   └── services/
│   │       └── inventory.service.js
│   │
│   ├── sales/
│   │   ├── controllers/
│   │   │   └── sales.controller.js
│   │   ├── routes/
│   │   │   └── sales.routes.js
│   │   └── services/
│   │       └── sales.service.js
│   │
│   └── purchase/
│       ├── controllers/
│       │   └── purchase.controller.js
│       ├── routes/
│       │   └── purchase.routes.js
│       └── services/
│           └── purchase.service.js
│
├── config/
│   └── db.js
│
├── middlewares/
│   ├── auth.js
│   └── error.middleware.js
│
├── app.js                    # API Gateway
├── server.js
├── prisma.js
└── swagger.js
```

## Request/Response Flow

### Example: Create Product
```
Client Request
    │
    ▼
POST /api/products
    │
    ▼
API Gateway (app.js) routes to Product Service
    │
    ▼
product.routes.js (route handler)
    │
    ▼
product.controller.js (validates & calls service)
    │
    ▼
product.service.js (business logic, DB query)
    │
    ▼
Prisma ORM (database interaction)
    │
    ▼
PostgreSQL (data storage)
    │
    ▼
Response with created product
```

## Benefits of Microservice Architecture

1. **Scalability** - Each service can be scaled independently
2. **Maintainability** - Clear separation of concerns
3. **Testability** - Services can be tested in isolation
4. **Reusability** - Services can be consumed by multiple clients
5. **Flexibility** - Services can be updated independently
6. **Future Extensibility** - Easy to add new services

## API Gateway Features (`app.js`)

- **Health Checks**: `GET /api/health`
- **Service Info**: `GET /api/info` (lists all available services)
- **Security**: Helmet, CORS, XSS protection, HPP
- **Rate Limiting**: 300 requests per 15 minutes
- **Error Handling**: Centralized error handler
- **Body Parsing**: JSON parsing with 1MB limit

## Authentication Flow

1. User registers/logs in at `/api/auth/register` or `/api/auth/login`
2. Server returns JWT token
3. Client stores token in localStorage
4. All protected endpoints check token via `auth` middleware
5. Protected routes require `Authorization: Bearer <token>` header

## Future Enhancements

- [ ] Service-to-service communication
- [ ] Message queues (RabbitMQ/Kafka) for async operations
- [ ] API Gateway Load Balancing
- [ ] Service Discovery
- [ ] Distributed Logging
- [ ] Caching Layer (Redis)
- [ ] GraphQL Gateway
- [ ] Event Sourcing
- [ ] Separate databases per service

## Testing

Each service can be tested independently:

```bash
# Test Auth Service
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Test Product Service
curl http://localhost:3000/api/products

# Test Inventory Service
curl http://localhost:3000/api/inventory/levels
```

## Swagger Documentation

Access API documentation at:
- `http://localhost:3000/api-docs`

## Development Guidelines

1. **Controllers**: Handle HTTP requests/responses, validation
2. **Services**: Business logic, database queries, calculations
3. **Routes**: Define endpoints, authentication middleware
4. **Middleware**: Cross-cutting concerns (auth, error handling)

## Environment Variables

Create `.env` file with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/tally_db
JWT_SECRET=your_secret_key
PORT=3000
NODE_ENV=development
```

---

**Created**: February 2026  
**Version**: 1.0.0  
**Architecture**: Microservice-based ERP
