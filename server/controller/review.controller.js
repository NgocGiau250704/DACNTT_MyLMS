import Review from '../models/review.model.js'; 
import { Course } from "../models/course.model.js";
import AppError from '../utils/AppError.js'; 
import mongoose from 'mongoose'; 

const updateCourseRating = async (courseId) => {
    const stats = await Review.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(courseId) } },
        {
            $group: {
                _id: '$course',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Course.findByIdAndUpdate(courseId, {
            ratingsQuantity: stats[0].nRating,
            averageRating: stats[0].avgRating
        });
    } else {
        await Course.findByIdAndUpdate(courseId, {
            ratingsQuantity: 0,
            averageRating: 0
        });
    }
};

// review.controller.js

export const createReview = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Validate rating
        if (!req.body.rating || req.body.rating < 1 || req.body.rating > 5) {
            return next(new AppError("Rating must be between 1 and 5.", 400));
        }

        // Always create new review (NO update, NO upsert)
        const newReview = await Review.create({
            course: courseId,
            user: userId,
            rating: req.body.rating,
            comment: req.body.comment || "",
        });

        // Update course stats (average + count)
        await updateCourseRating(courseId);

        res.status(201).json({
            status: "success",
            message: "Review created successfully",
            data: { review: newReview },
        });
    } catch (error) {
        next(error);
    }
};


/**
 * @route GET /api/v1/courses/:courseId/reviews
 * @description Gets all reviews for a specific course
 * @access Public
 */
export const getCourseReviews = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const reviews = await Review.find({ course: courseId })
            .populate({
                path: 'user',
                select: 'name photoUrl', 
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: {
                reviews,
            },
        });
    } catch (error) {
        next(error);
    }
};