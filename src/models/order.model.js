const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "orderItems"
    }],
    orderDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    deliverydate: {
        type: Date
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "addresses",
    },
    paymentDetails: {
        paymentMethod: {
            type: String
        },
        transactionId: {
            type: String
        },
        paymentId: {
            type: String,
        },
        paymentStatus: {
            type: String,
            default: "PENDING"
        }
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    totalDiscountedPrice: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        required: true,
        default: "PENDING"
    },
    totalItem: {
        type: Number,
        required: true,
    },
    returnStatus: {
        type: String,
        enum: ['Not Returned', 'Return Requested', 'Returned'],
        default: 'Not Returned'
  },
    returnDetails: {
        reason: String,
        requestedAt: Date,
        refundStatus: {
          type: String,
          enum: ['Pending', 'Processed'],
          default: 'Pending'
        },
        pickupScheduledDate: Date
    },            
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Order = mongoose.model('orders',orderSchema);

module.exports = Order;