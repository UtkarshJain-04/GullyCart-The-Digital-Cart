const express = require('express');
const { vendorController } = require('../controllers');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { asyncHandler } = require('../controllers/helpers');

const router = express.Router();

router.get('/nearby', asyncHandler(vendorController.findNearby));
router.get('/me/profile', authenticateToken, authorizeRoles('vendor'), asyncHandler(vendorController.getProfile));
router.patch('/me/profile', authenticateToken, authorizeRoles('vendor'), asyncHandler(vendorController.updateProfile));
router.patch('/:vendorId/location', authenticateToken, authorizeRoles('vendor'), asyncHandler(vendorController.updateLocation));
router.patch('/:vendorId/status', authenticateToken, authorizeRoles('vendor'), asyncHandler(vendorController.updateSellingStatus));

module.exports = router;