const Event = require('../models/eventModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const moment = require('moment');

exports.getAllBookings = catchAsync(async (req, res, next) => {
  let filterData = {};
  if (req.query.key) {
    const regex = new RegExp(req.query.key, 'i');
    filterData = { name: { $regex: regex } };
  }
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  const bookings = await Booking.find(filterData)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'event',
      fields: 'name difficulty imageCover slug',
    })
    .populate({
      path: 'user',
      fields: 'name surname email',
    });

  const count = await Booking.countDocuments();
  const totalPages = Math.ceil(count / limit);
  let message = '';

  res.render('Bookings/bookings', {
    title: 'Bookings',
    bookings: bookings.map((booking) => ({
      ...booking.toObject(),
      createdAt: moment(booking.createdAt).format('DD/MM/YYYY HH:mm'),
      total: booking.price * booking.qty,
    })),
    page,
    limit,
    totalPages,
    message,
  });
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
