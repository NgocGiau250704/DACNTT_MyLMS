import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getInstructorDashboardStats, getCourseStats } from "../controller/instructor.controller.js";

const router = express.Router();

// router.get("/instructor", isAuthenticated, getInstructorDashboardStats);
router.get("/dashboard", isAuthenticated, getInstructorDashboardStats);
router.get("/course-stats", isAuthenticated, getCourseStats);
export default router;