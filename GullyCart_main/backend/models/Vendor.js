const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (coordinates) => coordinates.length === 2,
        message: 'Location coordinates must be [longitude, latitude].',
      },
    },
  },
  { _id: false }
);

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    suspensionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    suspendedAt: Date,
    isActive: {
      type: Boolean,
      default: false,
    },
    location: pointSchema,
    lastLocationUpdate: Date,
    procurementTime: Date,
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

vendorSchema.index({ location: '2dsphere' });
vendorSchema.index({ verificationStatus: 1, isActive: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);