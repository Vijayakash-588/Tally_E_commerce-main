const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    const dbUser = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        roles: {
          select: { name: true }
        }
      }
    });

    if (!dbUser) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = {
      id: dbUser.id,
      sub: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.roles?.name || decoded.role || 'user'
    };

    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.authorize = authorize;
