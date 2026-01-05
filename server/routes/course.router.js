import express from 'express';
// import { authenticateJWT } from '../middlewares/authValidation.middlewares.js';
import {createCourse,getEnrolledStudentsOfCourse, filterCourses,searchCourseSuggestions,searchCourses,getMyCourseEnrollmentStats,checkPurchasedCourse, getAllCreatorCourses,uploadLectureVideo, editCourse, getCourseById, createLecture, getCourseLecture,uploadCourseIntroVideo, editLecture, removeLecture, getLectureById, togglePublishCourse, getPublishedCourse} from '../controller/course.controller.js';
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { uploadMedia } from '../utils/cloudinary.js';
import reviewRoute from './review.router.js';
import upload from '../utils/multer.js';

const router = express.Router();
router.get("/instructor/course-stats", isAuthenticated, getMyCourseEnrollmentStats);
router.route("/").post(isAuthenticated, createCourse);
// router.route("/published-courses").get(isAuthenticated, getPublishedCourse)
router.route("/published-courses").get(getPublishedCourse)
router.get("/search", searchCourses);
router.get(
  "/:courseId/enrolled-students",
  isAuthenticated,
  getEnrolledStudentsOfCourse
);

router.get("/filter", filterCourses);
router.get("/search/suggestions", searchCourseSuggestions);
router.get("/:courseId/check-purchased", checkPurchasedCourse)
router.route("/").get(isAuthenticated, getAllCreatorCourses);
router.route("/:courseId").put(isAuthenticated, upload.single("thumbnail"), editCourse);
// router.route("/:courseId").get(isAuthenticated, getCourseById);
router.route("/:courseId").get(getCourseById);
// UPLOAD INTRO VIDEO
router.post(
  "/:courseId/upload-intro-video",
  upload.single("video"),
  uploadCourseIntroVideo
);
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);



router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);
router.post(
  "/lecture/:lectureId/upload-video",
  upload.single("video"),
  uploadLectureVideo
);


router.use('/:courseId/reviews', reviewRoute); 

router.put("/:courseId/toggle-publish", isAuthenticated, togglePublishCourse);

export default router;