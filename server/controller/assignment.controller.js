import { Assignment } from "../models/assignment.model.js";
import { uploadMedia, deleteMedia } from "../utils/cloudinary.js";
import { uploadAssignmentFile } from "../utils/cloudinary.js";
import { Submission } from "../models/submission.model.js";
import mongoose from "mongoose";
import { Lecture } from "../models/lecture.model.js";
import { Course } from "../models/course.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/email.js";

export const uploadAssignmentFileController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    
    const uploaded = await uploadAssignmentFile(req.file);

    return res.status(200).json({
      fileUrl: uploaded.fileUrl,
      downloadUrl: uploaded.downloadUrl,
      publicId: uploaded.publicId,
      originalName: uploaded.originalName, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "The assignment file upload failed." });
  }
};


export const createAssignment = async (req, res) => {
  try {
    const { lectureId, title, description, deadline, attachment, allowLate } =
      req.body;

    if (!lectureId || !title || !deadline) {
      return res.status(400).json({
        message: "Lecture ID, title, and deadline are required.",
      });
    }

    const assignment = await Assignment.create({
      lectureId,
      title,
      description,
      deadline: new Date(deadline),
      attachment,
      allowLate: Boolean(allowLate),
      createdBy: req.user?._id,
    });
    console.log("BODY =", req.body);
    console.log("ATTACHMENT =", req.body.attachment);
    // Tìm lecture → course
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const course = await Course.findOne({ lectures: lecture._id }).select(
      "_id courseTitle"
    );

    if (!course) {
      return res.status(201).json({
        message: "Successfully created an assignment (without course)",
        assignment,
      });
    }

    const students = await User.find({
      enrolledCourses: course._id,
      role: "student",
    }).select("_id email name");

    if (students.length === 0) {
      return res.status(201).json({
        message: "Successfully created an assignment (without students)",
        assignment,
      });
    }

    const notifications = students.map((s) => ({
      userId: s._id,
      title: "New Assignment Created",
      content: `Course "${course.courseTitle}" have new assignment: ${title}`,
      type: "assignment",
      relatedId: assignment._id,
    }));

    await Notification.insertMany(notifications);
    for (const student of students) {
      await sendEmail(
        student.email,
        "New Assignment in Your Course",
        `
  <h2>Hello ${student.name},</h2>

  <p>Your instructor has posted a <strong>new assignment</strong> in the course:</p>
  <h3>${course.courseTitle}</h3>

  <p><strong>Assignment:</strong> ${title}</p>
  <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString(
    "en-US"
  )}</p>

  <p>Please log in to the system to view the assignment details and submit your work before the deadline.</p>

  <br/>
  <p>Best regards,</p>
  <p><strong>MyLMS Team</strong></p>
`
      );
    }

    console.log(" Sent notifications to", students.length, "students");

    res.status(201).json({
      message: "Created the assignment successfully.",
      assignment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssignmentsByLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const assignments = await Assignment.find({
      lectureId: new mongoose.Types.ObjectId(lectureId),
    }).sort({ createdAt: -1 });

    res.status(200).json({ assignments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { title, description, deadline, attachment, allowLate } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "No exercises found." });
    }

    assignment.title = title ?? assignment.title;
    assignment.description = description ?? assignment.description;
    assignment.deadline = deadline ?? assignment.deadline;

    if (typeof allowLate !== "undefined") {
      assignment.allowLate = Boolean(allowLate);
    }
    
    if (attachment) {
      if (assignment.attachment?.publicId) {
        await deleteMedia(assignment.attachment.publicId);
      }
      assignment.attachment = attachment;
    }

    await assignment.save();

    res.status(200).json({
      message: "Exercise update successful",
      assignment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.attachment?.publicId) {
      await deleteMedia(assignment.attachment.publicId);
    }

    await assignment.deleteOne();

    res.status(200).json({
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/v1/submission/assignment/:assignmentId
export const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignmentId })
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });

    res.status(200).json({ submissions });
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve the list of submitted assignments.",
      error: error.message,
    });
  }
};

export const getAssignmentsForInstructor = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const assignments = await Assignment.find({
      createdBy: instructorId,
    }).lean();

    const assignmentIds = assignments.map((a) => a._id);

    const submissionCounts = await Submission.aggregate([
      { $match: { assignmentId: { $in: assignmentIds } } },
      {
        $group: {
          _id: "$assignmentId",
          total: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    submissionCounts.forEach((s) => {
      countMap[s._id.toString()] = s.total;
    });

    const result = assignments.map((a) => ({
      ...a,
      totalSubmissions: countMap[a._id.toString()] || 0,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Unable to get the assignment ",
      error: error.message,
    });
  }
};
