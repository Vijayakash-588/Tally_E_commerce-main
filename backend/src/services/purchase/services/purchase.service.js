const prisma = require('../../../prisma');

// PURCHASE OPERATIONS

/**
 * Create new purchase
 */
exports.createPurchase = async (data) => {
  // Calculate total if not provided
  if (!data.total && data.quantity && data.unit_price) {
    const subtotal = data.quantity * data.unit_price;
    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const roundOff = data.round_off || 0;

    // Total = (Qty * Price) - Discount + Tax + RoundOff
    data.total = parseFloat(subtotal) - parseFloat(discount) + parseFloat(tax) + parseFloat(roundOff);
  }

  // Use a transaction to ensure both purchase and stock movement succeed
  return prisma.$transaction(async (tx) => {
    // Create the purchase record
    const purchase = await tx.purchases.create({
      data,
      include: { suppliers: true, products: true }
    });

    // Create stock IN movement
    await tx.stock_items.create({
      data: {
        product_id: data.product_id,
        type: 'IN',
        quantity: data.quantity,
        reference: `Purchase-${purchase.id}`,
        txn_date: data.purchase_date ? new Date(data.purchase_date) : new Date()
      }
    });

    return purchase;
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
  // Recalculate total if key fields are changing
  if (data.quantity || data.unit_price || data.discount !== undefined || data.tax !== undefined || data.round_off !== undefined) {
    // We would need to fetch existing values to do this perfectly if partial data is sent, 
    // but typically frontend sends full object. For now, trust frontend or assume data has all fields.
    // If complex logic is needed, fetch existing record first.
    if (data.quantity && data.unit_price) {
      const subtotal = data.quantity * data.unit_price;
      const discount = data.discount || 0;
      const tax = data.tax || 0;
      const roundOff = data.round_off || 0;
      data.total = parseFloat(subtotal) - parseFloat(discount) + parseFloat(tax) + parseFloat(roundOff);
    }
  }

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
