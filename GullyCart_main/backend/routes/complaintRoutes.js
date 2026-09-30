const express = require('express');
const { complaintController } = require('../controllers');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { asyncHandler } = require('../controllers/helpers');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('user'), asyncHandler(complaintController.create));

module.exports = router;