const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { validateUpdateRole } = require('../validators/userValidator');

const router = express.Router();

/**
 * All user routes require authentication
 */
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/', authorizeRoles('admin'), (req, res, next) => {
  userController.getAllUsers(req, res, next);
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or Self)
 */
router.get('/:id', (req, res, next) => {
  userController.getUserById(req, res, next);
});

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 */
router.patch('/:id/role', authorizeRoles('admin'), validate(validateUpdateRole), (req, res, next) => {
  userController.updateUserRole(req, res, next);
});

module.exports = router;
