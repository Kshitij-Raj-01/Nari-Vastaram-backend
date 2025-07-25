const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    cartItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "cartItems",
        required: true
    }],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalItems: {
        type: Number,
        required: true,
        default: 0
    },
    totalDiscountedPrice: {
        type: Number,
        required: true,
        default: 0
    },
    discounts: {
        type: Number,
        required: true,
        default: 0
    }
});

const Cart = mongoose.model('cart',cartSchema);

module.exports = Cart;