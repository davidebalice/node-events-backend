const express = require('express');
const router = express.Router();
const bookingApiController = require('../controllers/bookingApiController');

router.route('/payment-intent').post(bookingApiController.createStripeIntent);
router.route('/booking/create').post(bookingApiController.createBooking);
router.route('/booking/success').post(bookingApiController.successBooking);

module.exports = router;
