const mongoose = require('mongoose');
const Event = require('./eventModel');

const reviewSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Insert review text'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    event_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Event',
      required: [true, 'Review must belong to a event'],
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ event_id: 1, user_id: 1 }, { unique: true });
reviewSchema.index({ user_id: 1 });
reviewSchema.index({ event_id: 1 });

reviewSchema.pre(/^find/, function (next) {
  /*
  this.populate({
    path: 'event_id',
    select: 'name',
  }).populate({
    path: 'user_id',
    select: 'name surname photo',
  });
  */
  this.populate({
    path: 'user_id',
    select: 'name surname photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (eventId) {
  const stats = await this.aggregate([
    {
      $match: { event_id: eventId },
    },
    {
      $group: {
        _id: '$event_id',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Event.findByIdAndUpdate(eventId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Event.findByIdAndUpdate(eventId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.pre('save', function (next) {
  this.constructor.calcAverageRatings(this.event_id);
  next();
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.r.constructor.calcAverageRatings(this.r.event_id);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
