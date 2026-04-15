const prisma = require('../../prisma');
const { generatePrediction } = require('./ai-openai.service');

/**
 * AI-powered demand forecasting
 */
exports.predictDemand = async ({ productId, lookbackDays = 30, horizonDays = 30 }) => {
  try {
    // Get historical sales data
    const lookbackStart = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
    
    const [sales, product, movements] = await Promise.all([
      prisma.sales.findMany({
        where: { product_id: productId, sale_date: { gte: lookbackStart } },
        select: { quantity: true, sale_date: true }
      }),
      prisma.products.findUnique({ where: { id: productId } }),
      prisma.stock_items.findMany({
        where: { product_id: productId, txn_date: { gte: lookbackStart } },
        select: { type: true, quantity: true, txn_date: true }
      })
    ]);

    // Prepare context for AI
    const historicalData = {
      product: product?.name,
      sku: product?.sku,
      lastSales: sales.slice(-10).map(s => ({ qty: s.quantity, date: s.sale_date })),
      totalSalesQty: sales.reduce((a, b) => a + b.quantity, 0),
      averageDailyDemand: sales.reduce((a, b) => a + b.quantity, 0) / Math.max(lookbackDays, 1),
      stockMovements: movements.slice(-10),
      currentStock: product?.opening_qty || 0,
    };

    // Ask GPT-4 for prediction
    const prediction = await generatePrediction(
      historicalData,
      `Predict demand for ${product?.name} over the next ${horizonDays} days. 
       Consider historical trends, average daily demand, and seasonal patterns.
       Provide specific quantity predictions, confidence level, and reasoning.
       If possible, identify any growth or decline trends.`
    );

    return {
      success: prediction.success,
      product_id: productId,
      product_name: product?.name,
      prediction: prediction.prediction,
      historical_data: historicalData,
      tokens_used: prediction.tokens_used,
    };
  } catch (error) {
    console.error('Demand Prediction Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Predict trend for multiple products
 */
exports.predictTrends = async ({ lookbackDays = 30 }) => {
  try {
    const lookbackStart = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    // Get top 5 products by sales
    const topProducts = await prisma.sales.groupBy({
      by: ['product_id'],
      where: { sale_date: { gte: lookbackStart } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const predictions = await Promise.all(
      topProducts.map(async (item) => {
        const result = await exports.predictDemand({
          productId: item.product_id,
          lookbackDays,
          horizonDays: 7
        });

        return result.success ? result : null;
      })
    );

    return { success: true, predictions: predictions.filter(Boolean) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
