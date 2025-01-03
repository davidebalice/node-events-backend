const mongoose = require('mongoose');
const slugify = require('slugify');

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subcategory must have a name'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Subategory must have a category'],
      default: null,
    },
    slug: { type: String, trim: true },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: { type: Number, required: true, default: 1 },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

subcategorySchema.index({ category: 1 });
subcategorySchema.index({ slug: 1 });

subcategorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

subcategorySchema.post('save', (doc, next) => {
  next();
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;
