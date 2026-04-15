const forecastService = require('../services/forecast.service');

exports.getForecast = async (req, res, next) => {
  try {
    const lookbackDays = Number(req.query.lookbackDays || 30);
    const horizonDays = Number(req.query.horizonDays || 30);
    const leadTimeDays = Number(req.query.leadTimeDays || 7);
    const safetyStockDays = Number(req.query.safetyStockDays || 3);

    const data = await forecastService.getDemandForecast({
      lookbackDays,
      horizonDays,
      leadTimeDays,
      safetyStockDays
    });

    res.json({
      success: true,
      params: {
        lookbackDays,
        horizonDays,
        leadTimeDays,
        safetyStockDays
      },
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};

// Get forecast with analytics
exports.getForecastWithAnalytics = async (req, res, next) => {
  try {
    const lookbackDays = Number(req.query.lookbackDays || 30);
    const horizonDays = Number(req.query.horizonDays || 30);
    const leadTimeDays = Number(req.query.leadTimeDays || 7);
    const safetyStockDays = Number(req.query.safetyStockDays || 3);

    const forecast = await forecastService.getDemandForecast({
      lookbackDays,
      horizonDays,
      leadTimeDays,
      safetyStockDays
    });

    const analytics = forecastService.generateForecastAnalytics(forecast);

    res.json({
      success: true,
      forecast,
      analytics
    });
  } catch (err) {
    next(err);
  }
};

// Export forecast to CSV
exports.exportForecast = async (req, res, next) => {
  try {
    const lookbackDays = Number(req.query.lookbackDays || 30);
    const horizonDays = Number(req.query.horizonDays || 30);
    const leadTimeDays = Number(req.query.leadTimeDays || 7);
    const safetyStockDays = Number(req.query.safetyStockDays || 3);

    const forecast = await forecastService.getDemandForecast({
      lookbackDays,
      horizonDays,
      leadTimeDays,
      safetyStockDays
    });

    const csv = forecastService.exportForecastToCSV(forecast);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="demand-forecast.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

// Auto-generate purchase orders
exports.autoGeneratePurchaseOrders = async (req, res, next) => {
  try {
    const lookbackDays = Number(req.query.lookbackDays || 30);
    const horizonDays = Number(req.query.horizonDays || 30);
    const leadTimeDays = Number(req.query.leadTimeDays || 7);
    const safetyStockDays = Number(req.query.safetyStockDays || 3);
    const supplierId = req.body.supplierId || null;

    const forecast = await forecastService.getDemandForecast({
      lookbackDays,
      horizonDays,
      leadTimeDays,
      safetyStockDays
    });

    const result = await forecastService.autoGeneratePurchaseOrders({ forecastData: forecast, supplierId });

    res.status(201).json({
      success: true,
      message: 'Purchase orders generated',
      result
    });
  } catch (err) {
    next(err);
  }
};
