import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import AdminSidebar from "@/pages/admin/AdminSidebar";
import { toast } from "sonner";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { ArrowLeft, BookPlus, Loader2 } from "lucide-react"; // Import Icons
import { Label } from "@/components/ui/label"; // Assuming you have a Label component or standard label

const CreateCourse = () => {
  const navigate = useNavigate();

  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");

  const [createCourse, { data, isLoading, error, isSuccess }] = useCreateCourseMutation();

  const getSelectedCategory = (value) => {
    setCategory(value);
  };

  const createCourseHandler = async () => {
    await createCourse({ courseTitle, category });
  };

  //for displaying toast
  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course created successfully");
      navigate("/courseAdmin");
    }
  }, [isSuccess, error, navigate, data]);

  return (
    <div className="flex min-h-screen bg-gray-50/50">
    
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8 w-full flex justify-center items-start pt-20"> 
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10"> 
          
         
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mb-4">
                <BookPlus size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Create New Course
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Start building your curriculum by providing basic details.
            </p>
          </div>

         
          <div className="space-y-8">
          
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-700">Course Title</Label>
              <Input
                placeholder="e.g., Advanced React Patterns"
                className="h-12 px-4 text-base bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl transition-all text-gray-700"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
            </div>

         
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-700">Category</Label>
              <Select onValueChange={getSelectedCategory}>
                <SelectTrigger className="h-12 w-full px-4 text-base bg-white border-gray-200 focus:ring-indigo-500 rounded-xl text-left font-normal text-gray-900">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>

                <SelectContent className="max-h-[300px] text-gray-700">
                   {[
                    "Next JS", "Data Science", "Frontend Development", 
                    "Backend Development", "Machine Learning", 
                    "Artificial Intelligence", "Cloud Computing", 
                    "Cyber Security", "DevOps"
                   ].map((cat) => (
                      <SelectItem key={cat} value={cat} className="cursor-pointer py-3 hover:bg-gray-50 transition-colors">
                        {cat}
                      </SelectItem>
                   ))}
                </SelectContent>
              </Select>
            </div>

          
            <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => navigate("/courseAdmin")}
                className="flex-1 h-12 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-xl transition-colors"
              >
                <ArrowLeft size={18} className="mr-2"/>
                Cancel
              </Button>
              <Button
                disabled={isLoading}
                onClick={createCourseHandler}
                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm shadow-indigo-200 transition-all hover:shadow-md"
              >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                    </>
                ) : (
                    "Create Course"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCourse;