const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const journeysPageController = require('../../controllers/pages/journeys.page.controller');

router.get('/new', requireAuth, journeysPageController.showNewJourneyForm);
router.get('/', requireAuth, journeysPageController.showMyJourneys);
router.get('/:id', requireAuth, journeysPageController.showJourneyDetails);

module.exports = router;