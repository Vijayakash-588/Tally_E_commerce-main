# Tally ERP - Frontend Application

The frontend for Tally ERP is a modern, responsive React application built for high-performance inventory and e-commerce management.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router Dom v7](https://reactrouter.com/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 🏗️ Project Architecture

The application follows a standard modular structure:

- **src/pages**: Contains the main view components (Dashboard, Inventory, Invoices, etc.).
- **src/components**: Reusable UI elements (Buttons, Tables, Forms, Layouts).
- **src/api**: Axios-based API service layer for communicating with the backend.
- **src/context**: React Context providers for global state (Auth, Search).

## 📄 Key Features

- **Dashboard**: Real-time overview of business metrics.
- **Inventory Management**: Track stock levels, movements, and adjustments.
- **Sales & Purchases**: Manage orders, customers, and suppliers.
- **Invoices**: Generate and view sales and purchase invoices with PDF support.
- **AI Assistant**: Smart chatbot for quick queries and insights.

## ⚙️ Configuration

The API connection is configured in `src/api/axios.js`. By default, it points to `http://localhost:5000/api`.

---
*Note: Ensure the backend server is running for full functionality.*
