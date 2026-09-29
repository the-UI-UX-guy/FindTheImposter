const userModel = require('../models/userModel');
const { sendSuccess, sendError } = require('../utils/responseUtil');

/**
 * User Controller (Admin & User Management)
 */
class UserController {
  /**
   * Get all users (Admin only)
   * GET /api/users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await userModel.findAll();
      return sendSuccess(res, 'Users retrieved successfully.', {
        count: users.length,
        users
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (Admin or Self)
   * GET /api/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      // Check if self or admin
      if (req.user.id !== id && req.user.role !== 'admin') {
        return sendError(res, 'Access denied. You can only view your own profile.', 403);
      }

      const user = await userModel.findById(id);
      if (!user) {
        return sendError(res, 'User not found.', 404);
      }

      return sendSuccess(res, 'User retrieved successfully.', {
        user: userModel.sanitizeUser(user)
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role (Admin only)
   * PATCH /api/users/:id/role
   */
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const user = await userModel.findById(id);
      if (!user) {
        return sendError(res, 'User not found.', 404);
      }

      const updatedUser = await userModel.updateRole(id, role);

      return sendSuccess(res, `User role updated to '${role}' successfully.`, {
        user: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
