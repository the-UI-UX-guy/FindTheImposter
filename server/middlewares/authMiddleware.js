const { verifyToken } = require('../utils/tokenUtil');
const { sendError } = require('../utils/responseUtil');
const userModel = require('../models/userModel');

/**
 * Authentication Middleware: Verifies JWT token and attaches user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(
        res,
        'Access denied. No authentication token provided.',
        401
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(
        res,
        'Authentication token is missing.',
        401
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Authentication token has expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid authentication token.', 401);
    }

    // Check if user still exists
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return sendError(res, 'The user belonging to this token no longer exists.', 401);
    }

    // Attach sanitized user to request
    req.user = userModel.sanitizeUser(user);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate };
