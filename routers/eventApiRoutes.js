const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventApiController');
const reviewRouter = require('./reviewRoutes');

router.use('/:eventId/reviews', reviewRouter);
router.route('/events').get(eventController.getAllEvents);

router.route('/event/slug/:slug').get(eventController.getEventBySlug);
router.route('/event/id/:id').get(eventController.getEventById);

router.route('/updatedatefordemo').get(eventController.updateDateForDemo);

module.exports = router;
