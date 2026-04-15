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

# AI via Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
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
- **AI Service**: Integration with Ollama-powered chatbot, predictions, anomaly detection, and recommendations.

## 🤖 Ollama Setup

1. Install Ollama from https://ollama.com
2. Start Ollama on your machine.
3. Pull a model, for example:
   ```bash
   ollama pull llama3.1
   ```
4. Keep `OLLAMA_BASE_URL` pointed at your local Ollama server.
5. Set `OLLAMA_MODEL` to the model you pulled.
6. Restart the backend and test the AI endpoints.

## 📚 API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
`http://localhost:5000/api-docs`

---
*Note: Ensure the PostgreSQL database is running before starting the server.*
