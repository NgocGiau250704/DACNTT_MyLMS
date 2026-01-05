import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    lectureTitle: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
        // required: true,
    },
    publicId: {
        type: String,
    },
    isFree: {
        type: Boolean,
        // default: false,
    },
    slideUrl: {
    type: String,
    default: "", 
  },
}, { timestamps: true });

export const Lecture = mongoose.model('Lecture', lectureSchema);