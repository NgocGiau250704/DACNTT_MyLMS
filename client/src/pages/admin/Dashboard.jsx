import React, { useState } from "react";
import AdminSidebar from "@/pages/admin/AdminSidebar";
import {
  useGetDashboardStatsQuery,
  useGetCourseStatsQuery,
} from "@/features/api/instructorApi";
import { useGetEnrolledStudentsQuery } from "@/features/api/courseApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import InstructorChat from "./InstructorChat";



const Dashboard = () => {
  
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState("");
  const [showStudents, setShowStudents] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useGetDashboardStatsQuery();

  const { data: courseStatsData, isLoading: isCourseLoading } =
    useGetCourseStatsQuery();

  const { data: studentData, isFetching: isStudentLoading } =
    useGetEnrolledStudentsQuery(selectedCourseId, {
      skip: !selectedCourseId,
    });

  const courseStats = courseStatsData?.courses || [];
  const students = studentData?.students || [];

 
  const handleViewStudents = (course) => {
    setSelectedCourseId(course._id);
    setSelectedCourseTitle(course.courseTitle);
    setShowStudents(true);
  };
  
  if (isLoading || isCourseLoading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="ml-64 p-8 mt-16">Loading...</main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="ml-64 p-8 mt-16 text-red-600">
          {error?.data?.message || "Failed to load dashboard"}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />

      <main className="ml-64 flex-1 p-8 mt-16 bg-white">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Instructor Dashboard
        </h2>
        <div className="flex items-center justify-between mb-8">

</div>

      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white shadow-md rounded-xl p-6 text-center">
            <p className="text-gray-500 mb-2">Total Course</p>
            <h3 className="text-3xl font-bold text-blue-600">
              {stats?.totalCourses ?? 0}
            </h3>
          </div>

          <div className="bg-white shadow-md rounded-xl p-6 text-center">
            <p className="text-gray-500 mb-2">Total Students</p>
            <h3 className="text-3xl font-bold text-green-600">
              {stats?.totalStudents ?? 0}
            </h3>
          </div>

          <div className="bg-white shadow-md rounded-xl p-6 text-center">
            <p className="text-gray-500 mb-2">Total Revenue</p>
            <h3 className="text-3xl font-bold text-purple-600">
              {(stats?.totalRevenue ?? 0).toLocaleString("vi-VN")} VNĐ
            </h3>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 mt-10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-semibold text-gray-800">
              My Courses – Enrollment Statistics
            </h3>
            <span className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
              Paid enrollments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 text-sm">
                  <th className="p-3 text-left font-semibold rounded-tl-xl">
                    #
                  </th>
                  <th className="p-3 text-left font-semibold">Course</th>
                  <th className="p-3 text-right font-semibold">Price (VNĐ)</th>
                  <th className="p-3 text-right font-semibold rounded-tr-xl">
                    Students
                  </th>
                </tr>
              </thead>
              <tbody>
                {courseStats.map((c, index) => (
                  <tr
                    key={c._id}
                    onClick={() => handleViewStudents(c)} // Pass the whole object
                    className={`cursor-pointer transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-100`}
                  >
                    <td className="p-3 text-gray-500">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-800">
                      {c.courseTitle}
                    </td>
                    <td className="p-3 text-right font-semibold text-purple-600">
                      {(c.coursePrice ?? 0).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                        {c.totalStudents}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

     
          <Dialog open={showStudents} onOpenChange={setShowStudents}>
            <DialogContent className="max-w-xl bg-white border border-gray-200 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-800">
                  Enrolled Students – {selectedCourseTitle}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  List of students currently enrolled in this course.
                </DialogDescription>
              </DialogHeader>

              {isStudentLoading ? (
                <p className="text-center py-6">Loading students...</p>
              ) : students.length === 0 ? (
                <p className="text-gray-400 italic text-center py-6">
                  No students enrolled in this course.
                </p>
              ) : (
                <ul className="divide-y max-h-[400px] overflow-y-auto">
                  {students.map((s) => (
                    <li key={s._id} className="flex items-center gap-4 py-3">
                      <img
                        src={s.photoUrl || "/avatar.png"}
                        alt={s.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{s.name}</p>
                        <p className="text-sm text-gray-500">{s.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <InstructorChat />


    </div>
  );
};

export default Dashboard;
