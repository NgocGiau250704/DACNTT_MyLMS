import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateReviewMutation } from "@/features/api/reviewApi";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { BadgeInfo, PlayCircle, Lock, Star } from "lucide-react";

import { useGetCourseByIdQuery } from "@/features/api/courseApi";
import { useGetCourseReviewsQuery } from "@/features/api/reviewApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const StarDisplay = ({ rating, size = 20 }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(
        <Star key={i} size={size} className="text-yellow-500 fill-yellow-500" />
      );
    } else if (rating >= i - 0.5) {
      stars.push(
        <div key={i} className="relative" style={{ width: size, height: size }}>
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: size / 2 }}
          >
            <Star size={size} className="text-yellow-500 fill-yellow-500" />
          </div>

          <Star size={size} className="text-gray-300 fill-gray-300" />
        </div>
      );
    } else {
      stars.push(
        <Star key={i} size={size} className="text-gray-300 fill-gray-300" />
      );
    }
  }

  return <div className="flex gap-1">{stars}</div>;
};
const CreateReviewForm = ({ courseId }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = !!user;
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [createReview, { isLoading: isCreating, error: createError }] =
    useCreateReviewMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: `/course/${courseId}` } });
      return;
    }

    try {
      await createReview({
        courseId,
        rating,
        comment,
      }).unwrap();

      setComment(""); // Reset comment sau khi gửi thành công
      alert("Đánh giá của bạn đã được gửi thành công!");
    } catch (err) {
      alert("Lỗi: " + (err.data?.message || ""));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 p-6 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
       Write a review
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
         Choose the number of stars:
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((starValue) => (
            <Star
              key={starValue}
              size={24}
              onClick={() => setRating(starValue)}
              fill={starValue <= rating ? "currentColor" : "none"}
              className={`cursor-pointer transition ${
                starValue <= rating ? "text-yellow-500" : "text-gray-400"
              }`}
              strokeWidth={1.5}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">You have selected: {rating} star</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Comment
        </label>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn về khóa học..."
        />
      </div>

      <Button type="submit" disabled={isCreating} className="w-full">
        {isCreating ? "Đang gửi..." : "Gửi Đánh Giá"}
      </Button>

      {createError && (
        <p className="text-red-500 mt-2 text-sm">
          Error: {createError.data?.message || "Cannot submit review."}
        </p>
      )}
    </form>
  );
};


const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;

 const reduxUser = useSelector((state) => state.auth.user);
const localUser = JSON.parse(localStorage.getItem("user"));

const user = reduxUser || localUser;
const userId = user?._id;

console.log("User currently using:", user);
console.log("UserId:", userId);

  const [purchasedCourse, setPurchasedCourse] = useState(false);
  const { data, isLoading, isError } = useGetCourseByIdQuery(courseId);
  const course = data?.course;

useEffect(() => {
  if (!userId || !courseId) return;

  const checkPurchased = async () => {
    const res = await fetch(
      `https://dacntt-mylms-1.onrender.com/api/v1/course/${courseId}/check-purchased?userId=${userId}`
    );
    const data = await res.json();

    console.log("CHECK PURCHASED:", data);
    setPurchasedCourse(data.purchased);
  };

  checkPurchased();
}, [courseId, userId]);








  const {
    data: reviewData,
    isLoading: isLoadingReviews,
    isError: isReviewError,
  } = useGetCourseReviewsQuery(courseId);

  const reviews = reviewData?.data?.reviews || [];

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mt-24 max-w-7xl mx-auto py-10 px-4 md:px-8">
        <p className="text-xl text-center animate-pulse">
          Đang tải chi tiết khóa học...
        </p>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="mt-24 max-w-7xl mx-auto py-10 px-4 md:px-8">
        <h1 className="text-3xl font-bold text-red-500 text-center">
          Lỗi: Không tìm thấy khóa học này!
        </h1>
      </div>
    );
  }

