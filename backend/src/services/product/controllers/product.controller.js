const service = require('../services/product.service');

/**
 * Create new product
 */
exports.create = async (req, res, next) => {
  try {
    const product = await service.create(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Product created', 
      data: product 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all products
 */
exports.findAll = async (req, res, next) => {
  try {
    const products = await service.findAll();
    res.json({ 
      success: true, 
      data: products,
      count: products.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get product by ID
 */
exports.findById = async (req, res, next) => {
  try {
    const product = await service.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

/**
 * Get products by group
 */
exports.getByGroup = async (req, res, next) => {
  try {
    const products = await service.findByGroup(req.params.group);
    res.json({ 
      success: true, 
      data: products,
      count: products.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get products by category
 */
exports.getByCategory = async (req, res, next) => {
  try {
    const products = await service.findByCategory(req.params.category);
    res.json({ 
      success: true, 
      data: products,
      count: products.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update product
 */
exports.update = async (req, res, next) => {
  try {
    const product = await service.update(req.params.id, req.body);
    res.json({ 
      success: true, 
      message: 'Product updated', 
      data: product 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete product
 */
exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ 
      success: true, 
      message: 'Product deleted' 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle product active/inactive
 */
exports.toggleStatus = async (req, res, next) => {
  try {
    const product = await service.toggleStatus(req.params.id);
    res.json({ 
      success: true, 
      message: 'Status updated', 
      data: product 
    });
  } catch (err) {
    next(err);
  }
};
