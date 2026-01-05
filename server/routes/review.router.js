import express from 'express';
// import { isEnrolled } from '../middlewares/isEnrolled.middleware.js';

import { getCourseReviews, createReview } from '../controller/review.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getCourseReviews) 
    
    .post(
        isAuthenticated,
        // isEnrolled,
        createReview 
    );

export default router;