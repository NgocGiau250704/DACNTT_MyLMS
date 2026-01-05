import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    // unique: true 
},
  email: { 
    type: String, 
    required: true, 
    unique: true 
},
    password: {
      type: String,
      required: true
    },
    role: {
        type: String,
        enum: ['instructor', 'student'],
        default: 'student'
    },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    photoUrl: {
        type: String,
        default: ''
    },

    //them
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
    },

    verificationTokenExpiry: {
        type: Date,
    },  

    resetToken: {
        type: String,
    },
    resetTokenExpiry: {
        type: Date,
    },
    //them toi do

}, { timestamps: true });

export const User = mongoose.model('User', userSchema, 'users');
