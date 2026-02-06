const prisma = require('../../../prisma');

/**
 * Record stock movement
 */
exports.create = async (data) => {
  return prisma.stock_items.create({ data });
};

/**
 * Get all stock movements
 */
exports.findAll = async () => {
  return prisma.stock_items.findMany({
    include: { products: true },
    orderBy: { txn_date: 'desc' }
  });
};

/**
 * Get stock movements by product ID
 */
exports.findByProductId = async (productId) => {
  return prisma.stock_items.findMany({
    where: { product_id: productId },
    include: { products: true },
    orderBy: { txn_date: 'desc' }
  });
};

/**
 * Get stock by ID
 */
exports.findById = async (id) => {
  return prisma.stock_items.findUnique({
    where: { id },
    include: { products: true }
  });
};

/**
 * Get inventory summary by date range
 */
exports.getSummary = async (startDate, endDate) => {
  // Use default dates if not provided
  const start = startDate && !isNaN(startDate) ? startDate : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate && !isNaN(endDate) ? endDate : new Date();
  
  return prisma.stock_items.findMany({
    where: {
      txn_date: {
        gte: start,
        lte: end
      }
    },
    include: { products: true },
    orderBy: { txn_date: 'desc' }
  });
};

/**
 * Get inward movements
 */
exports.getInwards = async () => {
  return prisma.stock_items.findMany({
    where: { type: 'IN' },
    include: { products: true },
    orderBy: { txn_date: 'desc' }
  });
};

/**
 * Get outward movements
 */
exports.getOutwards = async () => {
  return prisma.stock_items.findMany({
    where: { type: 'OUT' },
    include: { products: true },
    orderBy: { txn_date: 'desc' }
  });
};

/**
 * Update stock movement
 */
exports.update = async (id, data) => {
  return prisma.stock_items.update({
    where: { id },
    data,
    include: { products: true }
  });
};

/**
 * Delete stock movement
 */
exports.remove = async (id) => {
  return prisma.stock_items.delete({ where: { id } });
};

/**
 * Get current stock levels for all products
 */
exports.getStockLevels = async () => {
  const products = await prisma.products.findMany();
  
  const stockLevels = await Promise.all(
    products.map(async (product) => {
      const movements = await prisma.stock_items.findMany({
        where: { product_id: product.id }
      });

      const inwards = movements
        .filter(m => m.type === 'IN')
        .reduce((sum, m) => sum + m.quantity, 0);

      const outwards = movements
        .filter(m => m.type === 'OUT')
        .reduce((sum, m) => sum + m.quantity, 0);

      const closingQty = (product.opening_qty || 0) + inwards - outwards;

      return {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        opening_qty: product.opening_qty || 0,
        inwards,
        outwards,
        closing_qty: closingQty,
        group: product.group,
        category: product.category
      };
    })
  );

  return stockLevels;
};
