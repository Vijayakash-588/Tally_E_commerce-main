const prisma = require('../../../prisma');

exports.createRequest = async ({ userId, module, action, entityType, entityId, reason, payload }) => {
  if (!module || !action) {
    throw new Error('Module and action are required');
  }

  return prisma.approval_requests.create({
    data: {
      module,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      reason: reason || null,
      payload: payload || {},
      status: 'PENDING',
      requested_by: userId || null
    }
  });
};

exports.findAll = async ({ status, module, page = 1, limit = 20 }) => {
  const where = {};
  if (status) where.status = status;
  if (module) where.module = module;

  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    prisma.approval_requests.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: Number(limit)
    }),
    prisma.approval_requests.count({ where })
  ]);

  return {
    data,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)) || 1
  };
};

exports.findById = async (id) => {
  return prisma.approval_requests.findUnique({ where: { id } });
};

exports.review = async ({ id, reviewerId, status, notes }) => {
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new Error('Review status must be APPROVED or REJECTED');
  }

  return prisma.approval_requests.update({
    where: { id },
    data: {
      status,
      review_notes: notes || null,
      approved_by: reviewerId || null,
      reviewed_at: new Date()
    }
  });
};
