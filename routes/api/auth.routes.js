const express = require('express');
const router = express.Router();

const authApiController = require('../../controllers/api/auth.api.controller');

router.post('/register', authApiController.register);
router.post('/login', authApiController.login);
router.post('/logout', authApiController.logout);

module.exports = router;