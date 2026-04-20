const service = require('../services/ethereum.service');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const parsePositiveInt = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const normalizeStatus = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const normalized = String(value).trim().toUpperCase();
  const valid = service.getAnchorStatuses();
  return valid.includes(normalized) ? normalized : null;
};

exports.anchor = async (req, res, next) => {
  try {
    const { entityType, entityId, payload } = req.body;

    if (!isNonEmptyString(entityType) || !isNonEmptyString(entityId)) {
      return res.status(400).json({
        success: false,
        message: 'entityType and entityId are required'
      });
    }

    if (String(entityType).trim().length > 40) {
      return res.status(400).json({
        success: false,
        message: 'entityType must be 40 characters or less'
      });
    }

    if (String(entityId).trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: 'entityId must be 120 characters or less'
      });
    }

    if (payload !== undefined && (payload === null || typeof payload !== 'object' || Array.isArray(payload))) {
      return res.status(400).json({
        success: false,
        message: 'payload must be a JSON object when provided'
      });
    }

    const result = await service.anchorEntity({
      entityType: entityType.trim(),
      entityId: entityId.trim(),
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
    const page = parsePositiveInt(req.query.page, 1);
    const pageSize = parsePositiveInt(req.query.pageSize || req.query.limit, 30);
    const status = normalizeStatus(req.query.status);

    if (page === null || pageSize === null) {
      return res.status(400).json({
        success: false,
        message: 'page and pageSize must be positive integers'
      });
    }

    if (status === null) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${service.getAnchorStatuses().join(', ')}`
      });
    }

    const anchors = await service.getAnchors({
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      status,
      page,
      pageSize
    });

    return res.json({
      success: true,
      data: anchors.items,
      count: anchors.items.length,
      pagination: anchors.pagination
    });
  } catch (err) {
    return next(err);
  }
};

exports.getAnchor = async (req, res, next) => {
  try {
    const anchor = await service.getAnchorById(req.params.id);
    return res.json({
      success: true,
      data: anchor
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
    if (!isNonEmptyString(req.params.entityType) || !isNonEmptyString(req.params.entityId)) {
      return res.status(400).json({
        success: false,
        message: 'entityType and entityId are required'
      });
    }

    const result = await service.verifyEntity(req.params.entityType.trim(), req.params.entityId.trim());
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
