const service = require('../services/sales.service');

// SALES ENDPOINTS

/**
 * Create new sale
 */
exports.createSale = async (req, res, next) => {
  try {
    const sale = await service.createSale(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Sale recorded', 
      data: sale 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all sales
 */
exports.findAllSales = async (req, res, next) => {
  try {
    const sales = await service.findAllSales();
    res.json({ 
      success: true, 
      data: sales,
      count: sales.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get sales by date range
 */
exports.getSalesByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const sales = await service.getSalesByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
    res.json({ 
      success: true, 
      data: sales,
      count: sales.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get sales by customer
 */
exports.getSalesByCustomer = async (req, res, next) => {
  try {
    const sales = await service.getSalesByCustomer(req.params.customerId);
    res.json({ 
      success: true, 
      data: sales,
      count: sales.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get sale by ID
 */
exports.findSaleById = async (req, res, next) => {
  try {
    const sale = await service.findSaleById(req.params.id);
    if (!sale) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sale not found' 
      });
    }
    res.json({ success: true, data: sale });
  } catch (err) {
    next(err);
  }
};

/**
 * Update sale
 */
exports.updateSale = async (req, res, next) => {
  try {
    const sale = await service.updateSale(req.params.id, req.body);
    res.json({ 
      success: true, 
      message: 'Sale updated', 
      data: sale 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete sale
 */
exports.deleteSale = async (req, res, next) => {
  try {
    await service.deleteSale(req.params.id);
    res.json({ 
      success: true, 
      message: 'Sale deleted' 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get sales summary
 */
exports.getSalesSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await service.getSalesSummary(
      new Date(startDate),
      new Date(endDate)
    );
    res.json({ 
      success: true, 
      data: summary 
    });
  } catch (err) {
    next(err);
  }
};

// CUSTOMER ENDPOINTS

/**
 * Create new customer
 */
exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await service.createCustomer(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Customer created', 
      data: customer 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all customers
 */
exports.findAllCustomers = async (req, res, next) => {
  try {
    const customers = await service.findAllCustomers();
    res.json({ 
      success: true, 
      data: customers,
      count: customers.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get customer by ID
 */
exports.findCustomerById = async (req, res, next) => {
  try {
    const customer = await service.findCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

/**
 * Get customer with sales history
 */
exports.getCustomerWithSales = async (req, res, next) => {
  try {
    const customer = await service.getCustomerWithSales(req.params.id);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

/**
 * Update customer
 */
exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await service.updateCustomer(req.params.id, req.body);
    res.json({ 
      success: true, 
      message: 'Customer updated', 
      data: customer 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete customer
 */
exports.deleteCustomer = async (req, res, next) => {
  try {
    await service.deleteCustomer(req.params.id);
    res.json({ 
      success: true, 
      message: 'Customer deleted' 
    });
  } catch (err) {
    next(err);
  }
};
