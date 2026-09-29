const userModel = require('../models/userModel');
const { generateToken } = require('../utils/tokenUtil');
const { comparePassword } = require('../utils/passwordUtil');
const { sendSuccess, sendCreated, sendError } = require('../utils/responseUtil');

/**
 * Auth Controller
 */
class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      // Check if username already exists
      const existingUsername = await userModel.findByUsername(username);
      if (existingUsername) {
        return sendError(res, 'Username is already taken.', 409);
      }

      // Check if email already exists
      const existingEmail = await userModel.findByEmail(email);
      if (existingEmail) {
        return sendError(res, 'Email is already registered.', 409);
      }

      // Create new user (default role: 'user')
      const newUser = await userModel.create({
        username,
        email,
        password,
        role: 'user'
      });

      const sanitizedUser = userModel.sanitizeUser(newUser);

      // Generate JWT
      const token = generateToken({
        id: sanitizedUser.id,
        role: sanitizedUser.role,
        email: sanitizedUser.email,
        username: sanitizedUser.username
      });

      return sendCreated(res, 'User registered successfully.', {
        user: sanitizedUser,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { identifier, email, username, password } = req.body;
      const loginIdentifier = identifier || email || username;

      // Find user by username or email
      const user = await userModel.findByIdentifier(loginIdentifier);
      if (!user) {
        return sendError(res, 'Invalid credentials. User not found.', 401);
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return sendError(res, 'Invalid credentials. Password incorrect.', 401);
      }

      const sanitizedUser = userModel.sanitizeUser(user);

      // Generate JWT
      const token = generateToken({
        id: sanitizedUser.id,
        role: sanitizedUser.role,
        email: sanitizedUser.email,
        username: sanitizedUser.username
      });

      return sendSuccess(res, 'Login successful.', {
        user: sanitizedUser,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get currently authenticated user profile
   * GET /api/auth/me
   */
  async getProfile(req, res, next) {
    try {
      return sendSuccess(res, 'User profile retrieved successfully.', {
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
