const Cart = require("../models/cart.model");
const CartItem = require("../models/cartItem.model");
const Product = require("../models/product.model");

async function createCart(user) {
  try {
    const cart = new Cart({ user });
    const createdCart = await cart.save();
    return createdCart;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function findUserCart(userId) {
  try {
    let cart = await Cart.findOne({ user: userId });
    let cartItems = await CartItem.find({ cart: cart._id }).populate("product");

    let validCartItems = [];

    for (let cartItem of cartItems) {
      const product = cartItem.product;
      const selectedSize = product?.sizes?.find((s) => s.name === cartItem.size);

      if (product && selectedSize && selectedSize.quantity > 0) {
        validCartItems.push(cartItem);
      } else {
        await CartItem.findByIdAndDelete(cartItem._id);
      }
    }

    cart.cartItems = validCartItems;

    let totalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalItem = 0;

    for (let cartItem of validCartItems) {
      totalPrice += cartItem.price * cartItem.quantity;
      totalDiscountedPrice += cartItem.discountedPrice * cartItem.quantity;
      totalItem += cartItem.quantity;
    }

    cart.totalPrice = totalPrice;
    cart.totalItems = totalItem;
    cart.discounts = totalPrice - totalDiscountedPrice;
    cart.totalDiscountedPrice = totalDiscountedPrice;

    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function addCartItem(userId, req) {
    try {
      const cart = await Cart.findOne({ user: userId });
      const product = await Product.findById(req.productId);
  
      if (!product) throw new Error("Product not found");
  
      const sizeData = product.sizes.find(s => s.name === req.size);
      if (!sizeData || sizeData.quantity <= 0) {
        throw new Error("Selected size is not available");
      }
  
      let cartItem = await CartItem.findOne({
        cart: cart._id,
        product: product._id,
        userId,
        size: req.size
      });
  
      if (!cartItem) {
        cartItem = new CartItem({
          product: product._id,
          cart: cart._id,
          quantity: 1,
          userId,
          size: req.size,
          price: product.price,
          discountedPrice: product.discountedPrice
        });
        await cartItem.save();
        cart.cartItems.push(cartItem);
        await cart.save();
      } else {
        // 🛑 Stop if quantity exceeds available
        if (cartItem.quantity < sizeData.quantity) {
          cartItem.quantity += 1;
          await cartItem.save();
        } else {
          throw new Error("Cannot add more. Limited stock available.");
        }
      }
  
      // Fetch updated cart
      const updatedCart = await Cart.findById(cart._id).populate({
        path: 'cartItems',
        populate: { path: 'product' }
      });
  
      return updatedCart;
    } catch (error) {
      throw new Error(error.message);
    }
}  

module.exports = {
  createCart,
  findUserCart,
  addCartItem
};