const handleBuyNow = () => {
  if (!user) {
    navigate("/login", { state: { redirectTo: `/course/${courseId}` } });
    return;
  }

  navigate(`/checkout/${courseId}`);
};


  const totalLectures = course.lectures ? course.lectures.length : 0;

  const handleContinueCourse = () => {
    navigate(`/course-progress/${courseId}`);
  }



  return (
    <div className="mt-20 space-y-10">
      <div className="bg-gradient-to-b from-[#1F1F22] to-[#2D2F31] text-white shadow-xl">
        <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 flex flex-col gap-3">
          <h1 className="font-bold text-2xl md:text-4xl leading-tight">
            {course.courseTitle}
          </h1>

          <p className="text-base md:text-lg opacity-90">{course.subTitle}</p>

          <p className="text-sm">
            Created By:
            <span className="text-indigo-300 underline ml-1">
              {course.creator?.name || "Instructor"}
            </span>
          </p>

          <div className="flex items-center gap-2 text-sm opacity-90">
            <BadgeInfo size={16} />
            <p>Last updated 11-11-2025</p>
          </div>

          <p className="text-sm opacity-90">
            Students enrolled: {course.enrolledStudents?.length || 0}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-10 justify-between">
        <div className="w-full lg:w-2/3 space-y-8 text-gray-900 dark:text-gray-200">
          <div>
            <h1 className="font-bold text-2xl mb-3 text-gray-900">
              Description
            </h1>
            <p className="text-base leading-relaxed text-gray-800">
              {course.description}
            </p>
          </div>

          <Card className="shadow-md border dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-700">Course Content</CardTitle>
              <CardDescription className="text-gray-700">
                {totalLectures} lectures
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-gray-700">
              {course.lectures?.map((lecture, idx) => (
                <div
                  key={lecture._id || idx}
                  className="flex items-center gap-3 text-sm p-2 border-b last:border-none dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition text-gray-700"
                >
                  {lecture.isFree || purchasedCourse ? (
                    <PlayCircle size={18} className="text-green-600" />
                  ) : (
                    <Lock size={18} className="text-red-500" />
                  )}

                  <p className="text-gray-700 font-medium">
                    {lecture.lectureTitle}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="pt-4">
            <h1 className="font-bold text-2xl mb-4 text-gray-900 flex items-center gap-2">
              Student Reviews ({reviews.length})
            </h1>

            <div className="mb-6 flex items-baseline gap-2 text-gray-900">
              <span className="text-4xl font-extrabold">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-xl font-medium">Average Rating</span>
              <StarDisplay rating={averageRating} size={20} />
            </div>

            <div className="space-y-6">
              {reviews.map((review) => {
                const numericRating = parseInt(review.rating, 10) || 0;
                const safeRating = Math.min(5, Math.max(0, numericRating));

                return (
                  <div
                    key={review.id}
                    className="border-b pb-4 last:border-b-0 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.user?.photoUrl || "/default-avatar.png"}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover border"
                        />

                        <h3 className="font-semibold text-lg text-gray-800">
                          {review.user?.name}
                        </h3>
                      </div>

                      <span className="text-sm text-gray-500">
                        {review.date}
                      </span>
                    </div>

                    <div className="flex text-yellow-500 mb-2">
                      {[...Array(safeRating)].map((_, i) => (
                        <Star key={`full-${i}`} size={16} fill="currentColor" />
                      ))}
                      {[...Array(5 - safeRating)].map((_, i) => (
                        <Star
                          key={`empty-${i}`}
                          size={16}
                          className="text-gray-300"
                        />
                      ))}
                    </div>

                    <p className="text-gray-700 italic">"{review.comment}"</p>
                  </div>
                );
              })}

              <CreateReviewForm courseId={courseId} />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3 text-gray-800">
          <Card className="shadow-lg border  sticky top-24 text-gray-700">
            <CardContent className="p-4 flex flex-col">
              {course.courseIntroVideoUrl ? (
                <video
                  src={course.courseIntroVideoUrl}
                  controls
                  className="w-full aspect-video rounded-md"
                />
              ) : (
                <div className="w-full aspect-video bg-black/20 dark:bg-white/10 rounded-md flex items-center justify-center text-sm text-gray-500">
                  (Video preview)
                </div>
              )}

              <h1 className="text-base font-semibold text-gray-700">
                {course.lectures?.[0]?.lectureTitle || "Xem thử bài giảng"}
              </h1>

              <Separator className="my-3 text-gray-700" />

              <p className="text-gray-800 font-semibold text-xl">
                Course Price:
              </p>
              <h1 className="text-2xl font-bold text-gray-800">
                {course.coursePrice === 0
                  ? "Miễn phí"
                  : course.coursePrice.toLocaleString("vi-VN") + " VND"}
              </h1>
            </CardContent>

            <CardFooter className="flex justify-center p-4">
              {purchasedCourse ? (
                <Button onClick={handleContinueCourse} className="w-full h-12 text-base font-medium">
                  Continue Course
                </Button>
              ) : (
                <Button
                  className="w-full h-12 text-base font-medium"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
