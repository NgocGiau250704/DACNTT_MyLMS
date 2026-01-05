import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetAssignmentsForInstructorQuery } from "@/features/api/assignmentApi";
import AdminSidebar from "@/pages/admin/AdminSidebar"; // Đảm bảo đã import sidebar

const AssignmentsAdmin = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetAssignmentsForInstructorQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="ml-64 p-8 mt-16 text-gray-600">Loading assignment...</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <AdminSidebar />

    
      <main className="ml-64 flex-1 p-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Assignments</h2>
            <p className="text-sm text-gray-500">
              Manage and grade student assignments.
            </p>
          </div>

          {!data || data.length === 0 ? (
            <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
              <p className="text-gray-500 italic">You haven't created any assignments yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {data.map((a) => (
                <div
                  key={a._id}
                  onClick={() => navigate(`/admin/assignments/${a._id}/grading`)} // Gợi ý path chuẩn hơn
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <span className="mr-2"> </span>
                        Deadline: {new Date(a.deadline).toLocaleString("vi-VN")}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-600">
                        {a.totalSubmissions || 0} Submit 
                      </span>
                      <p className="text-xs text-blue-400 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to grade
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssignmentsAdmin;