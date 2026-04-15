const prisma = require('../../prisma');
const { generateRecommendations } = require('./ai-openai.service');

/**
 * Recommend products to customers
 */
exports.recommendProductsToCustomer = async (customerId) => {
  try {
    // Get customer purchase history
    const customer = await prisma.customers.findUnique({
      where: { id: customerId },
      include: {
        sales: {
          include: { products: { select: { id: true, name: true, sku: true, category: true, group: true } } },
          take: 20
        }
      }
    });

    if (!customer) return { success: false, error: 'Customer not found' };

    // Get all products for context
    const allProducts = await prisma.products.findMany({
      select: { id: true, name: true, sku: true, category: true, group: true, is_active: true }
    });

    const context = {
      customer_name: customer.name,
      purchase_history: customer.sales.map(s => s.products?.name),
      product_categories: [...new Set(customer.sales.map(s => s.products?.category).filter(Boolean))],
      avg_purchase_value: customer.sales.length > 0 ? customer.sales.reduce((a, b) => a + Number(b.unit_price) * b.quantity, 0) / customer.sales.length : 0,
      total_purchases: customer.sales.length,
      available_products: allProducts.filter(p => p.is_active).map(p => ({ name: p.name, category: p.category, group: p.group }))
    };

    const recommendations = await generateRecommendations(
      context,
      'Recommend 5 products for this customer based on their purchase history and category preferences. Provide specific, actionable recommendations with reasoning.'
    );

    return {
      success: recommendations.success,
      customer_id: customerId,
      customer_name: customer.name,
      recommendations: recommendations.recommendations,
      tokens_used: recommendations.tokens_used
    };
  } catch (error) {
    console.error('Recommendation Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Recommend products to upsell/cross-sell
 */
exports.recommendUpsellCrossSell = async () => {
  try {
    // Get popular products
    const popularProducts = await prisma.sales.groupBy({
      by: ['product_id'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });

    const products = await prisma.products.findMany({
      where: { id: { in: popularProducts.map(p => p.product_id) } },
      select: { id: true, name: true, sku: true, category: true, group: true }
    });

    const context = {
      popular_products: products.map(p => ({ name: p.name, category: p.category, group: p.group })),
      total_active_products: await prisma.products.count({ where: { is_active: true } }),
      sales_trends: 'Based on recent popularity'
    };

    const recommendations = await generateRecommendations(
      context,
      'Generate upsell and cross-sell strategies. Recommend product bundles, complementary products, and upgrade opportunities.'
    );

    return {
      success: recommendations.success,
      upsell_crosssell_strategies: recommendations.recommendations,
      tokens_used: recommendations.tokens_used
    };
  } catch (error) {
    console.error('Upsell/Cross-sell Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Recommend inventory actions
 */
exports.recommendInventoryActions = async () => {
  try {
    const allProducts = await prisma.products.findMany({
      select: { id: true, name: true, sku: true, opening_qty: true }
    });

    // Get stock movements
    const movements = await prisma.stock_items.findMany({
      select: { product_id: true, type: true, quantity: true },
      orderBy: { txn_date: 'desc' },
      take: 100
    });

    // Calculate current levels
    const stockLevels = {};
    movements.forEach(m => {
      if (!stockLevels[m.product_id]) {
        stockLevels[m.product_id] = { inwards: 0, outwards: 0 };
      }
      if (m.type === 'IN') stockLevels[m.product_id].inwards += m.quantity;
      if (m.type === 'OUT') stockLevels[m.product_id].outwards += m.quantity;
    });

    const productStatus = allProducts.map(p => ({
      name: p.name,
      sku: p.sku,
      opening_qty: p.opening_qty,
      current_level: (p.opening_qty || 0) + (stockLevels[p.id]?.inwards || 0) - (stockLevels[p.id]?.outwards || 0)
    }));

    const context = {
      products: productStatus,
      overstock_threshold: Math.max(...productStatus.map(p => p.current_level || 0)) * 0.8,
      understock_threshold: Math.min(...productStatus.filter(p => p.opening_qty > 0).map(p => p.opening_qty || 0)) * 0.2
    };

    const recommendations = await generateRecommendations(
      context,
      'Recommend inventory optimization strategies. Identify overstocked items, understocked items, and reorder points. Provide specific action items.'
    );

    return {
      success: recommendations.success,
      inventory_recommendations: recommendations.recommendations,
      products_analyzed: productStatus.length,
      tokens_used: recommendations.tokens_used
    };
  } catch (error) {
    console.error('Inventory Recommendation Error:', error);
    return { success: false, error: error.message };
  }
};
