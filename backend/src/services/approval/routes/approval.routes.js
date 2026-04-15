const express = require('express');
const router = express.Router();
const controller = require('../controllers/approval.controller');
const auth = require('../../../middlewares/auth');
const { authorize } = auth;
const { createAuditLogger } = require('../../../middlewares/audit.middleware');

router.use(auth);

router.get('/', authorize('admin', 'manager'), controller.findAll);
router.get('/:id', authorize('admin', 'manager'), controller.findById);

router.post(
  '/request',
  authorize('admin', 'manager'),
  createAuditLogger('CREATE_APPROVAL_REQUEST', 'approval_request'),
  controller.createRequest
);

router.patch(
  '/:id/approve',
  authorize('admin'),
  createAuditLogger('APPROVE_REQUEST', 'approval_request'),
  controller.approve
);

router.patch(
  '/:id/reject',
  authorize('admin'),
  createAuditLogger('REJECT_REQUEST', 'approval_request'),
  controller.reject
);

module.exports = router;
