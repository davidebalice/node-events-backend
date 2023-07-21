const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//const ObjectId = require('mongodb').ObjectID;

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event must have a name'],
      unique: true,
      trim: true,
      maxlength: ['40', 'max 40 characters'],
      minlength: ['6', 'min 6 characters'],
    },
    slug: { type: String, unique: true, trim: true },
    duration: {
      type: Number,
      required: [true, 'Event must have a duration'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.0,
      min: [1, 'rating must be above 1'],
      max: [5, 'rating must be belowe 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Event must have a price'],
    },
    priceDiscout: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'discount price should be below price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Event must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      trim: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.index({ price: 1, ratingsAverage: -1 });
eventSchema.index({ slug: 1 });
eventSchema.index({ startLocation: '2dsphere' });

eventSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'event_id',
  localField: '_id',
});

//middleware before save, create, insert ecc.
eventSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//middleware after save, create, insert ecc.
eventSchema.post('save', (doc, next) => {
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
