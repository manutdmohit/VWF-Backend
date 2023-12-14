const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
    },
    message: {
      type: String,
      trim: true,
      required: [true, 'Please provide message'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contact', ContactSchema);
