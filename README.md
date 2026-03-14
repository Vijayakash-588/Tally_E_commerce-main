# Tally ERP - E-commerce & Inventory Management System

A comprehensive, microservice-based ERP system designed for e-commerce and inventory management. This project features a robust Express.js backend architecture and a modern React frontend.

## 🏗️ Architecture

The project is divided into two main components:

- **Frontend**: A high-performance React application built with Vite and Tailwind CSS v4.
- **Backend**: A microservice-oriented API Gateway built with Node.js and Express, using Prisma ORM for database management.

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (or any Prisma-supported database)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Tally_E_commerce-main
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   # Configure .env file (see backend/README.md)
   npx prisma migrate dev
   npm run seed
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Forms**: React Hook Form

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Security**: JWT, Helmet, Rate Limiting, XSS Clean
- **Documentation**: Swagger UI

## 📂 Project Structure

```text
Tally_E_commerce-main/
├── backend/            # Express API Gateway & Microservices
│   ├── src/
│   │   ├── services/   # Business logic (Auth, Product, Sales, etc.)
│   │   └── app.js      # API Gateway configuration
│   └── prisma/         # Database schema
├── frontend/           # React Application
│   ├── src/
│   │   ├── pages/      # Dashboard, Inventory, Invoices, etc.
│   │   └── components/ # Reusable UI components
└── README.md           # This file
```

## 📄 License

This project is proprietary.
