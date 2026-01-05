import { CourseProgress } from "../models/courseProgress.model.js";
import { Course } from "../models/course.model.js";

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const courseProgress = await CourseProgress.findOne({
      // course: courseId,
      // user: userId,
      courseId,
      userId,
    });

    const courseDetails = await Course.findById(courseId).populate("lectures");

    if (!courseDetails) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
      data: {
        courseDetails,
        progress: courseProgress ? courseProgress.lectureProgress : [],
        completed: courseProgress ? courseProgress.completed : false,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.user._id;

    let courseProgress = await CourseProgress.findOne({
      // course: courseId,
      // user: userId,
      courseId: courseId,
      userId: userId,
    });

    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId: userId,
        courseId: courseId,
        completed: false,
        lectureProgress: [],
      });
    }

    // const lectureIndex = courseProgress.lectureProgress.findIndex(
    //   (l) => l.lectureId === lectureId
    // );
    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (l) => String(l.lectureId?._id || l.lectureId) === String(lectureId)
    );

    if (lectureIndex !== -1) {
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      courseProgress.lectureProgress.push({
        lectureId,
        viewed: true,
      });
    }

    // Check completion
    const course = await Course.findById(courseId);

    if (
      course?.lectures?.length &&
      courseProgress.lectureProgress.filter((l) => l.viewed).length ===
        course.lectures.length
    ) {
      courseProgress.completed = true;
    }

    await courseProgress.save();

    return res
      .status(200)
      .json({ message: "Lecture progress updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const markCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const courseProgress = await CourseProgress.findOne({
      // course: courseId,
      // user: userId,
      courseId: courseId,
      userId: userId,
    });

    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    courseProgress.lectureProgress.forEach((lecture) => {
      lecture.viewed = true;
    });

    courseProgress.completed = true;
    await courseProgress.save();

    return res.status(200).json({
      message: "Course marked as completed",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const markAsInCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const courseProgress = await CourseProgress.findOne({
      // course: courseId,
      // user: userId,
      courseId: courseId,
      userId: userId,
    });

    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    courseProgress.lectureProgress.forEach((lecture) => {
      lecture.viewed = false;
    });

    courseProgress.completed = false;
    await courseProgress.save();

    return res.status(200).json({
      message: "Course marked as incompleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
