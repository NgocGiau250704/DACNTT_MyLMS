import React from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
const Course = ({ course }) => {
  return (
        <Link to = {`/course-detail/${course._id}`}>
      


    <Card
      className="
        overflow-hidden rounded-xl shadow-md bg-white 
        transform transition-all duration-300 
        hover:scale-105 hover:shadow-lg active:animate-pulse
        w-[260px] mx-auto cursor-pointer
      "
    >
      
      <div className="relative">
        <img
          src={course.courseThumbnail}
          alt={course.courseTitle}
          className="w-full h-36 object-cover rounded-t-xl"
        />
      </div>

      
      <div className="p-4 text-left">
       <h3 className="font-semibold text-gray-800 text-[15px] leading-snug mb-2">
  {course.courseTitle
    ? course.courseTitle.length > 40
      ? course.courseTitle.slice(0, 37) + "..."
      : course.courseTitle
    : "Untitled course"}
</h3>


        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-2">
            <img
              src={course.creator?.photoUrl}
              alt={course.creator?.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-gray-600">{course.creator?.name}</span>
          </div>
          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
            {course.courseLevel}
          </span>
        </div>

        <p className="font-bold text-gray-900">{course.coursePrice}</p>
      </div>
    </Card>
    </Link>
  );
};

export default Course;
