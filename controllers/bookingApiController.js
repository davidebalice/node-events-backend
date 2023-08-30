const multer = require('multer');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Booking = require('../models/bookingModel');
const ApiQuery = require('../middlewares/apiquery');
const AppError = require('../middlewares/error');
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

/*
exports.addCategory = catchAsync(async (req, res, next) => {
  res.locals = { title: 'Add category' };
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  res.render('Categories/add', { formData: '', message: '', flashMessage: flashMessage || null });
});



exports.deleteCategory = catchAsync(async (req, res, next) => {
  const doc = await Category.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  res.redirect('/categories?m=2');
});

exports.getCategory = factory.getOne(Category, { path: 'reviews' });

exports.editCategory = catchAsync(async (req, res, next) => {
  let query = await Category.findById(req.params.id);

  const doc = await query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  let message = '';
  res.render('Categories/edit', {
    status: 200,
    title: 'Edit category',
    formData: doc,
    message: message,
    flashMessage: flashMessage || null,
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const doc = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.redirect(doc._id);
});

exports.photoCategory = catchAsync(async (req, res, next) => {
  let query = await Category.findById(req.params.id);
  const doc = await query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  let message = '';
  res.render('Categories/photo', {
    status: 200,
    title: 'Photo category',
    formData: doc,
    message: message,
    flashMessage: flashMessage || null,
  });
});

exports.updatePhoto = catchAsync(async (req, res, next) => {
  const doc = await Category.findByIdAndUpdate(req.params.id, req.body);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.redirect('/category/photo/' + doc._id);
});

exports.moveCategory = catchAsync(async (req, res, next) => {
  try {
    const { categoryId, direction } = req.body;

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const categories = await Category.find().sort({ order: 1 }).exec();
    const currentIndex = categories.findIndex((cat) => cat.id === categoryId);

    if (direction === 'up' && currentIndex > 0) {
      const tempOrder = categories[currentIndex].order;
      categories[currentIndex].order = categories[currentIndex - 1].order;
      categories[currentIndex - 1].order = tempOrder;
    } else if (direction === 'down' && currentIndex < categories.length - 1) {
      const tempOrder = categories[currentIndex].order;
      categories[currentIndex].order = categories[currentIndex + 1].order;
      categories[currentIndex + 1].order = tempOrder;
    } else {
      return res.status(400).json({ message: 'error' });
    }

    categories.sort((a, b) => a.order - b.order);

    categories.forEach((cat, index) => {
      cat.order = index + 1;
    });

    await Promise.all(categories.map((cat) => Category.findOneAndUpdate({ _id: cat._id }, { order: cat.order })));

    res.status(200).json({ message: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error' });
  }
});

exports.activeCategory = catchAsync(async (req, res, next) => {
  const doc = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
});
*/
