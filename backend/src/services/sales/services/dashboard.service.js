const prisma = require('../../../prisma');

/**
 * Get aggregated dashboard statistics and recent activities
 */
exports.getDashboardData = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Run aggregations in parallel for better performance
  const [
    salesStats,
    purchaseStats,
    monthlySalesStats,
    monthlyPurchaseStats,
    productCount,
    activeProductCount,
    recentSales,
    recentPurchases
  ] = await Promise.all([
    // Total Sales
    prisma.sales.aggregate({
      _sum: { total: true }
    }),
    // Total Purchases
    prisma.purchases.aggregate({
      _sum: { total: true }
    }),
    // Monthly Sales
    prisma.sales.aggregate({
      where: {
        sale_date: { gte: startOfMonth }
      },
      _sum: { total: true }
    }),
    // Monthly Purchases
    prisma.purchases.aggregate({
      where: {
        purchase_date: { gte: startOfMonth }
      },
      _sum: { total: true }
    }),
    // Total Products
    prisma.products.count(),
    // Active Products
    prisma.products.count({
      where: { is_active: true }
    }),
    // Recent Sales
    prisma.sales.findMany({
      take: 10,
      orderBy: { sale_date: 'desc' },
      include: { customers: true }
    }),
    // Recent Purchases
    prisma.purchases.findMany({
      take: 10,
      orderBy: { purchase_date: 'desc' },
      include: { suppliers: true }
    })
  ]);

  // Format recent transactions
  const transactions = [
    ...recentSales.map(s => ({
      id: s.id,
      date: s.sale_date,
      type: 'Sales',
      reference: `SALE-${s.id.substring(0, 8)}`,
      party: s.customers?.name || 'Customer',
      amount: parseFloat(s.total || 0)
    })),
    ...recentPurchases.map(p => ({
      id: p.id,
      date: p.purchase_date,
      type: 'Purchase',
      reference: `PUR-${p.id.substring(0, 8)}`,
      party: p.suppliers?.name || 'Supplier',
      amount: parseFloat(p.total || 0)
    }))
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return {
    stats: {
      totalSales: parseFloat(salesStats._sum.total || 0),
      totalPurchases: parseFloat(purchaseStats._sum.total || 0),
      monthlySales: parseFloat(monthlySalesStats._sum.total || 0),
      monthlyPurchases: parseFloat(monthlyPurchaseStats._sum.total || 0),
      totalProducts: productCount,
      activeProducts: activeProductCount
    },
    recentTransactions: transactions
  };
};
