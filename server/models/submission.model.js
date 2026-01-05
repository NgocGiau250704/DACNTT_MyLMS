import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    file: {
      fileUrl: String,
       downloadUrl: String,
      publicId: String,
      originalName: String,
    },

    score: {
      type: Number,
      default: null,
    },

    feedback: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["submitted", "graded"],
      default: "submitted",
    },

    gradedAt: {
      type: Date,
    },

    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Submission = mongoose.model("Submission", submissionSchema);
