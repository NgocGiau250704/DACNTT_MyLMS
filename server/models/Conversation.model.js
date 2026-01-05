import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// chống overwrite
const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
