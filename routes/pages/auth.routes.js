const express = require('express');
const router = express.Router();

const authPageController = require('../../controllers/pages/auth.page.controller');

router.get('/register', authPageController.showRegister);
router.get('/login', authPageController.showLogin);

module.exports = router;