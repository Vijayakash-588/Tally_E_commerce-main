const prisma = require('../../../prisma');

// PURCHASE OPERATIONS

/**
 * Create new purchase
 */
exports.createPurchase = async (data) => {
  return prisma.purchases.create({
    data,
    include: { suppliers: true, products: true }
  });
};

/**
 * Get all purchases
 */
exports.findAllPurchases = async () => {
  return prisma.purchases.findMany({
    include: { suppliers: true, products: true },
    orderBy: { purchase_date: 'desc' }
  });
};

/**
 * Get purchases by date range
 */
exports.getPurchasesByDateRange = async (startDate, endDate) => {
  // Use default dates if not provided
  const start = startDate && !isNaN(startDate) ? startDate : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate && !isNaN(endDate) ? endDate : new Date();
  
  return prisma.purchases.findMany({
    where: {
      purchase_date: {
        gte: start,
        lte: end
      }
    },
    include: { suppliers: true, products: true },
    orderBy: { purchase_date: 'desc' }
  });
};

/**
 * Get purchases by supplier
 */
exports.getPurchasesBySupplier = async (supplierId) => {
  return prisma.purchases.findMany({
    where: { supplier_id: supplierId },
    include: { suppliers: true, products: true },
    orderBy: { purchase_date: 'desc' }
  });
};

/**
 * Get purchase by ID
 */
exports.findPurchaseById = async (id) => {
  return prisma.purchases.findUnique({
    where: { id },
    include: { suppliers: true, products: true }
  });
};

/**
 * Update purchase
 */
exports.updatePurchase = async (id, data) => {
  return prisma.purchases.update({
    where: { id },
    data,
    include: { suppliers: true, products: true }
  });
};

/**
 * Delete purchase
 */
exports.deletePurchase = async (id) => {
  return prisma.purchases.delete({ where: { id } });
};

/**
 * Get purchase summary
 */
exports.getPurchaseSummary = async (startDate, endDate) => {
  const purchases = await prisma.purchases.findMany({
    where: {
      purchase_date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const totalPurchases = purchases.length;
  const totalAmount = purchases.reduce((sum, purchase) => sum + (purchase.total ? parseFloat(purchase.total) : 0), 0);
  const avgAmount = totalPurchases > 0 ? totalAmount / totalPurchases : 0;

  return {
    totalPurchases,
    totalAmount,
    avgAmount
  };
};

// SUPPLIER OPERATIONS

/**
 * Create new supplier
 */
exports.createSupplier = async (data) => {
  return prisma.suppliers.create({ data });
};

/**
 * Get all suppliers
 */
exports.findAllSuppliers = async () => {
  return prisma.suppliers.findMany({
    orderBy: { created_at: 'desc' }
  });
};

/**
 * Get supplier by ID
 */
exports.findSupplierById = async (id) => {
  return prisma.suppliers.findUnique({ where: { id } });
};

/**
 * Update supplier
 */
exports.updateSupplier = async (id, data) => {
  return prisma.suppliers.update({
    where: { id },
    data
  });
};

/**
 * Delete supplier
 */
exports.deleteSupplier = async (id) => {
  return prisma.suppliers.delete({ where: { id } });
};

/**
 * Get supplier with purchase history
 */
exports.getSupplierWithPurchases = async (id) => {
  return prisma.suppliers.findUnique({
    where: { id },
    include: { purchases: true }
  });
};
