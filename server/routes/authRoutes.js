const express = require('express');
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/validateMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(validateRegister), (req, res, next) => {
  authController.register(req, res, next);
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user & get token
 * @access  Public
 */
router.post('/login', validate(validateLogin), (req, res, next) => {
  authController.login(req, res, next);
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (Authenticated)
 */
router.get('/me', authenticate, (req, res, next) => {
  authController.getProfile(req, res, next);
});

module.exports = router;
