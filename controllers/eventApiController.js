const multer = require('multer');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Event = require('../models/eventModel');
const ApiQuery = require('../middlewares/apiquery');
const AppError = require('../middlewares/error');
const catchAsync = require('../middlewares/catchAsync');
const factory = require('./handlerFactory');
const fs = require('fs');
const path = require('path');
const { parseISO, format, startOfMonth, endOfMonth } = require('date-fns');

exports.getAllEvents = catchAsync(async (req, res, next) => {
  let filterData = {};

  if (req.query.key) {
    const regex = new RegExp(req.query.key, 'i');
    filterData = {
      name: { $regex: regex },
      active: true,
    };
  } else {
    filterData = { active: true };
  }
  const page = req.query.page * 1 || 1;
  const setLimit = 30;
  const limit = req.query.limit * 1 || setLimit;
  const skip = (page - 1) * limit;
  const events = await Event.find(filterData).sort('-createdAt').skip(skip).limit(limit);
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
  const event = await Event.findOne({ _id: id, active: true });
  const count = await Event.countDocuments();

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

exports.updateDateForDemo = catchAsync(async (req, res, next) => {
  const events = await Event.find();
  const currentMonth = new Date().getMonth();

  function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  }

  for (const event of events) {
    event.startDate.setMonth(currentMonth);
    let formattedStartDate = format(event.startDate, 'yyyy-MM-dd HH:mm');

    let updateObj = { startDate: formattedStartDate };

    if (isValidDate(event.endDate)) {
      event.endDate.setMonth(currentMonth);
      let formattedEndDate = format(event.endDate, 'yyyy-MM-dd HH:mm');
      event.startDate = formattedStartDate;
      event.endDate = formattedEndDate;
      updateObj = { startDate: formattedStartDate, endDate: formattedEndDate };
    } else {
      event.startDate = formattedStartDate;
    }

    await Event.updateOne({ _id: event._id }, updateObj);
  }
  res.json({ message: 'Date updated' });
});
