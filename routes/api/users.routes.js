const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');
const usersApiController = require('../../controllers/api/users.api.controller');

router.put('/:id/status', requireAdmin, usersApiController.updateUserStatus);

module.exports = router;