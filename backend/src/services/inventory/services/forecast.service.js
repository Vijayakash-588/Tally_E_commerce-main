const prisma = require('../../../prisma');
const inventoryService = require('./inventory.service');
const { getChatCompletion } = require('../../ai/ai-openai.service');

const toNumber = (v) => Number(v || 0);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Calculate trend: UP, DOWN, STABLE
const calculateTrend = (sales) => {
  if (sales.length < 2) return 'STABLE';
  const firstHalf = sales.slice(0, Math.floor(sales.length / 2)).reduce((a, b) => a + b, 0);
  const secondHalf = sales.slice(Math.floor(sales.length / 2)).reduce((a, b) => a + b, 0);
  const change = (secondHalf - firstHalf) / Math.max(firstHalf, 1);
  if (change > 0.1) return 'UP';
  if (change < -0.1) return 'DOWN';
  return 'STABLE';
};

// Detect seasonal pattern (compare same period last cycle)
const detectSeasonality = (dailySales) => {
  if (dailySales.length < 14) return { pattern: 'INSUFFICIENT_DATA', coefficient: 1 };
  const firstWeek = dailySales.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const secondWeek = dailySales.slice(7, 14).reduce((a, b) => a + b, 0) / 7;
  const weeklyChange = Math.abs(secondWeek - firstWeek) / Math.max(firstWeek, 1);
  
  if (weeklyChange > 0.8) return { pattern: 'HIGH_VARIABILITY', coefficient: 1.2 };
  if (weeklyChange > 0.3) return { pattern: 'MODERATE_SEASONALITY', coefficient: 1.1 };
  return { pattern: 'STABLE', coefficient: 1 };
};

// Exponential smoothing for trend-aware forecast
const exponentialSmoothing = (values, alpha = 0.3) => {
  if (values.length === 0) return 0;
  let smoothed = values[0];
  for (let i = 1; i < values.length; i++) {
    smoothed = alpha * values[i] + (1 - alpha) * smoothed;
  }
  return smoothed;
};

const parseJsonContent = (content) => {
  const text = String(content || '').trim();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    // Continue with fenced code block / embedded JSON extraction.
  }

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    try {
      return JSON.parse(fencedMatch[1].trim());
    } catch {
      // Ignore and fall through.
    }
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      // Ignore and fall through.
    }
  }

  return null;
};

const generateAiDemandAdjustments = async ({ products, horizonDays, leadTimeDays, safetyStockDays }) => {
  if (!products.length) {
    return new Map();
  }

  const promptPayload = products.map((item) => ({
    product_id: item.product_id,
    name: item.name,
    sku: item.sku,
    current_stock: item.current_stock,
    avg_daily_demand: item.avg_daily_demand,
    smoothed_demand: item.smoothed_demand,
    baseline_forecast_demand: item.baseline_forecast_demand,
    baseline_reorder_point: item.baseline_reorder_point,
    risk_level: item.risk_level,
    trend: item.trend,
    seasonality_pattern: item.seasonality_pattern,
  }));

  const response = await getChatCompletion([
    {
      role: 'system',
      content: [
        'You are an inventory demand forecasting assistant.',
        'Return only valid JSON.',
        'Use the product summaries to adjust demand forecasts.',
        'Keep demand_multiplier between 0.7 and 1.3 unless the history clearly supports a stronger shift.',
        'Be concise and do not add explanations outside JSON.'
      ].join(' '),
    },
    {
      role: 'user',
      content: JSON.stringify({
        horizon_days: horizonDays,
        lead_time_days: leadTimeDays,
        safety_stock_days: safetyStockDays,
        products: promptPayload,
        output_schema: {
          items: [
            {
              product_id: 'string',
              demand_multiplier: 'number',
              confidence: 'number',
              reasoning: 'string'
            }
          ]
        }
      }, null, 2),
    },
  ], {
    temperature: 0.1,
    max_tokens: 1200,
  });

  if (!response.success) {
    return new Map();
  }

  const parsed = parseJsonContent(response.content);
  const items = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
  const adjustments = new Map();

  items.forEach((item) => {
    const productId = item?.product_id;
    if (!productId) return;

    adjustments.set(productId, {
      demandMultiplier: clamp(Number(item.demand_multiplier ?? item.multiplier ?? 1), 0.5, 1.5),
      confidence: clamp(Number(item.confidence ?? 0.5), 0, 1),
      reasoning: String(item.reasoning || '').trim(),
    });
  });

  return adjustments;
};

