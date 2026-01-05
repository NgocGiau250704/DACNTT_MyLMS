import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    deadline: {
      type: Date,
      required: true,
    },

    attachment: {
      fileUrl: {
        type: String,
        default: "",
      },
      downloadUrl: { type: String, default: "" }, 
      publicId: {
        type: String,
        default: "",
      },
      originalName: {
        type: String,
        default: "",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    allowLate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model("Assignment", assignmentSchema);
