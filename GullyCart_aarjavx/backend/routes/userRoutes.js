const express = require('express');
const { userController } = require('../controllers');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { asyncHandler } = require('../controllers/helpers');

const router = express.Router();

router.get('/me/profile', authenticateToken, authorizeRoles('user', 'vendor', 'admin'), asyncHandler(userController.getProfile));
router.patch('/me/profile', authenticateToken, authorizeRoles('user', 'vendor', 'admin'), asyncHandler(userController.updateProfile));
router.patch('/me/credentials', authenticateToken, authorizeRoles('user', 'vendor', 'admin'), asyncHandler(userController.updateCredentials));

module.exports = router;