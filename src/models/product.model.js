const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number, 
    },
    discountedPrice: {
        type: Number,
    },
    discountPercent: {
        type: Number,
    },
    quantity: {
        type: Number,
        required: true,
    },
    brand: {
        type: String,
    },
    color: [String],
    sizes: [{
        name: {type: String},
        quantity: {type: Number},
    }],
    imageUrl: {
        type: String,
    },
    highlights: [String],           // ✅ Highlights in points
    details: [String],
    review: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "reviews"
        }
      ],
      
    numRatings: {
        type: Number,
        default: 0,
    },
    categories: [String],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Product = mongoose.model('products', productSchema);

module.exports = Product;