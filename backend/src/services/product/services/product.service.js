const prisma = require('../../../prisma');

/**
 * Create new product
 */
exports.create = async (data) => {
  return prisma.products.create({ data });
};

/**
 * Get all products
 */
exports.findAll = async () => {
  return prisma.products.findMany({
    orderBy: { created_at: 'desc' }
  });
};

/**
 * Get product by ID
 */
exports.findById = async (id) => {
  return prisma.products.findUnique({ where: { id } });
};

/**
 * Search products by SKU
 */
exports.findBySku = async (sku) => {
  return prisma.products.findUnique({ where: { sku } });
};

/**
 * Search products by Barcode
 */
exports.findByBarcode = async (barcode) => {
  return prisma.products.findUnique({ where: { barcode } });
};

/**
 * Get products by group
 */
exports.findByGroup = async (group) => {
  return prisma.products.findMany({ where: { group } });
};

/**
 * Get products by category
 */
exports.findByCategory = async (category) => {
  return prisma.products.findMany({ where: { category } });
};

/**
 * Update product
 */
exports.update = async (id, data) => {
  return prisma.products.update({
    where: { id },
    data: { ...data, updated_at: new Date() }
  });
};

/**
 * Delete product
 */
exports.remove = async (id) => {
  return prisma.products.delete({ where: { id } });
};

/**
 * Toggle product active status
 */
exports.toggleStatus = async (id) => {
  const product = await prisma.products.findUnique({ where: { id } });
  return prisma.products.update({
    where: { id },
    data: { is_active: !product.is_active }
  });
};
