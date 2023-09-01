const Message = require('../models/messageModel');
const AppError = require('../middlewares/error');
const catchAsync = require('../middlewares/catchAsync');
const moment = require('moment');

exports.getAllMessages = catchAsync(async (req, res, next) => {
  let filterData = {};
  if (req.query.key) {
    const regex = new RegExp(req.query.key, 'i');
    filterData = { name: { $regex: regex } };
  }
  const setLimit = 20;
  const limit = req.query.limit * 1 || setLimit;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;
  const messages = await Message.find(filterData).sort('-createdAt').skip(skip).limit(limit);
  const count = await Message.countDocuments();
  const totalPages = Math.ceil(count / limit);

  let message = '';
  if (req.query.m) {
    if (req.query.m === '1') {
      message = 'Message added';
    } else if (req.query.m === '2') {
      message = 'Message deleted';
    }
  }

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  const viewType = req.query.viewType;
  if (viewType === 'json') {
    res.json(messages);
  } else {
    res.render('Messages/messages', {
      title: 'Message',
      messages: messages.map((message) => ({
        ...message.toObject(),
        createdAt: moment(message.createdAt).format('DD/MM/YYYY HH:mm'),
        date: moment(message.date).format('DD/MM/YYYY'),
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

exports.editMessage = catchAsync(async (req, res, next) => {
  let query = await Message.findById(req.params.id);

  const doc = await query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  const formattedDate = moment(doc.createdAt).format('DD/MM/YYYY HH:mm');
  const formattedDateEvent = moment(doc.date).format('DD/MM/YYYY');

  let message = '';
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  res.render('Message/edit', {
    status: 200,
    title: 'Edit message',
    formData: {
      ...doc.toObject(),
      createdAt: formattedDate,
      date: formattedDateEvent,
    },
    message: message,
    flashMessage: flashMessage || null,
  });
});

exports.updateMessage = catchAsync(async (req, res, next) => {
  const doc = await Message.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  req.flash('message', 'Message updated successfully');
  req.flash('error', 'Error during update');

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  res.render('Messages/edit', {
    title: 'Edit tour',
    formData: doc,
    DEMO_MODE: process.env.DEMO_MODE,
    message: req.flash('message'),
    error: req.flash('error'),
    flashMessage: flashMessage || null,
  });
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
  const doc = await Message.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  res.redirect('/messages?m=2');
});
