const { sendError } = require('../utils/responseUtil');

/**
 * Role Authorization Middleware (RBAC)
 * @param  {...string} allowedRoles - List of authorized roles (e.g. 'admin', 'user')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required before checking roles.', 401);
    }

    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
    const userRole = (req.user.role || '').toLowerCase();

    if (!normalizedAllowedRoles.includes(userRole)) {
      return sendError(
        res,
        `Access denied. You do not have permission to perform this action. Required role: [${allowedRoles.join(', ')}].`,
        403
      );
    }

    next();
  };
};

module.exports = { authorizeRoles };
