const prisma = require('../prisma');

const toNumber = (v) => Number(v || 0);

const getRiskInfo = (path, body) => {
  if (path.includes('/purchases')) {
    const amount = toNumber(body.total) || toNumber(body.quantity) * toNumber(body.unit_price);
    if (amount >= 50000) {
      return {
        critical: true,
        module: 'purchase',
        action: 'HIGH_VALUE_PURCHASE',
        reason: `Purchase amount ${amount} exceeds threshold 50000`
      };
    }
  }

  if (path.includes('/inventory')) {
    const qty = toNumber(body.quantity);
    if (qty >= 500) {
      return {
        critical: true,
        module: 'inventory',
        action: 'LARGE_STOCK_MOVEMENT',
        reason: `Stock movement quantity ${qty} exceeds threshold 500`
      };
    }
  }

  if (path.includes('/invoices')) {
    const amount = toNumber(body.totalAmount) || toNumber(body.total_amount);
    if (amount >= 100000) {
      return {
        critical: true,
        module: 'invoice',
        action: 'HIGH_VALUE_INVOICE',
        reason: `Invoice amount ${amount} exceeds threshold 100000`
      };
    }
  }

  return { critical: false };
};

exports.requireApprovalIfCritical = async (req, res, next) => {
  try {
    // Admins can execute directly. Managers are gated for critical requests.
    if (req.user?.role === 'admin') {
      return next();
    }

    const risk = getRiskInfo(req.originalUrl, req.body || {});
    if (!risk.critical) {
      return next();
    }

    const request = await prisma.approval_requests.create({
      data: {
        module: risk.module,
        action: risk.action,
        reason: risk.reason,
        status: 'PENDING',
        requested_by: req.user?.id || null,
        payload: {
          method: req.method,
          endpoint: req.originalUrl,
          body: req.body
        }
      }
    });

    return res.status(202).json({
      success: true,
      requiresApproval: true,
      message: 'Request captured as pending approval due to policy threshold.',
      approvalRequest: request
    });
  } catch (error) {
    next(error);
  }
};
