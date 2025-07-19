const express = require("express")

const cors = require("cors")

const app = express();

app.use(express.json())
const corsOptions = {
    origin: [
    //   "http://localhost:3000",         // Dev frontend
      "https://narivastaram.com", // Your backend upload server
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  };
  
  app.use(cors(corsOptions));
  

app.get("/",(req,res)=>{
    return res.status(200).send({message: "Welcome to Ecommerce API - Node",status:true})
})

const authRouters = require('./routes/auth.route')
app.use("/auth",authRouters);

const userRouters = require("./routes/user.route")
app.use("/api/users",userRouters);

const productRouters = require("./routes/product.route");
app.use("/api/products", productRouters);

const adminProductRouters = require("./routes/adminProduct.route");
app.use("/api/admin/products", adminProductRouters); 

const cartRouters = require("./routes/cart.route");
app.use("/api/cart", cartRouters);

const cartItemRouters = require("./routes/cartItem.route");
app.use("/api/cart_items", cartItemRouters);

const orderRouters = require("./routes/order.route");
app.use("/api/orders", orderRouters);

const reviewRouters = require("./routes/review.route");
app.use("/api/reviews", reviewRouters);

const adminOrderRouters = require("./routes/adminOrder.route");
app.use("/api/admin/orders", adminOrderRouters);

const paymentRouters = require("./routes/payment.route");
app.use("/api/payments",paymentRouters)

const contactRouters = require("./routes/contact.route");
app.use("/api/contact", contactRouters);

const uploadRouter = require("./routes/upload.route");
app.use("/api/upload", uploadRouter);


module.exports = app;