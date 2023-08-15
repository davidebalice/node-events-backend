const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventApiController');
const reviewRouter = require('./reviewRoutes');

router.use('/:eventId/reviews', reviewRouter);
router.route('/events').get(eventController.getAllEvents);

router.route('/event/:id').get(eventController.getEvent);

router.route('/updatedatefordemo').get(eventController.updateDateForDemo);

module.exports = router;
