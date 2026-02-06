import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Register from './pages/Register';
import StockSummary from './pages/Inventory';
import SalesInvoice from './pages/SalesInvoice';
import ProfitLoss from './pages/ProfitLoss';

// Placeholder components for other routes
const Placeholder = ({ title }) => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p>Coming soon...</p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/active-stock" element={<StockSummary />} />
            <Route path="/sales" element={<SalesInvoice />} />
            <Route path="/reports/profit-loss" element={<ProfitLoss />} />
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/sales" element={<SalesInvoice />} />
              <Route path="/purchases" element={<Placeholder title="Purchases" />} />
              <Route path="/customers" element={<Placeholder title="Customers" />} />
              <Route path="/suppliers" element={<Placeholder title="Suppliers" />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
