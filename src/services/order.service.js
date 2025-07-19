const Address = require("../models/address.model");
const Order = require("../models/order.model");
const OrderItem = require("../models/orderItems.model");
const CartItem = require("../models/cartItem.model");
const cartService = require("./cart.service");

async function createOrder(user, shipAddress) {
  let address;

  if (shipAddress._id) {
    address = await Address?.findById(shipAddress._id);
  } else {
    address = new Address(shipAddress);
    address.user = user;
    await address.save();

    if (!user.address) {
      user.address = [];
    }

    user.address.push(address);
    await user.save();
  }

  const cart = await cartService.findUserCart(user._id);
  console.log("Cart found:", cart);
  console.log("Cart items:", cart.cartItems);
  const orderItems = [];

  for (const item of cart.cartItems) {
    console.log("Processing cart item:", item);
    console.log("Item product:", item.product);
    console.log("Item size:", item.size);
    console.log("Item quantity:", item.quantity);
    
    // Skip validation for now - just create order items
    // We'll add validation back once we confirm the structure
    const product = item.product;
    
    if (!product) {
      console.log("No product found for item:", item._id);
      continue;
    }

    const orderItem = new OrderItem({
      price: item.price,
      product: product._id,
      quantity: item.quantity,
      size: item.size,
      userId: item.userId,
      discountedPrice: item.discountedPrice,
    });

    const createdOrderItem = await orderItem.save();
    orderItems.push(createdOrderItem);
  }

  console.log("Order items created:", orderItems.length);

  if (orderItems.length === 0) {
    throw new Error("No valid items to place an order.");
  }

  const createdOrder = new Order({
    user: user._id,
    orderItems,
    totalPrice: cart.totalPrice,
    totalDiscountedPrice: cart.totalDiscountedPrice,
    discount: cart.discounts,
    totalItem: cart.totalItems,
    shippingAddress: address._id,
  });

  const saveOrder = await createdOrder.save();

  return saveOrder;
}

async function placeOrder(orderId) {
  const order = await findOrderById(orderId);
  
  // Get the cart for clearing it after placing order
  const cart = await cartService.findUserCart(order.user._id);
  
  // Get all cart items that belong to this order
  const validCartItems = cart.cartItems.map(item => item._id);

  order.orderStatus = "PLACED";
  
  // Initialize paymentDetails if it doesn't exist
  if (!order.paymentDetails) {
    order.paymentDetails = {};
  }
  order.paymentDetails.status = "COMPLETED";
  
  // Clear the cart items
  await CartItem.deleteMany({ _id: { $in: validCartItems } });
  
  // Reset cart totals
  cart.totalItems = 0;
  cart.totalPrice = 0;
  cart.totalDiscountedPrice = 0;
  cart.discounts = 0;
  cart.cartItems = [];
  await cart.save();

  return await order.save();
}

async function confirmOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "CONFIRMED";
  return await order.save();
}

async function shipOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "SHIPPED";
  return await order.save();
}

async function deliverOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "DELIVERED";
  return await order.save();
}

async function cancelOrder(orderId) {
  const order = await findOrderById(orderId);
  
  if (["PLACED", "CONFIRMED"].includes(order.orderStatus)) {
    order.orderStatus = "CANCELED";
    return await order.save();
  } else {
    throw new Error("Order cannot be canceled at this stage.");
  }
}

async function returnOrder(orderId, reason = 'Not specified') {
  const order = await findOrderById(orderId);

  if (order.orderStatus !== "DELIVERED") {
    throw new Error("Only delivered orders can be returned.");
  }

  order.returnStatus = 'Return Requested';
  order.returnDetails = {
    reason: reason,
    requestedAt: new Date(),
    refundStatus: 'Pending',
    pickupScheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // +5 days
  };

  return await order.save();
}

async function findOrderById(orderId) {
  const order = await Order.findById(orderId)
    .populate("user")
    .populate({ path: "orderItems", populate: { path: "product" } })
    .populate({
      path: "shippingAddress",
      select: "-user"
    });
  
  if (!order) {
    throw new Error("Order not found");
  }
  
  console.log("backend order: ", order);
  return order;
}

async function usersOrderHistory(userId) {
  try {
    const orders = await Order.find({
      user: userId,
      orderStatus: { $in: ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED", "RETURN_REQUESTED"] }
    })
      .populate({
        path: "orderItems",
        populate: { path: "product" }
      })
      .lean();

    return orders;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getAllOrders() {
  return await Order.find()
    .populate({ path: "orderItems", populate: { path: "product" } })
    .lean();
}

async function deleteOrder(orderId) {
  const order = await findOrderById(orderId);
  await Order.findByIdAndDelete(order._id);
}

async function updateOrderById(orderId, updateData) {
  return await Order.findByIdAndUpdate(orderId, updateData, { new: true });
}

module.exports = {
  createOrder,
  placeOrder,
  confirmOrder,
  shipOrder,
  deliverOrder,
  cancelOrder,
  returnOrder,
  findOrderById,
  usersOrderHistory,
  getAllOrders,
  deleteOrder,
  updateOrderById
};