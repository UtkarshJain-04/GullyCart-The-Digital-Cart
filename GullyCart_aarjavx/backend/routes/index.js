const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/vendors', require('./vendorRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/complaints', require('./complaintRoutes'));

module.exports = router;