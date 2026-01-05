import React, { useState } from "react";
import AdminSidebar from "@/pages/admin/AdminSidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetCreateCourseQuery } from "@/features/api/courseApi";
export default function CourseAdmin() {
  const {data, isLoading, error} = useGetCreateCourseQuery();
  const navigate = useNavigate();
  const courses = data?.courses || [];
  
  if (isLoading) {
    return <div>Loading...</div>;
  }


  return (
   <div className="flex min-h-screen bg-white">
      
      <AdminSidebar />

  

      
      <main className="flex-1 bg-white p-20 pl-80 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Courses</h1>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
           onClick={() => navigate("/create-course")}
          >
            Create New Course
          </button>
        </div>

        <div className="bg-white shadow-md rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="py-3 px-6 font-medium text-black">Title</th>
                <th className="py-3 px-6 font-medium text-black ">Price</th>
                <th className="py-3 px-6 font-medium text-black ">Status</th>
                <th className="py-3 px-6 font-medium text-black ">Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-6 text-black">{course?.courseTitle}</td>
                  <td className="py-3 px-6 text-black"><b>{course?.coursePrice || "NA"}</b></td>
                  <td className="py-3 px-6 text-black">
                    <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                      {course?.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <button 
                    className="bg-indigo-600 hover:bg-gray-300 px-4 py-1 rounded-lg text-sm font-medium "
                    //  onClick={() => navigate("/edit-course")}>
                      onClick={() => navigate(`/edit-course/${course._id}/`)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* <p>A list of your recent courses</p> */}
          </table>
        </div>
      </main>
    </div>
  );
}
