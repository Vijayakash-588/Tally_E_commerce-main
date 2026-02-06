const service = require('../services/purchase.service');

// PURCHASE ENDPOINTS

/**
 * Create new purchase
 */
exports.createPurchase = async (req, res, next) => {
  try {
    const purchase = await service.createPurchase(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Purchase recorded', 
      data: purchase 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all purchases
 */
exports.findAllPurchases = async (req, res, next) => {
  try {
    const purchases = await service.findAllPurchases();
    res.json({ 
      success: true, 
      data: purchases,
      count: purchases.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get purchases by date range
 */
exports.getPurchasesByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const purchases = await service.getPurchasesByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
    res.json({ 
      success: true, 
      data: purchases,
      count: purchases.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get purchases by supplier
 */
exports.getPurchasesBySupplier = async (req, res, next) => {
  try {
    const purchases = await service.getPurchasesBySupplier(req.params.supplierId);
    res.json({ 
      success: true, 
      data: purchases,
      count: purchases.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get purchase by ID
 */
exports.findPurchaseById = async (req, res, next) => {
  try {
    const purchase = await service.findPurchaseById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ 
        success: false, 
        message: 'Purchase not found' 
      });
    }
    res.json({ success: true, data: purchase });
  } catch (err) {
    next(err);
  }
};

/**
 * Update purchase
 */
exports.updatePurchase = async (req, res, next) => {
  try {
    const purchase = await service.updatePurchase(req.params.id, req.body);
    res.json({ 
      success: true, 
      message: 'Purchase updated', 
      data: purchase 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete purchase
 */
exports.deletePurchase = async (req, res, next) => {
  try {
    await service.deletePurchase(req.params.id);
    res.json({ 
      success: true, 
      message: 'Purchase deleted' 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get purchase summary
 */
exports.getPurchaseSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await service.getPurchaseSummary(
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

// SUPPLIER ENDPOINTS

/**
 * Create new supplier
 */
exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await service.createSupplier(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Supplier created', 
      data: supplier 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all suppliers
 */
exports.findAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await service.findAllSuppliers();
    res.json({ 
      success: true, 
      data: suppliers,
      count: suppliers.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get supplier by ID
 */
exports.findSupplierById = async (req, res, next) => {
  try {
    const supplier = await service.findSupplierById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ 
        success: false, 
        message: 'Supplier not found' 
      });
    }
    res.json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

/**
 * Get supplier with purchase history
 */
exports.getSupplierWithPurchases = async (req, res, next) => {
  try {
    const supplier = await service.getSupplierWithPurchases(req.params.id);
    if (!supplier) {
      return res.status(404).json({ 
        success: false, 
        message: 'Supplier not found' 
      });
    }
    res.json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

/**
 * Update supplier
 */
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await service.updateSupplier(req.params.id, req.body);
    res.json({ 
      success: true, 
      message: 'Supplier updated', 
      data: supplier 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete supplier
 */
exports.deleteSupplier = async (req, res, next) => {
  try {
    await service.deleteSupplier(req.params.id);
    res.json({ 
      success: true, 
      message: 'Supplier deleted' 
    });
  } catch (err) {
    next(err);
  }
};
