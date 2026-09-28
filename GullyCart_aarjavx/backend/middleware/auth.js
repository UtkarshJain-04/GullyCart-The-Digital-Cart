require('dotenv').config();

const jwt = require('jsonwebtoken');

const USER_ROLES = ['user', 'vendor', 'admin'];

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return process.env.JWT_SECRET;
}

function authenticateToken(request, response, next) {
  const authorization = request.get('authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) {
    return response.status(401).json({ message: 'Authentication required.' });
  }

  try {
    request.user = jwt.verify(token, getJwtSecret());
    return next();
  } catch (_error) {
    return response.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function authorizeRoles(...allowedRoles) {
  const invalidRole = allowedRoles.find((role) => !USER_ROLES.includes(role));

  if (invalidRole) {
    throw new Error(`Unknown role: ${invalidRole}`);
  }

  return (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ message: 'You do not have permission to access this resource.' });
    }

    return next();
  };
}

module.exports = {
  USER_ROLES,
  authenticateToken,
  authorizeRoles,
};