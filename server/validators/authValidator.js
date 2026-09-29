/**
 * Validation rules for Authentication endpoints
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

/**
 * Validator for user registration
 * @param {Object} body
 * @returns {Array<string>|null} List of error messages, or null if valid
 */
const validateRegister = (body) => {
  const errors = [];
  const { username, email, password, confirmPassword } = body || {};

  // 1. Username validation
  if (!username || typeof username !== 'string' || !username.trim()) {
    errors.push('Username is required.');
  } else if (!USERNAME_REGEX.test(username.trim())) {
    errors.push('Username must be 3-30 characters long and can only contain letters, numbers, and underscores.');
  }

  // 2. Email validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  // 3. Password validation
  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  // 4. Confirm Password validation
  if (!confirmPassword || typeof confirmPassword !== 'string') {
    errors.push('Confirm password is required.');
  } else if (password !== confirmPassword) {
    errors.push('Password and confirm password do not match.');
  }

  return errors.length > 0 ? errors : null;
};

/**
 * Validator for user login
 * @param {Object} body 
 * @returns {Array<string>|null}
 */
const validateLogin = (body) => {
  const errors = [];
  const { email, username, identifier, password } = body || {};

  const loginId = identifier || email || username;

  if (!loginId || typeof loginId !== 'string' || !loginId.trim()) {
    errors.push('Email or username is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  return errors.length > 0 ? errors : null;
};

module.exports = {
  validateRegister,
  validateLogin
};
