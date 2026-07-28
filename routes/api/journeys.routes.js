const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const journeysApiController = require('../../controllers/api/journeys.api.controller');

router.post('/', requireAuth, journeysApiController.createJourney);
router.get('/', requireAuth, journeysApiController.getMyJourneys);
router.get('/:id', requireAuth, journeysApiController.getJourneyById);

module.exports = router;