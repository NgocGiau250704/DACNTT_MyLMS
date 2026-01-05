import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, Trash2, PlusCircle, ArrowLeft, BookOpen } from "lucide-react";
import AdminSidebar from "@/pages/admin/AdminSidebar";
import {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Assuming you have shadcn/ui Card components, otherwise standard divs with classes work too.

export default function Lecture() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  console.log("CourseId from params:", courseId);

  const [lectureTitle, setLectureTitle] = useState("");

  const {
    data,
    isLoading: isFetching,
    refetch,
  } = useGetCourseLectureQuery({ courseId }, { skip: !courseId });

  const [
    createLecture,
    { isLoading: isCreating, isSuccess, error, data: createData },
  ] = useCreateLectureMutation();

  const lectures = data?.lectures || [];
  const [localLectures, setLocalLectures] = useState([]);
  
  useEffect(() => {
    if (data?.lectures) setLocalLectures(data.lectures);
  }, [data]);

  const handleAddLecture = () => { // Kept logic for setLocalLectures though seemingly unused by createLectureHandler
    if (!lectureTitle.trim()) {
      alert("Please enter a lecture title");
      return;
    }

    const newLecture = {
      id: Date.now().toString(),
      title: lectureTitle,
    };

    setLocalLectures((prev) => [...prev, newLecture]);
    setLectureTitle("");
  };

  const createLectureHandler = async () => {
    if (!lectureTitle.trim()) return;

    await createLecture({ lectureTitle, courseId });
    setLectureTitle(""); // reset input
    refetch(); // lấy lại danh sách lecture mới từ backend
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  const [removeLecture, { isLoading: isDeleting }] = useRemoveLectureMutation();

  const handleDelete = async (lectureId) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) return;
    try {
      await removeLecture(lectureId).unwrap();
      toast.success("Lecture deleted successfully");
      refetch(); // reload after deletion
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete lecture");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50"> 
      {/* Sidebar */}
      <AdminSidebar />

     
      <main className="flex-1 ml-64 p-8 w-full relative"> 
        
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/edit-course/${courseId}/`)}
                    className="text-gray-600 hover:text-gray-900 gap-1 pl-0 hover:bg-transparent"
                >
                    <ArrowLeft size={16} />
                    Back to Course Details
                </Button>
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Course Curriculum
                </h1>
                <p className="text-gray-500 text-lg">
                    Manage your lectures and organize the learning path for your students.
                </p>
            </div>

            {/* Create Lecture Card */}
            <Card className="border-none shadow-md bg-white text-gray-600">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <PlusCircle className="text-indigo-600" size={20}/>
                        Add New Lecture
                    </CardTitle>
                    <CardDescription>
                        Enter a descriptive title for your new lecture.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Input
                            placeholder="e.g., Introduction to React Hooks"
                            value={lectureTitle}
                            onChange={(e) => setLectureTitle(e.target.value)}
                            className="flex-1 text-base py-5 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" // Styled Input
                        />
                        <Button 
                            disabled={isCreating} 
                            onClick={createLectureHandler}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-5 font-medium transition-colors"
                        >
                            {isCreating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                            ) : (
                            "Add Lecture"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <BookOpen size={20} className="text-gray-500"/>
                        Existing Lectures
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-2">
                            {localLectures.length}
                        </span>
                    </h3>
                </div>

                {isFetching ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Loading your curriculum...</p>
                    </div>
                ) : localLectures.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-2">No lectures added yet.</p>
                        <p className="text-sm text-gray-400">Start by adding your first lecture above.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {localLectures.map((lecture, index) => (
                            <div
                                key={lecture._id || lecture.id}
                                className="group flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm">
                                        {index + 1}
                                    </div>
                                    <p className="text-gray-900 font-medium text-lg">
                                        {lecture.lectureTitle || lecture.title}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => navigate(`/${courseId}/edit-lecture/${lecture._id}`)}
                                        className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                                        title="Edit Lecture"
                                    >
                                        <Pencil size={18} />
                                    </Button>
                                    
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={isDeleting}
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(lecture._id)}
                                        title="Delete Lecture"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}