const { sendError } = require('../utils/responseUtil');

/**
 * Centralized Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err);

  // Operational error with predefined status code
  if (err.isOperational) {
    return sendError(
      res,
      err.message,
      err.statusCode,
      err.errors
    );
  }

  // Handle SyntaxError (e.g. malformed JSON in request body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Invalid JSON payload in request body.', 400);
  }

  // Catch-all generic internal server error
  return sendError(
    res,
    process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred on the server.' 
      : err.message || 'Internal Server Error',
    500
  );
};

module.exports = { errorHandler };
