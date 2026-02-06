const service = require('../services/inventory.service');

/**
 * Record stock movement
 */
exports.create = async (req, res, next) => {
  try {
    const movement = await service.create(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Stock movement recorded', 
      data: movement 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all stock movements
 */
exports.findAll = async (req, res, next) => {
  try {
    const movements = await service.findAll();
    res.json({ 
      success: true, 
      data: movements,
      count: movements.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get stock movements by product ID
 */
exports.getByProduct = async (req, res, next) => {
  try {
    const movements = await service.findByProductId(req.params.productId);
    res.json({ 
      success: true, 
      data: movements,
      count: movements.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get stock by ID
 */
exports.findById = async (req, res, next) => {
  try {
    const movement = await service.findById(req.params.id);
    if (!movement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Stock movement not found' 
      });
    }
    res.json({ success: true, data: movement });
  } catch (err) {
    next(err);
  }
};

/**
 * Get inventory summary
 */
exports.getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const movements = await service.getSummary(
      new Date(startDate),
      new Date(endDate)
    );
    res.json({ 
      success: true, 
      data: movements,
      count: movements.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get inward movements
 */
exports.getInwards = async (req, res, next) => {
  try {
    const movements = await service.getInwards();
    res.json({ 
      success: true, 
      data: movements,
      count: movements.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get outward movements
 */
exports.getOutwards = async (req, res, next) => {
  try {
    const movements = await service.getOutwards();
    res.json({ 
      success: true, 
      data: movements,
      count: movements.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update stock movement
 */
exports.update = async (req, res, next) => {
  try {
    const movement = await service.update(req.params.id, req.body);
    res.json({ 
      success: true, 
      message: 'Stock movement updated', 
      data: movement 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete stock movement
 */
exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.json({ 
      success: true, 
      message: 'Stock movement deleted' 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current stock levels
 */
exports.getStockLevels = async (req, res, next) => {
  try {
    const levels = await service.getStockLevels();
    res.json({ 
      success: true, 
      data: levels,
      count: levels.length 
    });
  } catch (err) {
    next(err);
  }
};
