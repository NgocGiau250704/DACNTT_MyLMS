import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import mongoose from "mongoose";

export const getInstructorDashboardStats = async (req, res) => {
  try {
   const instructorId =
  req.user?._id || req.userId || req.id;



    
    const totalCourses = await Course.countDocuments({
      creator: instructorId,
    });


    const courses = await Course.find({ creator: instructorId })
      .select("enrolledStudents");

    const studentSet = new Set();
    courses.forEach((course) => {
      course.enrolledStudents.forEach((studentId) => {
        studentSet.add(studentId.toString());
      });
    });

    const totalStudents = studentSet.size;

    
    const revenueResult = await CoursePurchase.aggregate([
      {
        $match: {
          status: "completed",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $match: {
          "course.creator": new mongoose.Types.ObjectId(instructorId),
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      totalCourses,
      totalStudents,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
    });

  } catch (error) {
    console.error("Instructor dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};


export const getCourseStats = async (req, res) => {
  try {
    const instructorId = req.user?._id || req.userId || req.id;

    const courses = await Course.find({ creator: instructorId });

    const stats = courses.map((c) => ({
      _id: c._id,
      courseTitle: c.courseTitle,
      coursePrice: c.coursePrice || 0,
      totalStudents: c.enrolledStudents ? c.enrolledStudents.length : 0,
    }));

    res.status(200).json({ courses: stats });
  } catch (error) {
    res.status(500).json({ message: "Failed to load course stats" });
  }
};