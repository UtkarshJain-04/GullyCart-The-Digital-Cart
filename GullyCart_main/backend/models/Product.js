const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true,
            index: true,
        },
        itemName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        quantity: {
            type: String,
            required: true,
            trim: true,
        },
        unit: {
            type: String,
            enum: ['kg', 'piece', 'bundle', 'dozen', 'litre'],
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        imageUrl: {
            type: String,
            trim: true,
        },
        imagePublicId: {
            type: String,
            trim: true,
        },
        procurementTime: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['active', 'sold_out'],
            default: 'active',
        },
    },
    { timestamps: true }
);

productSchema.index({ vendorId: 1, status: 1 });

module.exports = mongoose.model('Product', productSchema);