const Event = require('../models/eventModel');
const catchAsync = require('../middlewares/catchAsync');
const { parseISO, format, startOfMonth, endOfMonth } = require('date-fns');

exports.getAllEvents = catchAsync(async (req, res, next) => {
  let filterData = { active: true };

  if (req.query.key) {
    const regex = new RegExp(req.query.key, 'i');
    filterData.name = { $regex: regex };
  }

  if (req.query.category) {
    filterData.category = req.query.category;
  }

  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    filterData.startDate = { $gte: startDate, $lte: endDate };
  }

  const setLimit = 30;
  const limit = req.query.limit * 1 || setLimit;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;
  const events = await Event.find(filterData)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('category', '_id name')
    .populate('location', '_id description');
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

exports.getEventBySlug = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const event = await Event.findOne({ slug, active: true })
    .populate('category', '_id name')
    .populate('location', '_id description');

  if (event) {
    res.status(200).json({
      event,
    });
  } else {
    return res.status(404).json({
      status: 'fail',
      mesage: 'invalid id',
    });
  }
});

exports.getEventById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const event = await Event.findOne({ _id: id, active: true })
    .populate('category', '_id name')
    .populate('location', '_id description');

  if (event) {
    res.status(200).json({
      event,
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
