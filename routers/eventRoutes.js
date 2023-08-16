const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const demoMode = require('../middlewares/demoMode');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const Category = require('../models/categoryModel');

router.use('/:eventId/reviews', reviewRouter);

router.route('/').get(authController.protect, async function (req, res) {
  const users = await User.find().sort({ createdAt: -1 }).limit(6);
  const events = await Event.find().sort({ createdAt: -1 }).limit(6);
  res.locals = { title: 'Dashboard', currentUser: res.locals.currentUser };
  res.render('Dashboard/index', { users, events });
});

router.route('/events').get(authController.protect, eventController.getAllEvents);

router
  .route('/add/event')
  .get(authController.protect, eventController.addEvent)
  .post(demoMode, authController.protect, authController.restrictTo('admin'), eventController.createEvent);

router
  .route('/event/:id')
  .get(eventController.editEvent)
  .post(demoMode, authController.protect, authController.restrictTo('admin'), eventController.updateEvent);

router
  .route('/event/photo/:id')
  .get(eventController.photoEvent)
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    eventController.uploadImage,
    eventController.resizeImage,
    eventController.updatePhoto
  );

router
  .route('/event/gallery/:id')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    eventController.uploadGallery,
    eventController.resizeGallery,
    eventController.updateGallery
  );

router
  .route('/event/delete/:id')
  .post(demoMode, authController.protect, authController.restrictTo('admin'), eventController.deleteEvent);

router
  .route('/gallery/delete')
  .post(demoMode, authController.protect, authController.restrictTo('admin'), eventController.deleteGallery);

router
  .route('/event/location/:id')
  .get(eventController.locationEvent)
  .post(demoMode, authController.protect, authController.restrictTo('admin'), eventController.updateLocation);

router
  .route('/active/event/:id')
  .post(demoMode, authController.protect, authController.restrictTo('admin'), eventController.activeEvent);

module.exports = router;
