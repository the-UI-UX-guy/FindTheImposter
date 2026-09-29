const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const healthController = require('../controllers/healthController');

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  healthController.getHealth(req, res);
});

// Authentication routes
router.use('/auth', authRoutes);

// User management routes
router.use('/users', userRoutes);

module.exports = router;
