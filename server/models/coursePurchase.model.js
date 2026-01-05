import mongoose from "mongoose";

const coursePurchaseSchema = new mongoose.Schema({
    courseId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        require: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    amount:{
        type:Number,
        require: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentId: {
        type: String,
        require: true
    }
}, {timestamps: true});
export const CoursePurchase = mongoose.model('CoursePurchase', coursePurchaseSchema);
