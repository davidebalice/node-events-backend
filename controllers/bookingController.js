const multer = require('multer');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Booking = require('../models/bookingModel');
const ApiQuery = require('../middlewares/apiquery');
const AppError = require('../middlewares/error');
const catchAsync = require('../middlewares/catchAsync');
const factory = require('./handlerFactory');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const moment = require('moment');

exports.getAllBookings = catchAsync(async (req, res, next) => {
  let filterData = {};
  if (req.query.key) {
    const regex = new RegExp(req.query.key, 'i');
    filterData = { name: { $regex: regex } };
  }
  const setLimit = 20;
  const limit = req.query.limit * 1 || setLimit;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;
  const bookings = await Booking.find(filterData).sort('-createdAt').skip(skip).limit(limit);
  const count = await Booking.countDocuments();
  const totalPages = Math.ceil(count / limit);

  let message = '';
  if (req.query.m) {
    if (req.query.m === '1') {
      message = 'Booking added';
    } else if (req.query.m === '2') {
      message = 'Booking deleted';
    }
  }

  //?viewType=json
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  const viewType = req.query.viewType;
  if (viewType === 'json') {
    console.log(bookings);
    res.json(bookings);
  } else {
    res.render('Bookings/bookings', {
      title: 'Bookings',
      bookings: bookings.map((booking) => ({
        ...booking.toObject(),
        createdAt: moment(booking.createdAt).format('DD/MM/YYYY HH:mm'),
      })),
      currentPage: page,
      page,
      limit,
      totalPages,
      message,
      flashMessage: flashMessage || null,
    });
  }
});

exports.editBooking = catchAsync(async (req, res, next) => {
  let query = await Booking.findById(req.params.id);

  const doc = await query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  const formattedDate = moment(doc.createdAt).format('DD/MM/YYYY HH:mm');

  let message = '';
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  res.render('Bookings/edit', {
    status: 200,
    title: 'Edit booking',
    formData: {
      ...doc.toObject(),
      createdAt: formattedDate,
    },
    message: message,
    flashMessage: flashMessage || null,
  });
});

exports.updateBooking = catchAsync(async (req, res, next) => {
  const doc = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  req.flash('message', 'Booking updated successfully');
  req.flash('error', 'Error during update');

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  res.render('Bookings/edit', {
    title: 'Edit tour',
    formData: doc,
    DEMO_MODE: process.env.DEMO_MODE,
    message: req.flash('message'),
    error: req.flash('error'),
    flashMessage: flashMessage || null,
  });
});

exports.deleteBooking = catchAsync(async (req, res, next) => {
  const doc = await Booking.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  res.redirect('/bookings?m=2');
});
