const Booking = require('../models/bookingModel');
const catchAsync = require('../middlewares/catchAsync');

exports.createStripeIntent = catchAsync(async (req, res, next) => {
  const { amount } = req.body;
  require('dotenv').config();
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripe = require('stripe')(stripeSecretKey);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating Payment Intent:', error.message);
    res.status(500).json({ error: 'An error occurred' });
  }
});

exports.createBooking = catchAsync(async (req, res, next) => {
  try {
    const newBooking = await Booking.create(req.body);
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      bookingId: newBooking._id.toString(),
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      requestedAt: req.requestTime,
    });
  }
});

exports.successBooking = catchAsync(async (req, res, next) => {
  try {
    console.log(req.body);
    const doc = await Booking.findByIdAndUpdate(req.body.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      requestedAt: req.requestTime,
    });
  }
});
