const express = require('express');
const { adminController } = require('../controllers');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { asyncHandler } = require('../controllers/helpers');

const router = express.Router();
const adminOnly = [authenticateToken, authorizeRoles('admin')];

router.get('/dashboard', ...adminOnly, asyncHandler(adminController.dashboard));
router.get('/vendors/requests', ...adminOnly, asyncHandler(adminController.vendorRequests));
router.patch('/vendors/:vendorId/approve', ...adminOnly, asyncHandler(adminController.approveVendor));
router.patch('/vendors/:vendorId/reject', ...adminOnly, asyncHandler(adminController.rejectVendor));
router.patch('/vendors/:vendorId/suspend', ...adminOnly, asyncHandler(adminController.suspendVendor));
router.patch('/vendors/:vendorId/restore', ...adminOnly, asyncHandler(adminController.restoreVendor));
router.get('/complaints', ...adminOnly, asyncHandler(adminController.complaints));
router.patch('/complaints/:complaintId', ...adminOnly, asyncHandler(adminController.reviewComplaint));

module.exports = router;