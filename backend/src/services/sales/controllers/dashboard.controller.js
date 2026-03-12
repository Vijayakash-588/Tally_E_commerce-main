const service = require('../services/dashboard.service');

/**
 * Get dashboard summary data
 */
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const data = await service.getDashboardData();
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};
