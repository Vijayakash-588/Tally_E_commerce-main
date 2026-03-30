# Tally ERP - Backend API

The backend for Tally ERP is a robust, microservice-inspired API Gateway built with Node.js and Express. It manages authentication, inventory, sales, purchases, and provides AI-powered insights.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma (PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: 
  - Helmet (Security headers)
  - Express-Rate-Limit (Rate limiting)
  - XSS-Clean (Cross-site scripting protection)
  - HPP (HTTP Parameter Pollution protection)
- **Documentation**: Swagger UI

## ⚙️ Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/Inventory

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Optional role self-registration keys (required for register-as manager/admin)
MANAGER_REGISTRATION_KEY=your_manager_registration_key
ADMIN_REGISTRATION_KEY=your_admin_registration_key

# Server
PORT=5000
NODE_ENV=development
```

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   ```bash
   # Push schema to database
   npx prisma db push
   
   # Run seeding script for initial data
   npm run seed
   ```

3. **Run the Server**:
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## 🏗️ Services

The API is structured around several microservices aggregated by the main gateway:

- **Auth Service**: User registration and login.
- **Product Service**: CRUD operations for products.
- **Inventory Service**: Stock tracking and adjustments.
- **Sales Service**: Sales orders and customer management.
- **Purchase Service**: Purchase orders and supplier management.
- **Invoice Service**: Generating and managing invoices.
- **AI Service**: Integration with AI for chatbot features.

## 📚 API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
`http://localhost:5000/api-docs`

---
*Note: Ensure the PostgreSQL database is running before starting the server.*
