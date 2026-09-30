const mongoose = require('mongoose');

const USER_ROLES = ['user', 'vendor', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: [true, 'Name is required'],
        // The regex below allows uppercase/lowercase letters and spaces
        match: [/^[a-zA-Z\s]+$/, 'Name can only contain alphabets'] 
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: (coordinates) => !coordinates ||coordinates.length === 2,
          message: 'Location coordinates must be [longitude, latitude].',
        },
      },
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
module.exports.USER_ROLES = USER_ROLES;