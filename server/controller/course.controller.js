import { Course } from "../models/course.model.js";
import { deleteVideoFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { CoursePurchase } from "../models/coursePurchase.model.js";


//create course controller
export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;

    if (!courseTitle || !category) {
      return res.status(400).json({
        message: "Course title and category are required",
      });
    }

    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });
    return res.status(201).json({
      course,
      message: "Course created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course",
    });
  }
};
export const checkPurchasedCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.query;

    const user = await User.findById(userId).select("role enrolledCourses");
    if (!user) return res.json({ purchased: false });

    const course = await Course.findById(courseId).select("creator");
    if (!course) return res.json({ purchased: false });

    if (
      user.role === "instructor" &&
      course.creator.toString() === userId.toString()
    ) {
      return res.json({ purchased: true });
    }

    const purchased = user.enrolledCourses.some(
      (id) => id.toString() === courseId
    );

    return res.json({ purchased });
  } catch (err) {
    console.error("checkPurchasedCourse error:", err);
    return res.status(500).json({ purchased: false });
  }
};





export const uploadCourseIntroVideo = async (req, res) => {
  try {
     console.log("UPLOAD INTRO VIDEO TRIGGERED");
    console.log("REQ FILE:", req.file);
    console.log("REQ BODY:", req.body);
    const { courseId } = req.params;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Xóa video cũ nếu có
    if (course.courseIntroPublicId) {
      await deleteVideoFromCloudinary(course.courseIntroPublicId);
    }

    // Upload video mới
    const uploadResult = await uploadMedia(videoFile.path);

    course.courseIntroVideoUrl = uploadResult.secure_url;
    course.courseIntroPublicId = uploadResult.public_id;
    await course.save();

    return res.status(200).json({
      message: "Course intro video uploaded successfully",
       course,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to upload course intro video" });
  }
};

//get all courses of a creator
export const getAllCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      return res.status(404).json({
        courses: [],
        message: "No courses found for this creator",
      });
    }
    return res.status(200).json({
      courses,
      message: "Courses fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch courses",
    });
  }
};

//edit course controller
export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
      isPublished,
    } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    let courseThumbnail = course.courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteVideoFromCloudinary(publicId);
      }
    }

    //upload a thumbnail to cloudinary
    // courseThumbnail = await uploadMedia(thumbnail.path);
    // courseThumbnail = courseThumbnail?.secure_url;
    if (thumbnail && thumbnail.path) {
      // nếu course đã có thumbnail cũ, xóa
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteVideoFromCloudinary(publicId);
      }

      // upload file mới
      const result = await uploadMedia(thumbnail.path);
      courseThumbnail = result?.secure_url;
    }

    const updatedData = {
      courseTitle: courseTitle || course.courseTitle,
      subTitle: subTitle || course.subTitle,
      description: description || course.description,
      category: category || course.category,
      courseLevel: courseLevel || course.courseLevel,
      coursePrice: coursePrice || course.coursePrice,

      courseThumbnail,
    };

    if (isPublished !== undefined) {
      updatedData.isPublished = isPublished === "true" || isPublished === true;
    }

    course = await Course.findByIdAndUpdate(courseId, updatedData, {
      new: true,
    });

    return res.status(200).json({
      message: "Course updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to edit course",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    // const course = await Course.findById(courseId);
    const course = await Course.findById(courseId)
        .populate('enrolledStudents', 'name') // Lấy tên học viên
        .populate('lectures') // Lấy chi tiết các bài giảng
        .populate('creator', 'name photoUrl') // Lấy tên và ảnh của người tạo
        .exec();''


    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      course,
      message: "Course fetched successfully",
    });
    return res.status(200).json(course);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch course",
    });
  }
};

export const createLecture = async (req, res) => {
  try {
    // , videoUrl, isFree
    const { lectureTitle } = req.body;
    // const courseId = req.params;
    const courseId = req.params.courseId;

    if (!lectureTitle || !courseId) {
      return res.status(400).json({
        message: "Lecture title is required",
      });
    }
    const lecture = await Lecture.create({
      lectureTitle,
      // videoUrl,
      // isFree
    });

    const course = await Course.findById(courseId);

    if (course) {
      course.lectures.push(lecture._id);
      await course.save();
    }

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(201).json({
      lecture,
      message: "Lecture created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create lecture",
    });
  }
};

export const getPublishedCourse = async(req, res) => {
  try{
    const courses = await Course.find({isPublished: true}).populate({path: "creator", select: "name photoUrl"});
    if(!courses){
      return res.status(404).json({
        message: "Course not found"
      })
    }
    return res.status(200).json({
      courses,
    })
  }catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get published courses",
    });
  }
}


//lecture
export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
      });
    }
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      lectures: course.lectures,
      message: "Lectures fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch lectures",
    });
  }
};

export const editLecture = async (req, res) => {
  try {
    const { lectureTitle, videoInfo, isFree, slideUrl } = req.body;
    const { courseId, lectureId } = req.params;
    let lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }
    //update lecture details
    if (lectureTitle) {
      lecture.lectureTitle = lectureTitle;
    }
    if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;

    // if (isFree){
    lecture.isFree = isFree;
    // }

    if (slideUrl !== undefined) {
      lecture.slideUrl = slideUrl;
    }
    
    await lecture.save();

    //ensure the course still contains this lecture
    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }
    return res.status(200).json({
      lecture,
      message: "Lecture updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to edit lecture",
    });
  }
};

