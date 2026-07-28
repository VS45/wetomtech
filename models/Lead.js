const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['contact', 'coverage', 'quote', 'career'],
      required: true,
      index: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    organisation: {
      type: String,
      trim: true,
      maxlength: 160,
      default: null
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
      index: true
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    service: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
      index: true
    },
    address: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 3000
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
      index: true
    },
    sourceIp: {
      type: String,
      trim: true,
      maxlength: 80,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'leads',
    versionKey: false
  }
);

leadSchema.index({ createdAt: -1 });
leadSchema.index({ type: 1, status: 1, createdAt: -1 });

module.exports = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
