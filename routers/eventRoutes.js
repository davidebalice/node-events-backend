const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const demoMode = require('../utils/demo_mode');
const User = require('../models/userModel');

router.use('/:eventId/reviews', reviewRouter);

router.route('/').get(authController.protect, async function (req, res) {
  res.locals = { title: 'Dashboard' };
  const users = await User.find().limit(6);
  res.render('Dashboard/index', { users: users });
});

router.route('/events').get(authController.protect, eventController.getAllEvents);

router.route('/add/event').get(authController.protect, function (req, res) {
  res.locals = { title: 'Add event' };
  res.render('Events/add', { formData: '', message: '' });
});

router
  .route('/add/event')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    eventController.createEvent
  );

router
  .route('/event/:id')
  .get(eventController.editEvent)
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    eventController.updateEvent
  );

router
  .route('/event/photo/:id')
  .get(eventController.photoEvent)
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    eventController.uploadImage,
    eventController.resizeImage,
    eventController.updatePhoto
  );

router
  .route('/event/gallery/:id')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    eventController.uploadGallery,
    eventController.resizeGallery,
    eventController.updateGallery
  );

router
  .route('/event/delete/:id')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    eventController.deleteEvent
  );

router
  .route('/gallery/delete')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    eventController.deleteGallery
  );

router
  .route('/event/location/:id')
  .get(eventController.locationEvent)
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    eventController.updateLocation
  );

router
  .route('/event/otherlocation/:id')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    eventController.updateOtherLocation
  );

module.exports = router;
