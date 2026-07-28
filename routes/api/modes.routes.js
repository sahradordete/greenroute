const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');
const modesApiController = require('../../controllers/api/modes.api.controller');

router.get('/', modesApiController.getActiveModes);
router.post('/', requireAdmin, modesApiController.createMode);
router.put('/:id', requireAdmin, modesApiController.updateMode);
router.delete('/:id', requireAdmin, modesApiController.deleteMode);

module.exports = router;