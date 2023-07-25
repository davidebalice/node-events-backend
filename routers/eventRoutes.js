const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const demoMode = require('../utils/demo_mode');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');

router.use('/:eventId/reviews', reviewRouter);

router.route('/').get(authController.protect, async function (req, res) {
  res.locals = { title: 'Dashboard' };
  const users = await User.find().limit(6);
  res.render('Dashboard/index', { users: users });
});

router
  .route('/events')
  .get(authController.protect, eventController.getAllEvents);

router
  .route('/add/event')
  .get(authController.protect, async function (req, res) {
    const categories = await Category.find({});
    res.locals = { title: 'Add event' };
    res.render('Events/add', {
      formData: '',
      message: '',
      categories: categories,
    });
  })
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    eventController.createEvent
  );

router
  .route('/event/:id')
  .get(eventController.editEvent)
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    eventController.updateEvent
  );

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
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    eventController.deleteEvent
  );

router
  .route('/gallery/delete')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    eventController.deleteGallery
  );

router
  .route('/event/location/:id')
  .get(eventController.locationEvent)
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin'),
    eventController.updateLocation
  );

module.exports = router;
