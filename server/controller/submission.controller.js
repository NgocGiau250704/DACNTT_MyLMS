import { Submission } from "../models/submission.model.js";
import { uploadAssignmentFile, deleteMedia } from "../utils/cloudinary.js";

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user._id;

    let submission = await Submission.findOne({ assignmentId, studentId });

    
    if (!req.file) {
      if (!submission) {
        return res.status(400).json({ message: "Chưa upload file" });
      }

      submission.submittedAt = new Date();

      // nếu mày muốn resubmit => về trạng thái pending/submitted lại:
      submission.status = "submitted"; // hoặc "pending" tùy schema của mày

      await submission.save();
      return res.status(200).json({ submission });
    }

    
    const uploaded = await uploadAssignmentFile(req.file);

    const fileData = {
      fileUrl: uploaded.fileUrl,
      downloadUrl: uploaded.downloadUrl,
      publicId: uploaded.publicId,
      originalName: uploaded.originalName,
    };

    if (submission) {
      if (submission.file?.publicId) {
        await deleteMedia(submission.file.publicId);
      }
      submission.file = fileData;
      submission.submittedAt = new Date();
      submission.status = "submitted"; // hoặc pending
      await submission.save();
      return res.status(200).json({ submission });
    }

    submission = await Submission.create({
      assignmentId,
      studentId,
      file: fileData,
      status: "submitted", // nếu có field này
      submittedAt: new Date(),
    });

    return res.status(201).json({ submission });
  } catch (err) {
    console.error("submitAssignment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};




export const getMySubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user._id;

    const submission = await Submission.findOne({
      assignmentId,
      studentId,
    });

    return res.status(200).json({ submission });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve submitted work.",
      error: error.message,
    });
  }
};


export const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignmentId })
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 })
      .populate("assignmentId", "deadline");
      
      

    return res.status(200).json({ submissions });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve the list of submitted assignments.",
      error: error.message,
    });
  }
};

//Giảng viên chấm điểm
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.score = score;
    submission.feedback = feedback || "";
    submission.status = "graded";

    await submission.save();

    return res.status(200).json({
      message: "Grading successful",
      submission,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Grading errors",
      error: error.message,
    });
  }
};