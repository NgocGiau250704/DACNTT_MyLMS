import mongoose from "mongoose";
import Conversation from "../models/Conversation.model.js";
import { Course } from "../models/course.model.js";

export const getOrCreateConversation = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;
  const { courseId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: "Invalid courseId" });
  }

  const course = await Course.findById(courseId).select("creator enrolledStudents");
  if (!course) return res.status(404).json({ message: "Course not found" });

  let studentId, instructorId;

  if (role === "student") {
    const enrolled = course.enrolledStudents.some(
      (id) => id.toString() === userId.toString()
    );
    if (!enrolled) return res.status(403).json({ message: "Not enrolled" });

    studentId = userId;
    instructorId = course.creator;
  } else {
    return res.status(403).json({ message: "Only student can chat here" });
  }

  const conversation = await Conversation.findOneAndUpdate(
    { courseId, studentId },
    { $setOnInsert: { courseId, studentId, instructorId } },
    { new: true, upsert: true }
  );

  res.json({ conversation });
};

export const listMyConversations = async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({ studentId: userId })
    .populate("courseId", "courseTitle")
    .populate("instructorId", "name photoUrl")
    .sort({ lastMessageAt: -1 });

  res.json({ conversations });
};
export const getInstructorConversations = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const conversations = await Conversation.find({
      instructorId,
    })
      .populate("courseId", "courseTitle")
      .populate("studentId", "name photoUrl")
      .sort({ lastMessageAt: -1 });

    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ message: "Load instructor conversations failed" });
  }
};

