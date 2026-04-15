const prisma = require('../prisma');

const safePayload = (body) => {
  if (!body || typeof body !== 'object') return null;
  const clone = { ...body };
  if (clone.password) clone.password = '[REDACTED]';
  if (clone.token) clone.token = '[REDACTED]';
  return clone;
};

exports.createAuditLogger = (action, resource) => {
  return (req, res, next) => {
    const start = Date.now();

    res.on('finish', async () => {
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return;

      try {
        await prisma.audit_logs.create({
          data: {
            user_id: req.user?.id || null,
            action,
            resource,
            resource_id: req.params?.id || null,
            method: req.method,
            endpoint: req.originalUrl,
            payload: safePayload(req.body),
            status_code: res.statusCode,
            latency_ms: Date.now() - start
          }
        });
      } catch (error) {
        // Audit must not break business flow.
        console.error('Audit log write failed:', error.message);
      }
    });

    next();
  };
};
