const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
    },
    from: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
    },
    text: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

messageSchema.post('save', (doc, next) => {
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
