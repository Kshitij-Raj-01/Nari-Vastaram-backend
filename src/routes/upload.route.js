const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${fileBuffer}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "products",
    });

    console.log("result.secure_url : ",result.secure_url);
    console.log("result.public_id : ",result.public_id)

    res.status(200).json({
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
