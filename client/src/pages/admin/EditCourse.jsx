import React, { useState, useEffect } from "react";
import AdminSidebar from "@/pages/admin/AdminSidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useEditCourseMutation, useGetCourseByIdQuery } from "@/features/api/courseApi";
import { 
  Loader2, 
  ArrowLeft, 
  LayoutList, 
  Video, 
  Image as ImageIcon, 
  Save, 
  Trash2, 
  UploadCloud,
  Layers,
  DollarSign,
  Type
} from "lucide-react";
import axios from "axios";

export default function CreateCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const {
    data: course,
    isLoading: isCourseLoading,
    refetch
  } = useGetCourseByIdQuery(courseId);

  const [editCourse] = useEditCourseMutation();

  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (course?.course) {
      const c = course.course;
      setInput({
        courseTitle: c.courseTitle || "",
        subTitle: c.subTitle || "",
        description: c.description || "",
        category: c.category || "",
        courseLevel:
          c.courseLevel?.charAt(0).toUpperCase() +
            c.courseLevel?.slice(1).toLowerCase() || "",
        coursePrice: c.coursePrice || "",
        courseThumbnail: null,
      });
      setPreviewThumbnail(c.courseThumbnail || "");
      setIsPublished(c.isPublished);
    }
  }, [course]);

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const selectCategory = (value) => {
    setInput({ ...input, category: value });
  };

  const selectCourseLevel = (value) => {
    setInput({ ...input, courseLevel: value });
  };

  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const handleIntroVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    try {
      setIsUploadingVideo(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `https://dacntt-mylms-1.onrender.com/api/v1/course/${courseId}/upload-intro-video`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200) {
        alert("Intro video uploaded successfully!");
        refetch();
      }
    } catch (err) {
      console.error("Upload video error:", err);
      alert("Upload video failed!");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const updateCourseHandler = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("courseTitle", input.courseTitle);
      formData.append("subTitle", input.subTitle);
      formData.append("description", input.description);
      formData.append("category", input.category);
      formData.append("courseLevel", input.courseLevel);
      formData.append("coursePrice", input.coursePrice);
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }
      formData.append("isPublished", isPublished);
      
      await editCourse({ formData, courseId }).unwrap();
      alert("Course updated successfully!");
      // navigate("/courseAdmin");
      await refetch();
      navigate("/courseAdmin");
    } catch (err) {
      console.error("Update course failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublishStatus = async () => {
  try {
    setIsLoading(true);
    const newStatus = !isPublished;

    const formData = new FormData();
    formData.append("isPublished", newStatus);

    await editCourse({
      formData,
      courseId,
    }).unwrap();

    setIsPublished(newStatus);
    alert(`Course is now ${newStatus ? "Published" : "Draft"}`);
  } catch (err) {
    console.error("Update status failed:", err);
    alert("Failed to update course status");
  } finally {
    setIsLoading(false);
  }
};


  if (isCourseLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <button 
                    onClick={() => navigate("/courseAdmin")}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2 transition-colors"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to Courses
                </button>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Course</h1>
                <p className="text-gray-500 mt-1">Update your course details, media, and settings.</p>
            </div>
            
            <div className="flex items-center gap-3">
                 <button
                    onClick={() => navigate(`/${courseId}/add-lecture/`)}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all shadow-sm"
                  >
                    <LayoutList size={18} className="mr-2" />
                    Edit Lectures
                  </button>
                 <button
                    onClick={updateCourseHandler}
                    disabled={isLoading}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save size={18} className="mr-2" />}
                    Save Changes
                  </button>
            </div>
        </div>

       
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
           
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                        <Type className="mr-2 text-blue-500" size={20}/> 
                        Basic Information
                    </h2>
                    
                    <div className="space-y-5">
                       
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                            <input
                                type="text"
                                name="courseTitle"
                                value={input.courseTitle}
                                onChange={changeEventHandler}
                                placeholder="e.g. Advanced React Design Patterns"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-700"
                            />
                        </div>

                      
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                            <input
                                type="text"
                                name="subTitle"
                                value={input.subTitle}
                                onChange={changeEventHandler}
                                placeholder="e.g. Master modern web development in 30 days"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-600"
                            />
                        </div>

                      
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                rows="6"
                                placeholder="Describe what students will learn..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none resize-none text-gray-700"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                        <Layers className="mr-2 text-blue-500" size={20}/> 
                        Course Settings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={input.category}
                                    onChange={(e) => selectCategory(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none appearance-none bg-white text-gray-700"
                                >
                                    <option value="">Select Category</option>
                                    <option value="backend">Backend Development</option>
                                    <option value="frontend">Frontend Development</option>
                                    <option value="fullstack">Fullstack</option>
                                    <option value="devops">DevOps & Cloud</option>
                                </select>
                            </div>
                        </div>

                      
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                            <select
                                name="courseLevel"
                                value={input.courseLevel}
                                onChange={(e) => selectCourseLevel(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none bg-white text-gray-700"
                            >
                                <option value="">Select Level</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                       
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (INR)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
                                <input
                                    type="number"
                                    name="coursePrice"
                                    value={input.coursePrice}
                                    onChange={changeEventHandler}
                                    placeholder="0.00"
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

         
            <div className="space-y-6">
                
              
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Publishing Status</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Current Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {isPublished ? "Published" : "Draft"}
                            </span>
                        </div>
                        <button
                            onClick={togglePublishStatus}
                            className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                                isPublished 
                                ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200" 
                                : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                            }`}
                        >
                            {isPublished ? "Unpublish Course" : "Publish Course"}
                        </button>
                    </div>
                </div>

           
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                     <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <ImageIcon className="mr-2 text-blue-500" size={18}/> Course Thumbnail
                     </h3>
                     <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-4 text-center hover:bg-gray-100 transition-colors relative group">
                        {previewThumbnail ? (
                             <div className="relative w-full h-40 rounded-md overflow-hidden">
                                <img src={previewThumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-sm font-medium">Change Image</p>
                                </div>
                             </div>
                        ) : (
                            <div className="py-8 flex flex-col items-center">
                                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                                    <UploadCloud className="text-blue-500" size={24} />
                                </div>
                                <p className="text-sm text-gray-500">Click to upload thumbnail</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={selectThumbnail}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                     </div>
                </div>

             
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                     <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Video className="mr-2 text-blue-500" size={18}/> Intro Video
                     </h3>
                     
                     <div className="space-y-4">
                         {course?.course?.courseIntroVideoUrl && (
                             <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
                                <video
                                    src={course.course.courseIntroVideoUrl}
                                    controls
                                    className="w-full h-auto max-h-40"
                                />
                             </div>
                         )}

                         <div className="relative">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleIntroVideoUpload}
                                className="hidden"
                                id="video-upload"
                            />
                            <label 
                                htmlFor="video-upload"
                                className={`flex items-center justify-center w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 ${isUploadingVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploadingVideo ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" /> Uploading...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="mr-2 h-4 w-4" /> {course?.course?.courseIntroVideoUrl ? "Replace Video" : "Upload Video"}
                                    </>
                                )}
                            </label>
                         </div>
                     </div>
                </div>

            
                <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
                    <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-xs text-gray-500 mb-4">Once you delete a course, there is no going back. Please be certain.</p>
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                        <Trash2 size={16} className="mr-2" /> Delete Course
                    </button>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}
