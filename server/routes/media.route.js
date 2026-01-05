import express from "express";

import upload from "../utils/multer.js";

import { uploadMedia } from "../utils/cloudinary.js";

const router = express.Router();

// router.post("/upload-video", upload.single("file"), async (req, res) => {
//   try {
//     const result = await uploadMedia(req.file.path);
//     res.status(200).json({
//       success: true,
//       message: "File uploaded successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });

router.post("/upload-video", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("FILE:", req.file);
    const { path, mimetype } = req.file;
    if (!mimetype.startsWith("video/")) {
      return res.status(400).json({ message: "File is not a video" });
    }
    const result = await uploadMedia(path, mimetype);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      // data: result,
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
