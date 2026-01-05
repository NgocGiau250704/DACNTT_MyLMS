import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["assignment", "course", "system"],
      default: "assignment",
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId, // assignmentId
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);
