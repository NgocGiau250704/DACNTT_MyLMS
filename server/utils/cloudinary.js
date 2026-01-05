import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// const { v2: cloudinary } = pkg; 

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
export const uploadAssignmentFile = async (file) => {
  const result = await cloudinary.uploader.upload(file.path, {
    resource_type: "raw",
    folder: "assignments",
    flags: "attachment",
  });

  return {
    fileUrl: result.secure_url,
    downloadUrl: result.secure_url,
    publicId: result.public_id,
    originalName: file.originalname, 
  };
};



export const uploadMedia = async (file) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      

    });
    return uploadResponse;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload media");
  }
};

export const deleteMedia = async (publicId) => {
  try {
    // File bài nộp của bạn là RAW
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
  } catch (error) {
    console.error("Delete media error:", error);
  }
};



export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch (error) {
    console.log(error);
  }
};

export const uploadLectureVideo = async (req, res) => {
  try {
    const { lectureId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Upload video ĐÚNG chuẩn video
    const uploaded = await uploadVideo(req.file.path);

    if (!uploaded?.secure_url) {
      return res.status(500).json({ message: "Cloudinary upload failed" });
    }

    // Xóa video cũ
    if (lecture.publicId) {
      try {
        await deleteVideoFromCloudinary(lecture.publicId);
      } catch (e) {
        console.log("Failed to delete old video:", e);
      }
    }

    lecture.videoUrl = uploaded.secure_url;
    lecture.publicId = uploaded.public_id;

    await lecture.save();

    return res.status(200).json({
      success: true,
      message: "Lecture video uploaded successfully",
      videoUrl: uploaded.secure_url,
      publicId: uploaded.public_id
    });

  } catch (err) {
    console.log("UPLOAD LECTURE ERROR:", err);
    res.status(500).json({ message: "Failed to upload lecture video" });
  }
};