export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }
    //delete video from cloudinary
    if (lecture.publicId) {
      await deleteVideoFromCloudinary(lecture.publicId);
    }

    //remove lecture from course's lecture array
    await Course.updateOne(
      { lectures: lectureId },
      { $pull: { lectures: lectureId } } // remove lectureId from lectures array
    );
    return res.status(200).json({
      message: "Lecture removed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to remove lecture",
    });
  }
};

// UPLOAD LECTURE VIDEO
export const uploadLectureVideo = async (req, res) => {
  try {
    const { lectureId } = req.params;

    // 1. Không có file → báo lỗi ngay
    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    // 2. Tìm lecture
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // 3. Upload video mới lên Cloudinary — ép chuyển sang MP4
    const uploaded = await uploadMedia(req.file.path);

    if (!uploaded?.secure_url) {
      return res.status(500).json({ message: "Cloudinary upload failed" });
    }

    // 4. Xóa video cũ *sau khi* upload thành công
    if (lecture.publicId) {
      try {
        await deleteVideoFromCloudinary(lecture.publicId);
      } catch (err) {
        console.log("Failed to delete old video:", err);
      }
    }

    // 5. Lưu video mới vào MongoDB
    lecture.videoUrl = uploaded.secure_url;
    lecture.publicId = uploaded.public_id;

    await lecture.save();

    // 6. Trả về JSON cho frontend
    return res.status(200).json({
      success: true,
      message: "Lecture video uploaded successfully",
      videoUrl: uploaded.secure_url,
      publicId: uploaded.public_id
    });

  } catch (err) {
    console.log("UPLOAD LECTURE ERROR:", err);
    res.status(500).json({ message: "Failed to upload lecture video" });
  }
};



export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }
    return res.status(200).json({
      lecture,
      message: "Lecture fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch lecture",
    });
  }
};


export const togglePublishCourse = async(req, res) => {
  try{
    const {courseId} = req.params;
    const {publish} = req.query; //true or false
    const course = await Course.findByIf(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    //publish status based on the query paramter
    course.isPublished = publish === "true";
    await course.save();

    const statusMessage = course.isPublished? "Published" : "Unpublished"
    return res.status(200).json({
      message: `Course is ${statusMessage}`
    })
  }catch(error){
    console.log(error);
    return res.status(500).json({
      message: "Failed to update status"
    })
  }
}

// GET /api/v1/course/stats/enrollments
export const getMyCourseEnrollmentStats = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const courses = await CoursePurchase.aggregate([
      // chỉ lấy giao dịch thành công
      {
        $match: { status: "completed" }
      },

      // join sang Course
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },

      // chỉ course của instructor đang đăng nhập
      {
        $match: {
          "course.creator": new mongoose.Types.ObjectId(instructorId)
        }
      },

      // gom theo từng course
      {
        $group: {
          _id: "$course._id",
          courseTitle: { $first: "$course.courseTitle" },
          coursePrice: { $first: "$course.coursePrice" },
          totalStudents: { $sum: 1 },      // số người thanh toán
          revenue: { $sum: "$amount" }     // tổng tiền
        }
      },

      // tăng dần theo số học viên
      {
        $sort: { totalStudents: 1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      courses
    });
  } catch (error) {
    console.error("getMyCourseEnrollmentStats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course statistics"
    });
  }
};
// SEARCH & SUGGEST COURSE (autocomplete)
export const searchCourseSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json({ courses: [] });
    }

    const courses = await Course.find({
      isPublished: true,
      courseTitle: { $regex: q, $options: "i" } // không phân biệt hoa thường
    })
      .select("_id courseTitle coursePrice")

      .limit(6);

    return res.status(200).json({
      courses
    });
  } catch (error) {
    console.error("searchCourseSuggestions error:", error);
    return res.status(500).json({
      message: "Failed to search courses"
    });
  }
};
// FULL SEARCH COURSES (for Explore / Enter)
export const searchCourses = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(200).json({ courses: [] });
    }

    const courses = await Course.find({
      isPublished: true,
      courseTitle: {
        $regex: q,
        $options: "i" 
      }
    }).populate({
      path: "creator",
      select: "name photoUrl"
    });

    return res.status(200).json({
      courses
    });
  } catch (error) {
    console.error("searchCourses error:", error);
    return res.status(500).json({
      message: "Failed to search courses"
    });
  }
};
// FILTER COURSES
export const filterCourses = async (req, res) => {
  try {
    const { instructorId, minPrice, maxPrice } = req.query;

    const filter = { isPublished: true };

    if (instructorId) {
      filter.creator = instructorId;
    }

    if (minPrice || maxPrice) {
      filter.coursePrice = {};
      if (minPrice) filter.coursePrice.$gte = Number(minPrice);
      if (maxPrice) filter.coursePrice.$lte = Number(maxPrice);
    }

    const courses = await Course.find(filter)
      .populate("creator", "name photoUrl");

    return res.status(200).json({ courses });
  } catch (error) {
    console.error("filterCourses error:", error);
    return res.status(500).json({
      message: "Failed to filter courses",
    });
  }
};
// GET STUDENTS OF A COURSE (Instructor only)
export const getEnrolledStudentsOfCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user._id;

    const course = await Course.findOne({
      _id: courseId,
      creator: instructorId, // bảo mật: chỉ xem course của mình
    }).populate("enrolledStudents", "name email photoUrl");

    if (!course) {
      return res.status(404).json({
        message: "Course not found or access denied",
      });
    }

    return res.status(200).json({
      courseTitle: course.courseTitle,
      students: course.enrolledStudents,
    });
  } catch (error) {
    console.error("getEnrolledStudentsOfCourse error:", error);
    return res.status(500).json({
      message: "Failed to fetch enrolled students",
    });
  }
};
