import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/email.js";
import { sendEmail } from "../utils/email.js";
import {
  deleteVideoFromCloudinary,
  uploadMedia,
  deleteMedia,
} from "../utils/cloudinary.js";
// const UserModel = require('../models/user.model.js');

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    //tao token
    const token = crypto.randomBytes(32).toString("hex");

    //thoi gian het han token
    const expiry = Date.now() + 60 * 60 * 1000;

    // tao user moi
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "student",
      isVerified: false,
      verificationToken: token,
      verificationTokenExpiry: new Date(expiry),
    });
    await newUser.save();

    //gui email xac thuc
    await sendVerificationEmail(email, token);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }


    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password. Please try again.",
      });
    }
    generateToken(res, user, `Welcome back, ${user.name}`);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to login user",
    });
  }
};

//tối 27/10 thêm chức năng quên mật khẩu

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password/${resetToken}`;

    const html = `
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password. Click the link below to set a new password. This link expires in 15 minutes.</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `;
    await sendEmail(user.email, "Reset your password", html);

    return res.json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (err) {
    console.error("forgotPassword error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    console.log("Updated user:", user);

    res.json({ success: true, message: "Password has been reset" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // 1. Check input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // 2. Tìm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // 4. Không cho người dùng nhập mật khẩu mới giống mật khẩu cũ
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as old password",
      });
    }

    // 5. Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

// export const logout = (req, res) => {
//   try {
//     return res.status(200).cookie("token", "", { maxAge: 0 }).json({
//       success: true,
//       message: "Logged out successfully",
//     });
//   } catch (error) {
//     console.error("Logout error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to logout user",
//     });
//   }
// };

// Add this to user.controller.js

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: "Verification token is missing" });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Redirect to frontend login page
    const frontendLoginUrl = process.env.FRONTEND_URL 
      ? `${process.env.FRONTEND_URL}/login` 
      : "http://localhost:3000/login";
      
    return res.redirect(frontendLoginUrl);

  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ success: false, message: "Server error during verification" });
  }
};

export const logout = (req, res) => {
  try {
    return res
      .cookie("token", "", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(0),
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout user",
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    // const userId = req.user.id;
    const userId = req.user._id;
    // const user = await User.findById(userId).select("-password");
    const user = await User.findById(userId)
      .select("-password")
 .populate({
  path: "enrolledCourses",
  select: "courseTitle courseThumbnail courseLevel coursePrice creator",
  populate: {
    path: "creator",
    select: "name photoUrl",
  },
});


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name } = req.body;
    const profilePhoto = req.file;

    console.log("==> Incoming update profile", {
      name,
      hasFile: !!profilePhoto,
    });

    const user = await User.findById(req.user._id)
 .populate({
  path: "enrolledCourses",
  populate: {
    path: "creator",
    select: "name photoUrl",
  },
  select: "courseTitle courseThumbnail courseLevel coursePrice creator",
});


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.photoUrl) {
      const publicId = user.photoUrl.split("/upload/")[1]?.split(".")[0];
      if (publicId) {
        await deleteMedia(publicId);
      }
    }

    let photoUrl = user.photoUrl;
    if (profilePhoto) {
      let fileData;

      if (profilePhoto.path) {
        fileData = profilePhoto.path;
      } else if (profilePhoto.buffer) {
        // fileData = `data:${
        //   profilePhoto.mimetype
        // };base64,${profilePhoto.buffer.toString("base64")}`;
        fileData = `data:${
          profilePhoto.mimetype
        };base64,${profilePhoto.buffer.toString("base64")}`;
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid image file format",
        });
      }
      console.log("==> Uploading to Cloudinary...");
      const cloudResponse = await uploadMedia(fileData);
      console.log("==> Cloudinary upload result", cloudResponse);
      photoUrl = cloudResponse.secure_url;
    }

    console.log("==> Updating user with:", { name, photoUrl });
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, photoUrl },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("enrolledCourses", "_id courseTitle");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor" })
      .select("_id name photoUrl");

    return res.status(200).json({ instructors });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch instructors",
    });
  }
};
export const getMyLearning = async (req, res) => {
  console.log("=== GET MY LEARNING ===");
  console.log("req.user =", req.user);

  if (!req.user) {
    return res.status(401).json({
      message: "NOT AUTHENTICATED",
      courses: []
    });
  }

  const user = await User.findById(req.user._id)
    .populate("enrolledCourses", "courseTitle");

  console.log("USER =", user);
  console.log("ENROLLED =", user.enrolledCourses);

  res.status(200).json({
    courses: user.enrolledCourses || [],
  });
};

