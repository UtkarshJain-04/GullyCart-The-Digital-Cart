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
        message: 'Pickup coordinates must be [longitude, latitude].',
      },
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    items: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          productDescription: {
            type: String,
            trim: true,
          },
          itemName: {
            type: String,
            required: true,
            trim: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 0.01,
          },
          unit: {
            type: String,
            enum: ['kg', 'piece', 'bundle', 'dozen', 'litre'],
            required: true,
          },
          unitPrice: {
            type: Number,
            required: true,
            min: 0,
          },
          amount: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: 'An order must contain at least one item.',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    pickupLocation: {
      type: pointSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'ready', 'collected', 'cancelled', 'expired'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

orderSchema.index({ pickupLocation: '2dsphere' });
orderSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);