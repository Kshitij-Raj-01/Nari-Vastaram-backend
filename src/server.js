const app = require(".");
const { connectDB } = require("./config/db");
require("dotenv").config();

const PORT = 5454
app.listen(PORT, async()=>{
    await connectDB();
    console.log("Ecommerce api is listening on PORT: ",PORT)
})