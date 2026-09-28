const express = require('express');
const { productController } = require('../controllers');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { asyncHandler } = require('../controllers/helpers');
const productImageUpload = require('../middleware/productImageUpload');

const router = express.Router();

router.get('/vendor/:vendorId', asyncHandler(productController.listByVendor));
router.post('/vendor/:vendorId', authenticateToken, authorizeRoles('vendor'), productImageUpload.single('image'), asyncHandler(productController.create));
router.patch('/:productId', authenticateToken, authorizeRoles('vendor'), productImageUpload.single('image'), asyncHandler(productController.update));
router.patch('/:productId/sold-out', authenticateToken, authorizeRoles('vendor'), asyncHandler(productController.markSoldOut));
router.delete('/:productId', authenticateToken, authorizeRoles('vendor'), asyncHandler(productController.remove));

module.exports = router;