exports.getDemandForecast = async ({
  lookbackDays = 30,
  horizonDays = 30,
  leadTimeDays = 7,
  safetyStockDays = 3
} = {}) => {
  const lookbackStart = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

  const [levels, salesRows] = await Promise.all([
    inventoryService.getStockLevels(),
    prisma.sales.findMany({
      where: { sale_date: { gte: lookbackStart } },
      select: {
        product_id: true,
        quantity: true,
        sale_date: true,
        products: {
          select: {
            name: true,
            sku: true,
            group: true,
            category: true
          }
        }
      },
      orderBy: { sale_date: 'asc' }
    })
  ]);

  const salesByProduct = {};

  salesRows.forEach((row) => {
    if (!salesByProduct[row.product_id]) {
      salesByProduct[row.product_id] = {
        quantity: 0,
        product: row.products,
        dailySales: []
      };
    }
    salesByProduct[row.product_id].quantity += toNumber(row.quantity);
    salesByProduct[row.product_id].dailySales.push(toNumber(row.quantity));
  });

  const forecast = levels.map((level) => {
    const sold = toNumber(salesByProduct[level.product_id]?.quantity);
    const dailySales = salesByProduct[level.product_id]?.dailySales || [];
    const avgDailyDemand = sold / Math.max(lookbackDays, 1);
    
    // Advanced trend calculation
    const trend = calculateTrend(dailySales);
    const trendMultiplier = trend === 'UP' ? 1.15 : trend === 'DOWN' ? 0.85 : 1.0;
    
    // Seasonal analysis
    const seasonality = detectSeasonality(dailySales);
    
    // Exponential smoothing for smoother forecast
    const smoothedDemand = exponentialSmoothing(dailySales);
    
    // Adjusted forecast based on trend and seasonality
    const forecastDemand = (smoothedDemand * horizonDays) * trendMultiplier * seasonality.coefficient;
    const reorderPoint = (smoothedDemand * (leadTimeDays + safetyStockDays)) * trendMultiplier;
    const currentStock = toNumber(level.closing_qty);
    const recommendedOrderQty = Math.max(0, Math.ceil(reorderPoint - currentStock));
    const stockCoverDays = smoothedDemand > 0 ? currentStock / smoothedDemand : 999;

    let riskLevel = 'LOW';
    if (stockCoverDays < leadTimeDays) riskLevel = 'HIGH';
    else if (stockCoverDays < leadTimeDays + safetyStockDays) riskLevel = 'MEDIUM';

    return {
      product_id: level.product_id,
      name: level.name,
      sku: level.sku,
      group: level.group,
      category: level.category,
      current_stock: currentStock,
      avg_daily_demand: Number(avgDailyDemand.toFixed(2)),
      smoothed_demand: Number(smoothedDemand.toFixed(2)),
      forecast_demand: Number(forecastDemand.toFixed(2)),
      stock_cover_days: Number(stockCoverDays.toFixed(2)),
      reorder_point: Number(reorderPoint.toFixed(2)),
      recommended_order_qty: recommendedOrderQty,
      risk_level: riskLevel,
      trend: trend,
      trend_multiplier: trendMultiplier,
      seasonality_pattern: seasonality.pattern,
      seasonality_coefficient: seasonality.coefficient,
      daily_sales_history: dailySales.slice(-7), // Last 7 days for charting
      rationale: `${trend} trend, ${seasonality.pattern} detected. Based on ${lookbackDays}d sales, lead time ${leadTimeDays}d, and safety stock ${safetyStockDays}d.`
    };
  });

  const aiAdjustments = await generateAiDemandAdjustments({
    products: forecast,
    horizonDays,
    leadTimeDays,
    safetyStockDays,
  });

  const adjustedForecast = forecast.map((item) => {
    const aiAdjustment = aiAdjustments.get(item.product_id);
    const demandMultiplier = aiAdjustment?.demandMultiplier ?? 1;
    const adjustedForecastDemand = item.forecast_demand * demandMultiplier;
    const adjustedReorderPoint = item.reorder_point * demandMultiplier;
    const adjustedDailyDemand = adjustedForecastDemand / Math.max(horizonDays, 1);
    const adjustedStockCoverDays = adjustedDailyDemand > 0 ? item.current_stock / adjustedDailyDemand : 999;
    const adjustedRiskLevel = adjustedStockCoverDays < leadTimeDays
      ? 'HIGH'
      : adjustedStockCoverDays < leadTimeDays + safetyStockDays
        ? 'MEDIUM'
        : 'LOW';

    return {
      ...item,
      baseline_forecast_demand: item.forecast_demand,
      baseline_reorder_point: item.reorder_point,
      forecast_demand: Number(adjustedForecastDemand.toFixed(2)),
      reorder_point: Number(adjustedReorderPoint.toFixed(2)),
      recommended_order_qty: Math.max(0, Math.ceil(adjustedReorderPoint - item.current_stock)),
      stock_cover_days: Number(adjustedStockCoverDays.toFixed(2)),
      risk_level: adjustedRiskLevel,
      ai_demand_multiplier: Number(demandMultiplier.toFixed(2)),
      ai_confidence: Number((aiAdjustment?.confidence ?? 0.5).toFixed(2)),
      ai_reasoning: aiAdjustment?.reasoning || '',
      rationale: aiAdjustment?.reasoning
        ? `${item.rationale} AI model adjustment (${demandMultiplier.toFixed(2)}x): ${aiAdjustment.reasoning}`
        : item.rationale,
    };
  });

  return adjustedForecast
    .sort((a, b) => {
      if (a.risk_level === b.risk_level) return b.recommended_order_qty - a.recommended_order_qty;
      const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return rank[b.risk_level] - rank[a.risk_level];
    });
};

