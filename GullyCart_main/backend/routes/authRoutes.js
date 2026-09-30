const express = require('express');
const { authController } = require('../controllers');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../controllers/helpers');

const router = express.Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/me', authenticateToken, authController.currentUser);

module.exports = router;