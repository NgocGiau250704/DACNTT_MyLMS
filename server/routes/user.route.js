import express from "express";
import { register, changePassword, verifyEmail} from "../controller/user.controller.js";
import { login } from "../controller/user.controller.js";
import {User} from '../models/user.model.js';
// const UserModel = require('../models/user.model');
// const { sendVerificationEmail } = require("../utils/email");
import { sendVerificationEmail } from "../utils/email.js";
import { signupValidation} from "../middlewares/authValidation.middlewares.js";
import crypto from "crypto";
import { forgotPassword, resetPassword } from "../controller/user.controller.js";
// const { authenticateJWT, authorizeRoles } = require("../middlewares/authValidation.middlewares");
import { authenticateJWT, authorizeRoles } from "../middlewares/authValidation.middlewares.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getUserProfile, updateProfile } from "../controller/user.controller.js";
import { profile } from "console";
import { logout, getAllInstructors,getMyLearning} from "../controller/user.controller.js";
import multer from "multer";
import { getAllUsers, getUserById } from "../controller/user.controller.js";


const storage = multer.memoryStorage(); 
// const upload = multer({ storage });
const upload = multer({ dest: "uploads/" });
const router = express.Router();

// router.get("/verify-email", async (req, res) => {
//   try {
//     const { token } = req.query;

//     const user = await User.findOne({
//       verificationToken: token,
//       verificationTokenExpiry: { $gt: Date.now() }
//     });

//     if (!user) {
//       console.log("Token từ query:", req.query.token);
//       console.log("Token trong DB:", user?.verificationToken);
//       return res.status(400).send("Token không hợp lệ hoặc đã hết hạn");
//     }

//     user.isVerified = true;
//     user.verifyToken = undefined;
//     await user.save();

//     return res.send("Xác minh email thành công! Bạn có thể đăng nhập.");

//   } catch (err) {
//     console.error(err);
//     return res.status(500).send("Có lỗi xảy ra.");
//   }
// });
// router.get("/verify-email", async (req, res) => {
//   try {
//     const { token } = req.query;

//     const user = await User.findOne({
//       verificationToken: token,
//       verificationTokenExpiry: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).send("Token không hợp lệ hoặc đã hết hạn");
//     }

//     user.isVerified = true;
//     user.verificationToken = undefined;
//     user.verificationTokenExpiry = undefined;

//     await user.save();

//     return res.send("Xác minh email thành công! Bạn có thể đăng nhập.");
//   } catch (err) {
//     console.error(err);
//     return res.status(500).send("Có lỗi xảy ra.");
//   }
// });

router.get("/instructors", getAllInstructors);
router.route("/register").post(signupValidation, register);
router.route("/login").post(login);
router.put("/change-password", isAuthenticated, changePassword);

router.get("/verify-email", verifyEmail);

router.route("/logout").get(logout);



//tối 27/10 thêm chức năng quên mật khẩu

router.get("/reset-password/:token", async (req, res) => {
  try {
    const user = await UserModel.findOne({
      resetToken: req.params.token,
      resetExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send("Token không hợp lệ hoặc đã hết hạn");
    }

    return res.redirect(`${process.env.FRONTEND_URL}/reset-password/${req.params.token}`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Có lỗi xảy ra");
  }
});

router.post("/reset-password/:token", resetPassword);
router.post("/forgot-password", forgotPassword);
router.get("/my-learning", isAuthenticated, getMyLearning);

router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.get("/all-users", getAllUsers);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);
router.get("/:id", getUserById);


export default router;