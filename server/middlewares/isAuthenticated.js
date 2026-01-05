
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication token missing" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);


    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user; 
    req.id = user._id;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default isAuthenticated;
