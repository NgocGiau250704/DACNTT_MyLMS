import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', 
        required: [true, 'Review must belong to a course.'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: [true, 'Review must belong to a user.'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'A review must have a rating.'],
    },
    comment: {
        type: String,
        trim: true,
        required: [true, 'A review must have a comment.'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review; 