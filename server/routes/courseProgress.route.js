import express from 'express';
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {getCourseProgress, updateLectureProgress, markAsInCompleted, markCompleted} from '../controller/courseProgress.controller.js';


const router = express.Router();

router.route("/:courseId").get(isAuthenticated, getCourseProgress);
router.route("/:courseId/lecture/:lectureId/view").post(isAuthenticated, updateLectureProgress);
router.route("/:courseId/complete").post(isAuthenticated, markCompleted);
router.route("/:courseId/incomplete").post(isAuthenticated, markAsInCompleted);


export default router;