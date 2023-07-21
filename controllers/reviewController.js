const mongoose = require('mongoose');
const moment = require('moment');
const sharp = require('sharp');
const Review = require('../models/reviewModel');
const Event = require('../models/eventModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/error');
const catchAsync = require('../utils/catchAsync');
const ApiQuery = require('../utils/apiquery');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');

exports.setEventUserIds = (req, res, next) => {
  if (!req.body.event) req.body.event_id = req.params.eventId;
  if (!req.body.user) req.body.user_id = req.user.id;
  next();
};

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filterData = {};
  if (req.query.key) {
    const regex = new RegExp(req.query.key, 'i');
    filterData = { name: { $regex: regex } };
  }
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  const reviews = await Review.find(filterData)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'event_id',
      select: 'name _id',
    })
    .populate({
      path: 'user_id',
      select: 'name surname _id',
    });

  const formattedReviews = reviews.map((review) => {
    const formattedDate = moment(review.createdAt).format('DD/MM/YYYY HH:mm');
    return { ...review._doc, createdAt: formattedDate };
  });

  const count = await Review.countDocuments();
  const totalPages = Math.ceil(count / limit);
  let message = '';
  if (req.query.m) {
    if (req.query.m === '1') {
      message = 'Review added';
    } else if (req.query.m === '2') {
      message = 'Review deleted';
    }
  }

  res.render('Reviews/reviews', {
    title: 'Review',
    reviews: formattedReviews,
    page,
    limit,
    totalPages,
    message,
  });
});

exports.getReview = factory.getOne(Review);

exports.editReview = catchAsync(async (req, res, next) => {
  let query = await Review.findById(req.params.id)
    .populate({
      path: 'event_id',
      select: 'name _id',
    })
    .populate({
      path: 'user_id',
      select: 'name surname _id',
    });

  const doc = await query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  const formattedDate = moment(doc.createdAt).format('DD/MM/YYYY HH:mm');
  doc.user_id.name =
    doc.user_id.name.charAt(0).toUpperCase() +
    doc.user_id.name.slice(1).toLowerCase();
  doc.user_id.surname =
    doc.user_id.surname.charAt(0).toUpperCase() +
    doc.user_id.surname.slice(1).toLowerCase();

  let message = '';
  res.render('Reviews/edit', {
    status: 200,
    title: 'Edit review',
    formData: {
      ...doc.toObject(),
      createdAt: formattedDate,
    },
    message: message,
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const doc = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.redirect(doc._id);
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const doc = await Review.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.redirect('/reviews?m=2');
});
