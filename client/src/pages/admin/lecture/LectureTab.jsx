import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { toast } from "sonner";
import {
  useEditLectureMutation,
  useGetLectureByIdQuery,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";

import {
  Loader2,
  Video,
  FileText,
  Trash2,
  Save,
  Plus,
  Calendar,
  MonitorPlay,
  LayoutList,
  Pencil, // Added Pencil icon
  X, // Added X icon for cancel

} from "lucide-react";

import {
  useCreateAssignmentMutation,
  useGetAssignmentsByLectureQuery,
  useUploadAssignmentFileMutation,
  useDeleteAssignmentMutation,
  useUpdateAssignmentMutation,
} from "@/features/api/assignmentApi";

const LectureTab = () => {
  const [isFree, setIsFree] = useState(false);
  const [uploadVideoInfo, setUpLoadVideoInfo] = useState(null);
  const [lectureTitle, setLectureTitle] = useState("");
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  const params = useParams();
  const { courseId, lectureId } = params;
  
  // Assignment States
  const [slideUrl, setSlideUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [allowLate, setAllowLate] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null); // Tracks edit mode

  // API Hooks
  const { data: lectureData } = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  const { data: assignmentData } = useGetAssignmentsByLectureQuery(
    lecture?._id,
    { skip: !lecture?._id }
  );

  const [createAssignment, { isLoading: assignmentCreating }] = useCreateAssignmentMutation();
  const [uploadAssignmentFile, { isLoading: uploadLoading }] = useUploadAssignmentFileMutation();
  const [deleteAssignment, { isLoading: deleteLoading }] = useDeleteAssignmentMutation();
  const [updateAssignment, { isLoading: updatingAssignment }] = useUpdateAssignmentMutation();
  
  const assignments = assignmentData?.assignments || [];

  // Lecture Mutations
  const [editLecture, { isLoading, isSuccess, error }] = useEditLectureMutation();
  const [removeLecture, { isLoading: removeLoading, isSuccess: removeSuccess, data: removeData }] = useRemoveLectureMutation();

  
  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isFree);
      setUpLoadVideoInfo({
        videoUrl: lecture.videoUrl || null,
        publicId: lecture.publicId || null,
      });
      setSlideUrl(lecture.slideUrl || "");
    }
  }, [lecture]);

  useEffect(() => {
    if (isSuccess) toast.success("Lecture updated successfully");
    if (error) toast.error(error.data.message);
  }, [isSuccess, error]);

  useEffect(() => {
    if (removeSuccess) toast.success(removeData.message);
  }, [removeSuccess, removeData]);

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("video", file);
    setMediaProgress(true);
    try {
      const res = await axios.post(
        `http://localhost:8080/api/v1/course/lecture/${lectureId}/upload-video`,
        formData,
        {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
        }
      );
      setUpLoadVideoInfo({
        videoUrl: res.data.videoUrl,
        publicId: res.data.publicId,
      });
      setBtnDisable(false);
      toast.success("Video uploaded!");
    } catch (err) {
      console.log(err);
      toast.error("Upload failed");
    } finally {
      setMediaProgress(false);
    }
  };

  const editLectureHandler = async () => {
    await editLecture({
      lectureTitle,
      videoInfo: uploadVideoInfo,
      isFree: isFree,
      courseId,
      lectureId,
      slideUrl,
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  };


  const assignmentFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await uploadAssignmentFile(formData).unwrap();
      setAttachment({
        fileUrl: res.fileUrl,
        downloadUrl: res.downloadUrl,
        publicId: res.publicId,
        originalName: res.originalName,
      });
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error("File upload failed");
    }
    
    // Scroll to top of form smoothly
    document.getElementById("assignment-form").scrollIntoView({ behavior: "smooth" });
  };

  // Reset form to default state
  const resetAssignmentForm = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setAttachment(null);
    setAllowLate(false);
    setEditingAssignmentId(null);
  };

  // Populate form for editing
  const handleEditClick = (assignment) => {
    setEditingAssignmentId(assignment._id);
    setTitle(assignment.title);
    setDescription(assignment.description);
    setAllowLate(assignment.allowLate);
    setAttachment(assignment.attachment);

    // Format date for datetime-local input (YYYY-MM-DDThh:mm)
    if (assignment.deadline) {
      const date = new Date(assignment.deadline);
      const formatted = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDeadline(formatted);
    }
    
    // Scroll to top of form smoothly
    document.getElementById("assignment-form").scrollIntoView({ behavior: "smooth" });
  };
