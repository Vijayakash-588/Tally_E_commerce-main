const prisma = require('../../../prisma');

/**
 * Create new sale
 */
exports.createSale = async (data) => {
  // Calculate total if not provided
  if (!data.total && data.quantity && data.unit_price) {
    const subtotal = data.quantity * data.unit_price; // unit_price is selling price here
    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const roundOff = data.round_off || 0;

    // Total = (Qty * Price) - Discount + Tax + RoundOff
    data.total = parseFloat(subtotal) - parseFloat(discount) + parseFloat(tax) + parseFloat(roundOff);
  }

  // Use a transaction to ensure sale and stock movement succeed
  return prisma.$transaction(async (tx) => {
    // Create the sale record
    const sale = await tx.sales.create({
      data,
      include: { customers: true, products: true }
    });

    // Create stock OUT movement
    await tx.stock_items.create({
      data: {
        product_id: data.product_id,
        type: 'OUT',
        quantity: data.quantity,
        reference: `Sale-${sale.id}`,
        txn_date: data.sale_date ? new Date(data.sale_date) : new Date()
      }
    });

    return sale;
  });
};

/**
 * Get all sales
 */
exports.findAllSales = async () => {
  return prisma.sales.findMany({
    include: { customers: true, products: true },
    orderBy: { sale_date: 'desc' }
  });
};

/**
 * Get sales by date range
 */
exports.getSalesByDateRange = async (startDate, endDate) => {
  // Use default dates if not provided
  const start = startDate && !isNaN(startDate) ? startDate : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate && !isNaN(endDate) ? endDate : new Date();

  return prisma.sales.findMany({
    where: {
      sale_date: {
        gte: start,
        lte: end
      }
    },
    include: { customers: true, products: true },
    orderBy: { sale_date: 'desc' }
  });
};

/**
 * Get sales by customer
 */
exports.getSalesByCustomer = async (customerId) => {
  return prisma.sales.findMany({
    where: { customer_id: customerId },
    include: { customers: true, products: true },
    orderBy: { sale_date: 'desc' }
  });
};

/**
 * Get sale by ID
 */
exports.findSaleById = async (id) => {
  return prisma.sales.findUnique({
    where: { id },
    include: { customers: true, products: true }
  });
};

/**
 * Update sale
 */
exports.updateSale = async (id, data) => {
  // Recalculate total if key fields are changing
  if (data.quantity || data.unit_price || data.discount !== undefined || data.tax !== undefined || data.round_off !== undefined) {
    if (data.quantity && data.unit_price) {
      const subtotal = data.quantity * data.unit_price;
      const discount = data.discount || 0;
      const tax = data.tax || 0;
      const roundOff = data.round_off || 0;
      data.total = parseFloat(subtotal) - parseFloat(discount) + parseFloat(tax) + parseFloat(roundOff);
    }
  }

  return prisma.sales.update({
    where: { id },
    data,
    include: { customers: true, products: true }
  });
};

/**
 * Delete sale
 */
exports.deleteSale = async (id) => {
  return prisma.sales.delete({ where: { id } });
};

/**
 * Get sales summary
 */
exports.getSalesSummary = async (startDate, endDate) => {
  const sales = await prisma.sales.findMany({
    where: {
      sale_date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const totalSales = sales.length;
  const totalAmount = sales.reduce((sum, sale) => sum + (sale.total ? parseFloat(sale.total) : 0), 0);
  const avgAmount = totalSales > 0 ? totalAmount / totalSales : 0;

  return {
    totalSales,
    totalAmount,
    avgAmount
  };
};

// CUSTOMER OPERATIONS

/**
 * Create new customer
 */
exports.createCustomer = async (data) => {
  return prisma.customers.create({ data });
};

/**
 * Get all customers
 */
exports.findAllCustomers = async () => {
  return prisma.customers.findMany({
    orderBy: { created_at: 'desc' }
  });
};

/**
 * Get customer by ID
 */
exports.findCustomerById = async (id) => {
  return prisma.customers.findUnique({ where: { id } });
};

/**
 * Update customer
 */
exports.updateCustomer = async (id, data) => {
  return prisma.customers.update({
    where: { id },
    data
  });
};

/**
 * Delete customer
 */
exports.deleteCustomer = async (id) => {
  return prisma.customers.delete({ where: { id } });
};

/**
 * Get customer with sales history
 */
exports.getCustomerWithSales = async (id) => {
  return prisma.customers.findUnique({
    where: { id },
    include: { sales: true }
  });
};
