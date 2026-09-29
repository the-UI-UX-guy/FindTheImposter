/**
 * Validation rules for User management endpoints
 */

const ALLOWED_ROLES = ['user', 'admin'];

/**
 * Validator for updating user role
 * @param {Object} body 
 * @returns {Array<string>|null}
 */
const validateUpdateRole = (body) => {
  const errors = [];
  const { role } = body || {};

  if (!role || typeof role !== 'string' || !role.trim()) {
    errors.push('Role is required.');
  } else if (!ALLOWED_ROLES.includes(role.trim().toLowerCase())) {
    errors.push(`Role must be one of the following: ${ALLOWED_ROLES.join(', ')}.`);
  }

  return errors.length > 0 ? errors : null;
};

module.exports = {
  validateUpdateRole,
  ALLOWED_ROLES
};
