import Conversation from "../models/Conversation.model.js";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";

export const initChat = async (req, res) => {
  const userId = req.user._id;


  const user = await User.findById(userId).populate({
    path: "enrolledCourses",
    select: "_id creator",
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  
  for (const course of user.enrolledCourses) {
    await Conversation.findOneAndUpdate(
      {
        courseId: course._id,
        studentId: userId,
      },
      {
        $setOnInsert: {
          courseId: course._id,
          studentId: userId,
          instructorId: course.creator,
        },
      },
      { upsert: true }
    );
  }


  const conversations = await Conversation.find({ studentId: userId })
    .populate("courseId", "courseTitle")
    .populate("instructorId", "name photoUrl")
    .sort({ lastMessageAt: -1 });

  res.json({ conversations });
};
