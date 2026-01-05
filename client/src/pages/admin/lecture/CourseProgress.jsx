import { CardContent } from "@/components/ui/card";
import { CheckCircle2, CirclePlay } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Circle } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  useGetCourseProgressQuery,
  useUpdateLectureProgressMutation,
  useCompleteCourseMutation,
  useInCompleteCourseMutation,
} from "@/features/api/courseProgressApi";
import { LectureAssignments } from "./LectureAssignments";

const CourseProgress = () => {
  const params = useParams();
  const { courseId } = useParams();
  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [
    completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();

  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();

  useEffect(() => {
    if (completedSuccess && markCompleteData) {
      toast.success(markCompleteData.message);
      refetch();
    }

    if (inCompletedSuccess && markInCompleteData) {
      toast.success(markInCompleteData.message);
      refetch();
    }
  }, [
    completedSuccess,
    inCompletedSuccess,
    markCompleteData,
    markInCompleteData,
    refetch,
  ]);

  const [currentLecture, setCurrentLecture] = useState(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error loading course progress.</div>;
  }

  console.log("Course Progress Data:", data);

  const { courseDetails, progress, completed } = data.data;
  const activeLecture =
  currentLecture ||
  (courseDetails?.lectures && courseDetails.lectures[0]);

  const { courseTitle } = courseDetails;

  const initialLecture =
    currentLecture || (courseDetails.lectures && courseDetails.lectures[0]);

  const isLectureCompleted = (lectureId) => {
    return progress?.some(
      (prog) =>
        prog.viewed === true && String(prog.lectureId) === String(lectureId)
    );
  };

  //chon lecture de xem
  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
  };

  const handleLectureProgress = async (lectureId) => {
    try {
      await updateLectureProgress({ courseId, lectureId }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update lecture progress:", error);
    }
  };

  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
  };

  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };
if (!activeLecture) {
  return (
    <div className="mt-20 text-center text-gray-500">
      There are no lectures in this course yet.
    </div>
  );
}

  return (
    
    <div className="mt-20 space-y-10">
      <div className="max-w-7xl mx-auto p-4">
        {/* Course Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-700">{courseTitle}</h1>

          <button
            onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            variant={completed ? "outline" : "default"}
          >
            {completed ? "Mark as incompleted" : "Mark as completed"}
          </button>
        </div>

        {/* Main layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Video Player */}
          <div className="flex-1 bg-white shadow-lg rounded-2xl p-4">
            <video
              key={(currentLecture || initialLecture)._id}
              src={currentLecture?.videoUrl || initialLecture.videoUrl}
              controls
              className="w-full h-auto rounded-lg"
              // onPlay={() => handleLectureProgress(currentLecture?._id || initialLecture._id)}
              onEnded={() =>
                handleLectureProgress((currentLecture || initialLecture)._id)
              }
            />

            {/* slide */}
            {(currentLecture || initialLecture)?.slideUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Lecture Slides
                </h3>

                <iframe
                  src={(currentLecture || initialLecture).slideUrl}
                  className="w-full h-[400px] rounded-lg border"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}

            <LectureAssignments
              lectureId={(currentLecture || initialLecture)?._id}
            />

            <p className="mt-4 text-lg font-semibold text-gray-800">
              {`Lecture: ${
                courseDetails?.lectures.findIndex(
                  (lec) =>
                    lec._id === (currentLecture?._id || initialLecture._id)
                ) + 1
              } : ${
                currentLecture?.lectureTitle || initialLecture.lectureTitle
              }`}
            </p>
          </div>

          {/* Right Lecture List */}
          <div className="w-full md:w-1/3 space-y-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Course Lectures
            </h2>
            <div className="flex-1 overflow-y-auto">
              {courseDetails?.lectures.map((lecture, idx) => (
                <Card
                  key={lecture._id}
                  className={`mb-3 hover:cursor-pointer transition transform ${
                    lecture._id === currentLecture?._id
                      ? "dark:bg-gray-300"
                      : "bg-gray-100"
                  }`}
                  onClick={() => handleSelectLecture(lecture)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      {isLectureCompleted(lecture._id) ? (
                        <CheckCircle2
                          size="24"
                          className="text-green-500 mr-2"
                        />
                      ) : (
                        <CirclePlay size="24" className="text-gray-400 mr-2" />
                      )}

                      <div>
                        <CardTitle className="font-medium text-gray-800">
                          {lecture.lectureTitle}
                        </CardTitle>
                      </div>
                    </div>
                    {/* {isLectureCompleted(lecture._id) && (
                      <Badge
                        variant={"outline"}
                        className="bg-green-200 text-green-600"
                      >
                        Completed
                      </Badge>
                    )} */}

                    {isLectureCompleted(lecture._id) && (
                      <Badge
                        variant="outline"
                        className="bg-green-200 text-green-600"
                      >
                        Completed
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;
