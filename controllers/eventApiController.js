const multer = require('multer');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Event = require('../models/eventModel');
const ApiQuery = require('../utils/apiquery');
const AppError = require('../utils/error');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const fs = require('fs');
const path = require('path');

exports.getAllEvents = catchAsync(async (req, res, next) => {
  let filterData = {};
  if (req.query.key) {
    const regex = new RegExp(req.query.key, 'i');
    filterData = { name: { $regex: regex } };
  }
  const page = req.query.page * 1 || 1;
  const setLimit = 1;
  const limit = req.query.limit * 1 || setLimit;
  const skip = (page - 1) * limit;
  const events = await Event.find(filterData)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);
  const count = await Event.countDocuments();
  const totalPages = Math.ceil(count / limit);
  let message = '';
  if (req.query.m) {
    if (req.query.m === '1') {
      message = 'Event added';
    } else if (req.query.m === '2') {
      message = 'Event deleted';
    }
  }

  if (events) {
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: events.length,
      events: events,
    });
  } else {
    return res.status(404).json({
      status: 'fail',
      message: 'events not found',
    });
  }
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  const event = await Event.findOne({ _id: id });
  const count = await Event.countDocuments();

  console.log(event);

  if (event) {
    res.status(200).json({
      status: 'success',
      data: {
        event,
      },
    });
  } else {
    return res.status(404).json({
      status: 'fail',
      mesage: 'invalid id',
    });
  }
});
