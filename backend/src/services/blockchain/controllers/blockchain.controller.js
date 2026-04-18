const service = require('../services/ethereum.service');

exports.anchor = async (req, res, next) => {
  try {
    const { entityType, entityId, payload } = req.body;

    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        message: 'entityType and entityId are required'
      });
    }

    const result = await service.anchorEntity({
      entityType,
      entityId,
      payload,
      createdBy: req.user?.id || null
    });

    return res.status(result.success ? 200 : 502).json({
      success: result.success,
      data: result
    });
  } catch (err) {
    return next(err);
  }
};

exports.listAnchors = async (req, res, next) => {
  try {
    const anchors = await service.getAnchors({
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      limit: req.query.limit
    });

    return res.json({
      success: true,
      data: anchors,
      count: anchors.length
    });
  } catch (err) {
    return next(err);
  }
};

exports.verifyAnchor = async (req, res, next) => {
  try {
    const result = await service.verifyAnchorById(req.params.id);
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    return next(err);
  }
};

exports.verifyEntity = async (req, res, next) => {
  try {
    const result = await service.verifyEntity(req.params.entityType, req.params.entityId);
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    return next(err);
  }
};

exports.health = async (req, res, next) => {
  try {
    const result = await service.getHealth();
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    return next(err);
  }
};

exports.retryFailed = async (req, res, next) => {
  try {
    const limit = Number(req.body?.limit || req.query?.limit || 25);
    const result = await service.retryFailedAnchors(limit);

    return res.json({
      success: true,
      message: 'Retry queue processed',
      data: result
    });
  } catch (err) {
    return next(err);
  }
};
