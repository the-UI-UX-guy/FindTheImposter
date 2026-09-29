const { sendError } = require('../utils/responseUtil');

/**
 * Higher-order middleware to run request validation
 * @param {Function} validatorFn - Validator function that returns array of errors or null
 * @param {string} [source='body'] - Request property to validate ('body', 'query', 'params')
 */
const validate = (validatorFn, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const errors = validatorFn(dataToValidate);

    if (errors && errors.length > 0) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    next();
  };
};

module.exports = { validate };
