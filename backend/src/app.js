const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');

// Import Microservices
const authRoutes = require('./services/auth/routes/auth.routes');
const productRoutes = require('./services/product/routes/product.routes');
const inventoryRoutes = require('./services/inventory/routes/inventory.routes');
const salesRoutes = require('./services/sales/routes/sales.routes');
const purchaseRoutes = require('./services/purchase/routes/purchase.routes');
const supplierRoutes = require('./services/purchase/routes/supplier.routes');
const invoiceRoutes = require('./services/invoice/routes/invoice.routes');

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

// Body parsing + sanitization
app.use(express.json({ limit: '1mb' }));
app.use(xss());
app.use(hpp());

/**
 * API Gateway Routes
 * Aggregates all microservices
 */

// Auth Service
app.use('/api/auth', authRoutes);

// Product Service
app.use('/api/products', productRoutes);

// Inventory Service
app.use('/api/inventory', inventoryRoutes);
app.use('/api/stock_items', inventoryRoutes); // Alias for backward compatibility

// Sales Service (Sales + Customers)
app.use('/api/sales', salesRoutes);
app.use('/api/customers', salesRoutes);

// Purchase Service (Purchases + Suppliers)
app.use('/api/purchases', purchaseRoutes);
app.use('/api/suppliers', supplierRoutes);

// Invoice Service
app.use('/api/invoices', invoiceRoutes);
require('./swagger')(app);

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Gateway is running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * API Info Endpoint
 */
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    name: 'Tally ERP API',
    version: '1.0.0',
    description: 'Microservice-based ERP system',
    services: [
      { name: 'Auth Service', endpoint: '/api/auth', status: 'active' },
      { name: 'Product Service', endpoint: '/api/products', status: 'active' },
      { name: 'Inventory Service', endpoint: '/api/inventory', status: 'active' },
      { name: 'Sales Service', endpoint: '/api/sales', status: 'active' },
      { name: 'Customer Service', endpoint: '/api/customers', status: 'active' },
      { name: 'Purchase Service', endpoint: '/api/purchases', status: 'active' },
      { name: 'Supplier Service', endpoint: '/api/suppliers', status: 'active' },
      { name: 'Invoice Service', endpoint: '/api/invoices', status: 'active' }
    ]
  });
});

/**
 * Centralized error handler
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Unexpected error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
