// review.service.js
const Review = require("../models/review.model.js");
const productService = require("../services/product.service");

async function createReview(reqData, user) {
    const product = await productService.findProductById(reqData.productId);
  
    const review = new Review({
      user: user._id,
      product: product._id,
      review: reqData.review,
      rating: reqData.rating, // assuming you are storing rating here
      createdAt: new Date(),
    });
  
    const savedReview = await review.save();
  
    // Add the review to the product
    product.review.push(savedReview._id);
  
    // Increment total ratings
    product.numRatings = (product.numRatings || 0) + 1;
  
    // Save the updated product
    await product.save();
  
    return savedReview;
  }
  

async function getAllReview(productId) {
  return await Review.find({ product: productId }).populate("user");
}

module.exports = {
  createReview,
  getAllReview,
};
