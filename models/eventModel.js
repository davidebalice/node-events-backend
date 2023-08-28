const mongoose = require('mongoose');
const slugify = require('slugify');

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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      default: null,
    },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory'},
    slug: { type: String, unique: true, trim: true },
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
    price: {
      type: Number,
      default: 0.0,
    },
    typeDate: {
      type: String,
      required: [true, 'Select type of date'],
    },
    startDate: {
      type: Date,
      required: [true, 'Event must have a start date'],
    },
    endDate: {
      type: Date,
    },
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
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.index({ slug: 1 });
eventSchema.index({ startLocation: '2dsphere' });

eventSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'event_id',
  localField: '_id',
});

eventSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

eventSchema.post('save', (doc, next) => {
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
