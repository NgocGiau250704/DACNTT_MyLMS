import { CoursePurchase } from '../models/coursePurchase.model.js';
import AppError from '../utils/AppError.js';

export const isEnrolled = async (req, res, next) => {
    try {
        const { courseId } = req.params; 
        const userId = req.user.id; 

        if (!courseId || !userId) {
            return next(new AppError('Thiếu Course ID hoặc User ID để kiểm tra.', 400));
        }

        const enrollment = await CoursePurchase.findOne({
            course: courseId,
            user: userId,
            status: 'completed' 
        });

        if (!enrollment) {
            return next(new AppError('Bạn phải mua khóa học này và giao dịch phải hoàn tất để đăng bài đánh giá.', 403));
        }

        next(); 

    } catch (error) {
        console.error("Lỗi trong middleware isEnrolled:", error);
        next(new AppError('Lỗi máy chủ khi kiểm tra quyền truy cập khóa học.', 500));
    }
};