const express = require('express');
const router = express.Router();
const aiController = require('../ai.controller');
const auth = require('../../../middlewares/auth');

// Chat endpoint
router.post('/chat', auth, aiController.chat);

// Prediction endpoints
router.post('/predict/demand', auth, aiController.predictDemand);
router.get('/predict/trends', auth, aiController.predictTrends);

// Anomaly detection endpoints
router.get('/anomalies/sales', auth, aiController.detectSalesAnomalies);
router.get('/anomalies/inventory', auth, aiController.detectInventoryAnomalies);
router.get('/anomalies/business', auth, aiController.detectBusinessAnomalies);

// Recommendation endpoints
router.post('/recommend/products', auth, aiController.recommendProductsForCustomer);
router.get('/recommend/upsell-crosssell', auth, aiController.getUpsellCrossSellStrategy);
router.get('/recommend/inventory', auth, aiController.getInventoryRecommendations);

module.exports = router;
