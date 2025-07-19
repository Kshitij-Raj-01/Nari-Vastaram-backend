const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50,
    unique: true, // 💖 So we don’t accidentally duplicate
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
