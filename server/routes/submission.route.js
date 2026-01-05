import express from "express";
import multer from "multer";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  submitAssignment,
   getMySubmission,
  getSubmissionsByAssignment,
  gradeSubmission,
  
} from "../controller/submission.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/:assignmentId",
  isAuthenticated,
  upload.single("file"),
  submitAssignment
);


router.get(
  "/:assignmentId/me",
  isAuthenticated,
  getMySubmission
);

router.get(
  "/assignment/:assignmentId",
  isAuthenticated,
  getSubmissionsByAssignment
);

router.post(
  "/:submissionId/grade",
  isAuthenticated,
  gradeSubmission
);


export default router;
