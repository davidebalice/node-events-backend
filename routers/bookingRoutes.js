const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
const demoMode = require('../middlewares/demoMode');
const User = require('../models/userModel');

router
  .route('/bookings')
  .get(authController.protect, authController.restrictTo('admin'), bookingController.getAllBookings);

router
  .route('/booking/:id')
  .get(authController.protect, authController.restrictTo('admin'), bookingController.editBooking)
  .post(demoMode, authController.protect, authController.restrictTo('admin'), bookingController.updateBooking);

router
  .route('/booking/delete/:id')
  .post(
    demoMode,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.deleteBooking
  );

module.exports = router;