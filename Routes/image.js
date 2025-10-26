///file for testing 

const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");// حذف ملف aploads


const router = express.Router();

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const upload = multer({ dest: "uploads/" });
// Route تجريبي لرفع صورة
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    // رفع الصورة إلى Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "test_images"
    });
    console.log(result) 

     fs.unlinkSync(req.file.path);//remove img from upload file

    res.json({
      message: "✅ Image uploaded successfully",
      url: result.secure_url, // الرابط المباشر للصورة
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
