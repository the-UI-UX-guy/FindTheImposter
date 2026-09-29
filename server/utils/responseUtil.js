/**
 * Common Response Utility for Uniform API Responses
 */

/**
 * Send standard JSON response
 * @param {import('express').Response} res - Express response object
 * @param {Object} options - Response options
 * @param {number} [options.statusCode=200] - HTTP status code
 * @param {boolean} [options.success=true] - Success status
 * @param {string} [options.message='Success'] - Response message
 * @param {any} [options.data=null] - Response payload
 * @param {any} [options.errors=null] - Errors payload
 * @param {Object} [options.meta=null] - Additional metadata (pagination, etc.)
 */
const sendResponse = (res, {
  statusCode = 200,
  success = true,
  message = 'Success',
  data = null,
  errors = null,
  meta = null
} = {}) => {
  const responsePayload = {
    success,
    statusCode,
    message,
    ...(data !== null && data !== undefined && { data }),
    ...(errors !== null && errors !== undefined && { errors }),
    ...(meta !== null && meta !== undefined && { meta }),
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(responsePayload);
};

/**
 * Standard 200 OK Response
 */
const sendSuccess = (res, message = 'Success', data = null, statusCode = 200, meta = null) => {
  return sendResponse(res, {
    statusCode,
    success: true,
    message,
    data,
    meta
  });
};

/**
 * Standard 201 Created Response
 */
const sendCreated = (res, message = 'Resource created successfully', data = null, meta = null) => {
  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message,
    data,
    meta
  });
};

/**
 * Standard Error Response
 */
const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return sendResponse(res, {
    statusCode,
    success: false,
    message,
    errors
  });
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendCreated,
  sendError
};