const downloadFile = async (url, filename) => {
  try {
    if (!url || !filename) {
      alert("Thiếu link hoặc tên file");
      return;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename; 
    document.body.appendChild(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error(err);
    alert("Không tải được file");
  }
};

  // Handle Create OR Update
  const handleAssignmentSubmit = async () => {
    if (!title || !deadline) {
      toast.error("Title and deadline are required");
      return;
    }

    try {
      if (editingAssignmentId) {
        // --- UPDATE MODE ---
        await updateAssignment({
          assignmentId: editingAssignmentId,
          title,
          description,
          deadline: new Date(deadline),
          allowLate,
          attachment, // Pass new or existing attachment
        }).unwrap();
        toast.success("Assignment updated successfully");
      } else {
        // --- CREATE MODE ---
        await createAssignment({
          lectureId,
          title,
          description,
          deadline: new Date(deadline),
          allowLate,
          attachment,
        }).unwrap();
        toast.success("Assignment created successfully");
      }
      resetAssignmentForm();
    } catch (err) {
      toast.error(editingAssignmentId ? "Failed to update assignment" : "Failed to create assignment");
    }
  };

  const isAssignmentLoading = assignmentCreating || updatingAssignment || uploadLoading;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      

      <Card className="shadow-md border-t-4 border-t-blue-600 bg-white">
        <CardHeader className="flex flex-row items-start justify-between border-b pb-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-gray-800">

              <MonitorPlay className="text-blue-600" size={24} />
              Edit Lecture Content

            </CardTitle>
            <CardDescription className="text-gray-500">
              Manage your video content, slides, and basic details here.
            </CardDescription>
          </div>
          <Button
            disabled={removeLoading}
            variant="destructive"
            size="sm"
            onClick={removeLectureHandler}
            className="shadow-sm"
          >

            {removeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}

            Remove Lecture
          </Button>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">

           <div className="space-y-2">

            <Label className="text-base font-semibold text-gray-700">Lecture Title</Label>
            <Input
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              type="text"
              className="text-lg py-5 text-gray-600"
              placeholder="Ex. Introduction to Javascript"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  Video Content <span className="text-red-500 text-xs">(Required)</span>
                </Label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={fileChangeHandler}
                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-gray-600"
                  />
                  {mediaProgress && (
                    <div className="w-full mt-4 space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-center text-gray-500">{uploadProgress}% uploaded</p>
                    </div>
                  )}
                </div>
              </div>
              {uploadVideoInfo?.videoUrl && (
                <div className="rounded-xl overflow-hidden shadow-sm border bg-black">
                  <video src={uploadVideoInfo.videoUrl} controls className="w-full aspect-video" />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-700">Google Slide (Embed URL)</Label>
                <Input
                  type="text"
                  placeholder="Paste embed link here..."
                  className="text-gray-600"
                  value={slideUrl}
                  onChange={(e) => setSlideUrl(e.target.value)}
                />
                {slideUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border shadow-sm h-48">
                    <iframe src={slideUrl} className="w-full h-full" allowFullScreen />
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Free Preview</Label>
                  <p className="text-sm text-gray-500">Allow users to watch without purchasing</p>
                </div>
                <div
                  onClick={() => setIsFree(!isFree)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isFree ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${isFree ? "translate-x-7" : "translate-x-0"}`} />
                </div>
              </div>

            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-700">Google Slide (Embed URL)</Label>
                <Input
                  type="text"
                  placeholder="Paste embed link here..."
                  className="text-gray-600"
                  value={slideUrl}
                  onChange={(e) => setSlideUrl(e.target.value)}
                />
                {slideUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border shadow-sm h-48">
                    <iframe src={slideUrl} className="w-full h-full" allowFullScreen />
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Free Preview</Label>
                  <p className="text-sm text-gray-500">Allow users to watch without purchasing</p>
                </div>
                <div
                  onClick={() => setIsFree(!isFree)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isFree ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${isFree ? "translate-x-7" : "translate-x-0"}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button disabled={isLoading} onClick={editLectureHandler} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Update Lecture</>}
            </Button>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button disabled={isLoading} onClick={editLectureHandler} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Update Lecture</>}
            </Button>
          </div>
        </CardContent>
      </Card>


      <Card className="shadow-md border-t-4 border-t-indigo-600 bg-white" id="assignment-form">

        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <LayoutList className="text-indigo-600" size={24} />
            Class Assignments
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create tasks, homework, or projects for your students.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">

        
          <div className={`bg-white p-6 rounded-xl border shadow-sm space-y-4 transition-all duration-300 ${editingAssignmentId ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className={`font-semibold flex items-center gap-2 ${editingAssignmentId ? 'text-indigo-700' : 'text-gray-700'}`}>
                {editingAssignmentId ? (
                  <><Pencil className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full p-0.5" /> Edit Assignment</>
                ) : (
                  <><Plus className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full p-0.5" /> Add New Assignment</>
                )}
              </h3>
              
             
              {editingAssignmentId && (
                <Button variant="ghost" size="sm" onClick={resetAssignmentForm} className="text-gray-500 hover:text-red-500 h-8">
                  <X className="w-4 h-4 mr-1"/> Cancel Edit
                </Button>
              )}

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 text-gray-600">
                <Label>Assignment Title</Label>
                <Input
                  value={title}
                  className="text-gray-600"
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Final Project Submission"
                />
              </div>

              <div className="space-y-2 text-gray-600">
                <Label>Due Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="datetime-local"
                    value={deadline}
                    className="pl-10 text-gray-600"
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border flex items-center justify-between text-gray-600">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Allow Late Submission</Label>
                  <p className="text-sm text-gray-500">Students can submit after the deadline</p>
                </div>
                <div
                  onClick={() => setAllowLate(!allowLate)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${allowLate ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${allowLate ? "translate-x-7" : "translate-x-0"}`} />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2 text-gray-600">
                <Label>Description</Label>
                <Input
                  value={description}
                  className="text-gray-600"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief instructions for students..."
                />
              </div>

              <div className="md:col-span-2 space-y-2 text-gray-600">
                <Label>Attach Resource (PDF/Doc)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    onChange={assignmentFileHandler}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 text-gray-600"
                  />
                  {attachment && (
                    <span className="text-sm text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                      <FileText className="w-3 h-3" /> {attachment.originalName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {editingAssignmentId && (
                 <Button variant="outline" onClick={resetAssignmentForm}>Cancel</Button>
              )}
              <Button
                onClick={handleAssignmentSubmit}
                disabled={isAssignmentLoading}
                className={editingAssignmentId ? "bg-orange-600 hover:bg-orange-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}
              >
                {isAssignmentLoading ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : editingAssignmentId ? (
                  <Save className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {editingAssignmentId ? "Update Assignment" : "Create Assignment"}
              </Button>
            </div>
          </div>

        
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 pl-1">Existing Assignments</h3>


            {assignments.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No assignments created yet.</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">

              {assignments.map((a) => (
                <div
                  key={a._id}
                  className={`group flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-white border rounded-xl hover:shadow-md transition-all duration-200 ${editingAssignmentId === a._id ? 'border-orange-300 bg-orange-50 ring-1 ring-orange-200' : ''}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${editingAssignmentId === a._id ? 'bg-orange-500' : 'bg-indigo-500'}`}></span>
                      <p className="font-bold text-gray-800 text-lg">{a.title}</p>
                      {editingAssignmentId === a._id && <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">Editing</span>}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2 pl-4">
                      <Calendar className="w-3 h-3" /> Due: <span className="font-medium text-gray-700">{new Date(a.deadline).toLocaleString()}</span>
                    </p>
                    {a.attachment && (
                      <button
  onClick={() =>
    downloadFile(
      a.attachment.downloadUrl || a.attachment.fileUrl,
      a.attachment.originalName
    )
  }
  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-md mt-2 ml-4"
>
  <FileText className="w-3 h-3" /> {a.attachment.originalName}
</button>

                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                  
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                      onClick={() => handleEditClick(a)}
                      disabled={deleteLoading || editingAssignmentId === a._id}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                  
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => deleteAssignment(a._id)}
                      disabled={deleteLoading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LectureTab;