// Auto-generate purchase orders for critical items
exports.autoGeneratePurchaseOrders = async ({ forecastData, supplierId = null }) => {
  const criticalItems = forecastData.filter(item => 
    (item.risk_level === 'HIGH' || item.risk_level === 'MEDIUM') && 
    item.recommended_order_qty > 0
  );

  const createdOrders = [];

  for (const item of criticalItems) {
    try {
      const order = await prisma.purchases.create({
        data: {
          supplier_id: supplierId || 'default-supplier-id', // TODO: Get from UI
          product_id: item.product_id,
          quantity: item.recommended_order_qty,
          unit_price: '1000.00', // TODO: Get from supplier pricing
          discount: '0.00',
          tax: '0.00',
          purchase_date: new Date()
        }
      });
      createdOrders.push({
        ...item,
        purchase_order_id: order.id,
        status: 'CREATED'
      });
    } catch (err) {
      createdOrders.push({
        ...item,
        status: 'FAILED',
        error: err.message
      });
    }
  }

  return {
    total: criticalItems.length,
    created: createdOrders.filter(o => o.status === 'CREATED').length,
    failed: createdOrders.filter(o => o.status === 'FAILED').length,
    orders: createdOrders
  };
};

// Export forecast to CSV format
exports.exportForecastToCSV = (forecastData) => {
  const headers = [
    'SKU',
    'Product Name',
    'Current Stock',
    'Avg Daily Demand',
    'Smoothed Demand',
    'Forecast (30d)',
    'Reorder Point',
    'Recommended Order',
    'Risk Level',
    'Trend',
    'Seasonality Pattern',
    'Stock Cover Days'
  ];

  const rows = forecastData.map(item => [
    item.sku,
    item.name,
    item.current_stock,
    item.avg_daily_demand,
    item.smoothed_demand,
    item.forecast_demand,
    item.reorder_point,
    item.recommended_order_qty,
    item.risk_level,
    item.trend,
    item.seasonality_pattern,
    item.stock_cover_days
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
};

// Generate analytics summary
exports.generateForecastAnalytics = (forecastData) => {
  const riskCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  const trendCounts = { UP: 0, DOWN: 0, STABLE: 0 };
  const seasonalityCounts = {};

  let totalRecommendedOrders = 0;
  let totalOrderValue = 0; // Assuming 1000 per unit

  forecastData.forEach(item => {
    riskCounts[item.risk_level]++;
    trendCounts[item.trend]++;
    seasonalityCounts[item.seasonality_pattern] = (seasonalityCounts[item.seasonality_pattern] || 0) + 1;
    totalRecommendedOrders += item.recommended_order_qty;
    totalOrderValue += item.recommended_order_qty * 1000; // Placeholder unit cost
  });

  return {
    totalProducts: forecastData.length,
    riskSummary: riskCounts,
    trendSummary: trendCounts,
    seasonalitySummary: seasonalityCounts,
    totalRecommendedQuantity: totalRecommendedOrders,
    estimatedOrderValue: totalOrderValue,
    averageStockCoverDays: (forecastData.reduce((a, b) => a + b.stock_cover_days, 0) / forecastData.length).toFixed(2),
    highestRiskProducts: forecastData
      .filter(p => p.risk_level === 'HIGH')
      .slice(0, 5)
      .map(p => ({ name: p.name, sku: p.sku, stockCovers: p.stock_cover_days, trend: p.trend }))
  };
};
