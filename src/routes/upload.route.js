// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const cloudinary = require("../config/cloudinary");

// // Multer config
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // POST /api/upload
// router.post("/", upload.single("image"), async (req, res) => {
//   try {
//     const fileBuffer = req.file.buffer.toString("base64");
//     const dataUri = `data:${req.file.mimetype};base64,${fileBuffer}`;

//     const result = await cloudinary.uploader.upload(dataUri, {
//       folder: "products",
//     });

//     console.log("result.secure_url : ",result.secure_url);
//     console.log("result.public_id : ",result.public_id)

//     res.status(200).json({
//       imageUrl: result.secure_url,
//       public_id: result.public_id,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;


// upload.route.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { nanoid } = require("nanoid"); // You'll need to install this: npm install nanoid

// AWS S3 configuration
const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    const command = new PutObjectCommand({
      Bucket: "nari-vastaram", // Your bucket name from .env
      Key: imageName,
      Body: fileBuffer,
      ContentType: req.file.mimetype,
    });

    // Upload the file to S3
    await s3.send(command);

    // Get the public URL of the uploaded file
    const imageUrl = `https://nari-vastaram.s3.ap-south-1.amazonaws.com/${imageName}`;

    console.log("Image URL:", imageUrl);
    console.log("File Key:", imageName);

    res.status(200).json({
      imageUrl: imageUrl,
      key: imageName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
