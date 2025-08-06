const razorpay = require("../config/razorpayClient");
const Product = require("../models/product.model");
const orderService = require("../services/order.service");

const createPaymentLink = async (orderId) => {
  try {
    const order = await orderService.findOrderById(orderId);

    // 🛑 Check if any item has quantity 0
    const invalidItems = order.orderItems.filter(item => item.quantity <= 0);
    if (invalidItems.length > 0) {
      throw new Error("Invalid order: One or more items have quantity 0 💔");
    }

    const paymentLinkRequest = {
      amount: order.totalDiscountedPrice * 100,
      currency: "INR",
      customer: {
        name: order.user.firstName + " " + order.user.lastName,
        contact: order.user.mobile,
        email: order.user.email
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      callback_url: `http://narivastaram.com/payment/${orderId}`,
      callback_method: 'get'
    };

    const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);

    return {
      paymentLinkId: paymentLink.id,
      payment_link_url: paymentLink.short_url
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updatePaymentInformation = async (reqData) => {
  const paymentId = reqData.payment_id;
  const orderId = reqData.order_id;

  try {
    const order = await orderService.findOrderById(orderId);

    // 🛑 Check if any item has quantity 0
    const invalidItems = order.orderItems.filter(item => item.quantity <= 0);
    if (invalidItems.length > 0) {
      throw new Error("Invalid order: One or more items have quantity 0 💔");
    }

    const payment = await razorpay.payments.fetch(paymentId);

    if (payment.status === "captured") {
      await orderService.updateOrderById(orderId, {
        paymentDetails: {
          paymentMethod: payment.method,
          paymentId: paymentId,
          paymentStatus: "COMPLETED"
        },
        orderStatus: "PLACED"
      });

      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (!product) continue;

        product.quantity = Math.max(0, product.quantity - item.quantity);

        if (item.size) {
          product.sizes = product.sizes.map((s) => {
            if (s.name === item.size) {
              return {
                ...s.toObject(),
                quantity: Math.max(0, s.quantity - item.quantity)
              };
            }
            return s;
          });
        }

        await product.save();
      }
    }

    return { message: "Your order is placed", success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

const codPayment = async (orderId) => {
  const order = await orderService.findOrderById(orderId);
  if (!order) throw new Error("Order not found");

  // 🛑 Check if any item has quantity 0
  const invalidItems = order.orderItems.filter(item => item.quantity <= 0);
  if (invalidItems.length > 0) {
    throw new Error("Invalid order: One or more items have quantity 0 💔");
  }

  const userCity = order.shippingAddress?.city?.toLowerCase()

  await orderService.updateOrderById(orderId, {
    paymentDetails: {
      paymentMethod: "COD",
      paymentStatus: "PENDING"
    },
    orderStatus: "PLACED"
  });

  for (const item of order.orderItems) {
    const productId = typeof item.product === "object" ? item.product._id : item.product;
    const product = await Product.findById(productId);
    if (product) {
      product.quantity = Math.max(0, product.quantity - item.quantity);
      if (item.size) {
        product.sizes = product.sizes.map((s) => {
          if (s.name.toLowerCase() === item.size.toLowerCase()) {
            return {
              ...s.toObject(),
              quantity: Math.max(0, s.quantity - item.quantity)
            };
          }
          return s;
        });
      }
      try {
        await product.save();
      } catch (err) {
        console.error("❌ Error saving product:", err.message);
      }
    }
  }

  return { message: "COD order placed successfully 🌸", success: true };
};

module.exports = {
  createPaymentLink,
  updatePaymentInformation,
  codPayment
};
