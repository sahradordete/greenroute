const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');
const adminPageController = require('../../controllers/pages/admin.page.controller');

router.get('/', requireAdmin, adminPageController.dashboard);
router.get('/modes', requireAdmin, adminPageController.showManageModes);
router.get('/users', requireAdmin, adminPageController.showManageUsers);
router.get('/journeys', requireAdmin, adminPageController.showManageJourneys);

module.exports = router;