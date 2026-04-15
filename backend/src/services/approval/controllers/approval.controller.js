const service = require('../services/approval.service');

exports.createRequest = async (req, res, next) => {
  try {
    const request = await service.createRequest({
      userId: req.user?.id,
      module: req.body.module,
      action: req.body.action,
      entityType: req.body.entityType,
      entityId: req.body.entityId,
      reason: req.body.reason,
      payload: req.body.payload
    });

    res.status(201).json({
      success: true,
      message: 'Approval request created',
      data: request
    });
  } catch (err) {
    next(err);
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const result = await service.findAll(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const record = await service.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.approve = async (req, res, next) => {
  try {
    const record = await service.review({
      id: req.params.id,
      reviewerId: req.user?.id,
      status: 'APPROVED',
      notes: req.body?.notes
    });

    res.json({ success: true, message: 'Approval request approved', data: record });
  } catch (err) {
    next(err);
  }
};

exports.reject = async (req, res, next) => {
  try {
    const record = await service.review({
      id: req.params.id,
      reviewerId: req.user?.id,
      status: 'REJECTED',
      notes: req.body?.notes
    });

    res.json({ success: true, message: 'Approval request rejected', data: record });
  } catch (err) {
    next(err);
  }
};
