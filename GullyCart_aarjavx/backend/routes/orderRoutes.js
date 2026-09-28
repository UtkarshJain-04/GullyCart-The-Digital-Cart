const express = require('express');
const { orderController } = require('../controllers');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { asyncHandler } = require('../controllers/helpers');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('user'), asyncHandler(orderController.create));
router.get('/customer', authenticateToken, authorizeRoles('user'), asyncHandler(orderController.listCustomerOrders));
router.get('/vendor/:vendorId', authenticateToken, authorizeRoles('vendor'), asyncHandler(orderController.listVendorOrders));
router.patch('/:orderId/status', authenticateToken, authorizeRoles('vendor'), asyncHandler(orderController.updateStatus));

module.exports = router;