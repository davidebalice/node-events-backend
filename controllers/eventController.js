const multer = require('multer');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Event = require('../models/eventModel');
const Category = require('../models/categoryModel');
const Subcategory = require('../models/subcategoryModel');
const AppError = require('../middlewares/error');
const catchAsync = require('../middlewares/catchAsync');
const factory = require('./handlerFactory');
const fs = require('fs');
const path = require('path');
const multerStorage = multer.memoryStorage();
const { parseISO, format, startOfMonth, endOfMonth } = require('date-fns');

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImage = upload.fields([{ name: 'imageCover', maxCount: 1 }]);
exports.uploadGallery = upload.fields([{ name: 'images', maxCount: 6 }]);

exports.resizeImage = catchAsync(async (req, res, next) => {
  console.log(req.files.imageCover);
  if (!req.files.imageCover) return next();

  req.body.imageCover = `event-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/assets/images/events/${req.body.imageCover}`);

  next();
});

exports.resizeGallery = catchAsync(async (req, res, next) => {
  if (!req.files.images) return next();
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `event-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/assets/images/events/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});

exports.getAllEvents = catchAsync(async (req, res, next) => {
  let filterData = {};
  if (req.query.key) {
    const regex = new RegExp(req.query.key, 'i');
    filterData = { name: { $regex: regex } };
  }
  const setLimit = 12;
  const limit = req.query.limit * 1 || setLimit;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;
  const events = await Event.find(filterData)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('category', '_id name');
  const count = await Event.countDocuments();
  const totalPages = Math.ceil(count / limit);

  const formattedEvents = events.map((event) => ({
    ...event._doc,
    formattedStart: format(new Date(event.startDate), 'dd/MM/yyyy'),
    formattedEnd: format(new Date(event.endDate), 'dd/MM/yyyy'),
  }));

  let message = '';
  if (req.query.m) {
    if (req.query.m === '1') {
      message = 'Event added';
    } else if (req.query.m === '2') {
      message = 'Event deleted';
    }
  }
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  res.render('Events/events', {
    title: 'Events',
    events: formattedEvents,
    currentPage: page,
    page,
    limit,
    totalPages,
    message,
    flashMessage: flashMessage || null,
  });
});

exports.addEvent = catchAsync(async (req, res, next) => {
  const categories = await Category.find({}).sort({ order: 1 });
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  res.locals = { title: 'Add event' };
  res.render('Events/add', {
    formData: '',
    message: '',
    categories: categories,
    flashMessage: flashMessage || null,
  });
});

exports.createEvent = catchAsync(async (req, res, next) => {
  try {
    const latitude = 40.414141;
    const longitude = 35.752727;

    const startLocation = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    req.body.startLocation = startLocation;
    req.body._id = new mongoose.Types.ObjectId();
    await Event.create(req.body);
    res.redirect('/events?m=1');
  } catch (err) {
    const categories = await Category.find().sort({ order: 1 });
    const flashMessage = req.session.flashMessage;
    req.session.flashMessage = null;
    res.render('Events/add', {
      status: 200,
      title: 'Add event',
      formData: req.body,
      message: err.message,
      categories,
      flashMessage: flashMessage || null,
    });
  }
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const doc = await Event.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  res.redirect('/events?m=2');
});

exports.getEvent = factory.getOne(Event, { path: 'reviews' });

exports.editEvent = catchAsync(async (req, res, next) => {
  let query = await Event.findById(req.params.id);
  const doc = await query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  const startDateObj = new Date(doc.startDate);
  const year = startDateObj.getFullYear();
  const month = String(startDateObj.getMonth() + 1).padStart(2, '0');
  const day = String(startDateObj.getDate()).padStart(2, '0');
  const formattedStartDate = `${year}-${month}-${day}`;

  const endDateObj = new Date(doc.endDate);
  const yearEnd = endDateObj.getFullYear();
  const monthEnd = String(endDateObj.getMonth() + 1).padStart(2, '0');
  const dayEnd = String(endDateObj.getDate()).padStart(2, '0');
  const formattedEndDate = `${yearEnd}-${monthEnd}-${dayEnd}`;
  const categories = await Category.find().sort({ order: 1 });
  const subcategories = await Subcategory.find({ category: doc.category }).sort({ order: 1 });

  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;

  let message = '';
  res.render('Events/edit', {
    status: 200,
    title: 'Edit event',
    formData: doc,
    formattedStartDate,
    formattedEndDate,
    message,
    categories,
    subcategories,
    flashMessage: flashMessage || null,
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  const formData = req.body;

  if (formData.subcategory === '') {
    formData.subcategory = null;
  }

  const doc = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.redirect(doc._id);
});

exports.photoEvent = catchAsync(async (req, res, next) => {
  let query = await Event.findById(req.params.id);
  const doc = await query;
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  let message = '';
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  res.render('Events/photo', {
    status: 200,
    title: 'Photo event',
    formData: doc,
    message: message,
    flashMessage: flashMessage || null,
  });
});

exports.updatePhoto = catchAsync(async (req, res, next) => {
  const doc = await Event.findByIdAndUpdate(req.params.id, req.body);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.redirect('/event/photo/' + doc._id);
});

exports.updateGallery = catchAsync(async (req, res, next) => {
  const doc = await Event.updateOne({ _id: req.params.id }, { $push: { images: { $each: req.body.images } } });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.redirect('/event/photo/' + req.params.id);
});

exports.deleteGallery = catchAsync(async (req, res, next) => {
  let query = await Event.findById(req.body.id);
  const image = req.body.image;
  if (!image) {
    return next(new AppError('No document found with that ID', 404));
  }

  const index = query.images.indexOf(image);
  if (index > -1) {
    query.images.splice(index, 1);
  }

  const doc = await Event.updateOne({ _id: req.body.id }, { $set: { images: query.images } });

  let pathFile = path.join(__dirname, '/public/assets/images/events', image);
  pathFile = pathFile.replace('controllers', '');

  if (fs.existsSync(pathFile)) {
    fs.unlinkSync(pathFile);
    console.log('File deleted:', image);
  } else {
    console.log('File not exists:', image);
  }
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  res.redirect('/event/photo/' + req.body.id);
});

exports.locationEvent = catchAsync(async (req, res, next) => {
  let query = await Event.findById(req.params.id);
  const doc = await query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  let message = '';
  const flashMessage = req.session.flashMessage;
  req.session.flashMessage = null;
  res.render('Events/location', {
    status: 200,
    title: 'Location event',
    formData: doc,
    message: message,
    flashMessage: flashMessage || null,
  });
});

exports.updateLocation = catchAsync(async (req, res, next) => {
  const coordinates = req.body.coordinates.split(',');

  let longitude = coordinates[0];
  let latitude = coordinates[1];

  if (longitude === null || longitude === '' || longitude === NaN || longitude === undefined) {
    longitude = 0;
  }
  if (latitude === null || latitude === '' || latitude === NaN || latitude === undefined) {
    latitude = 0;
  }

  const location = {
    type: 'Point',
    description: req.body.name,
    coordinates: [parseFloat(longitude), parseFloat(latitude)],
  };

  req.body.location = location;

  const doc = await Event.updateOne({ _id: req.params.id }, { $set: { location: req.body.location } });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.redirect('/event/location/' + req.params.id);
});

exports.activeEvent = catchAsync(async (req, res, next) => {
  const doc = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
});
