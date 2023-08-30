const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Booking must belong to a Event!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  total: {
    type: Number,
    require: [true, 'Booking must have a price.'],
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: false,
  },
  qty: {
    type: Number,
    default: 1,
  },
  note: {
    type: String,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'event',
    select: 'name imageCover price',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
