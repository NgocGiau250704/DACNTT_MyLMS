import express from "express";
import multer from "multer";
import {
  createAssignment,
  getAssignmentsByLecture,
  updateAssignment,
  deleteAssignment,
  uploadAssignmentFileController,
  getSubmissionsByAssignment,
  getAssignmentsForInstructor,
} from "../controller/assignment.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  isAuthenticated,
  upload.single("file"),
  uploadAssignmentFileController
);

router.post("/", isAuthenticated, createAssignment);

router.get("/lecture/:lectureId", isAuthenticated, getAssignmentsByLecture);

router.put("/:assignmentId", isAuthenticated, updateAssignment);

router.delete("/:assignmentId", isAuthenticated, deleteAssignment);

router.get(
  "/assignment/:assignmentId",
  isAuthenticated,
  getSubmissionsByAssignment
);

router.get(
  "/instructor",
  isAuthenticated,
  getAssignmentsForInstructor
);

// router.put(
//   "/:submissionId/grade",
//   isAuthenticated,
//   gradeSubmission
// );


export default router;
