
import { useParams } from "react-router-dom";
import {
  useGetSubmissionsByAssignmentQuery,
  useGradeSubmissionMutation,
} from "@/features/api/submissionApi";
import AdminSidebar from "@/pages/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import {
  Download,
  FileText,
  CheckCircle,
  Clock,
  Award,
  AlertCircle,
  Search,
  ExternalLink,
  Save, // Added Save icon
} from "lucide-react";

const GradingPage = () => {
  const { assignmentId } = useParams();
  const { data, isLoading } = useGetSubmissionsByAssignmentQuery(assignmentId);
  const [gradeSubmission, { isLoading: isSaving }] = useGradeSubmissionMutation();

  const [scores, setScores] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [activePreviewId, setActivePreviewId] = useState(null);

  // --- HELPER FUNCTIONS ---
const [previewCache, setPreviewCache] = useState({}); 
// { [submissionId]: { url: string, mime: string } }

const guessMime = (name = "") => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["jpg","jpeg"].includes(ext)) return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  if (ext === "pdf") return "application/pdf";
  if (ext === "txt") return "text/plain";
  return ""; // để mặc định
};

  const getFileType = (url, originalName) => {
    if (!url && !originalName) return "unknown";
    const nameToCheck = originalName || url.split(/[?#]/)[0];
    const extension = nameToCheck.split(".").pop().toLowerCase();
    
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "image";
    if (extension === "pdf") return "pdf";
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension)) return "office";
    if (["py", "js", "html", "css", "txt", "cpp", "java", "json"].includes(extension)) return "code";
    return "unknown";
  };

const getPreviewUrl = (url) => {
  if (!url) return "";
  let u = url.split("?")[0];

  // Cloudinary raw: ép hiển thị inline để viewer đọc (đỡ bị attachment/download)
  if (u.includes("/raw/upload/")) {
    u = u.replace("/raw/upload/", "/raw/upload/fl_inline/");
  }

  return u;
};
const ensurePreview = async (s) => {
  try {
    if (previewCache[s._id]?.url) return;

    
    const raw = s.file.fileUrl || s.file.downloadUrl;
    const url = getPreviewUrl(raw);
    if (!url) return toast.error("There is no file preview link.");

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);

    setPreviewCache(prev => ({
      ...prev,
      [s._id]: { url: objUrl }
    }));
  } catch (e) {
    console.error("Preview load failed:", e);
    toast.error("Unable to load data for preview.");
  }
};

const toInlineCloudinary = (url = "") => {
  if (!url) return "";
  const clean = url.split("?")[0];

  // Ép Cloudinary hiển thị inline (tránh attachment)
  if (
    clean.includes("res.cloudinary.com") &&
    clean.includes("/upload/") &&
    !clean.includes("/upload/fl_inline/")
  ) {
    return clean.replace("/upload/", "/upload/fl_inline/");
  }

  return clean;
};

const getDownloadUrl = (url) => {
  if (!url) return "";
  return url; 
};




 const downloadFile = async (url, filename) => {
  try {
    if (!url) {
      toast.error("No download link for the file could be found.");
      return;
    }

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const contentType = res.headers.get("content-type") || "";
    
    if (contentType.includes("text/html")) {
      throw new Error("The URL returns HTML, not a file.");
    }

    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Download failed", error);
    toast.error("File download failed (invalid link or returned HTML).");
    
    if (url) window.open(url, "_blank");
  }
};


  const handleSaveGrade = async (submissionId) => {
    try {
      // Use state value if changed, otherwise fallback to existing value in DB, otherwise empty
      const scoreToSave = scores[submissionId];
      const feedbackToSave = feedbacks[submissionId];

      await gradeSubmission({
        submissionId,
        score: scoreToSave,
        feedback: feedbackToSave,
      }).unwrap();
      toast.success("Grade saved successfully!");
    } catch (error) {
      toast.error("Failed to save grade.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="ml-64 flex-1 p-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p>Loading submissions...</p>
          </div>
        </main>
      </div>
    );
  }

  const submissions = data?.submissions || [];
  const total = submissions.length;
  const gradedCount = submissions.filter((s) => s.status === "graded").length;
  const pendingCount = total - gradedCount;

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <AdminSidebar />

      <main className="ml-64 flex-1 p-8 mt-16 text-gray-800">
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Award className="text-blue-600" size={32} />
            Grading Dashboard
          </h2>
          <p className="text-gray-500 mt-2">
            Review and grade student submissions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Graded</p>
                <p className="text-2xl font-bold text-gray-900">{gradedCount}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

    
        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
            <AlertCircle size={32} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No submissions found
            </h3>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((s) => {
              const fileType = getFileType(s.file.fileUrl, s.file.originalName);
              const previewUrl = getPreviewUrl(s.file.fileUrl);
              const isGraded = s.status === "graded";
              const deadline = s.assignmentId?.deadline
  ? new Date(s.assignmentId.deadline)
  : null;

const isLate =
  deadline && s.submittedAt
    ? new Date(s.submittedAt) > deadline
    : false;

              // Get current values from state OR fallback to DB values
              const currentScore = scores[s._id] !== undefined ? scores[s._id] : (s.score ?? "");
              const currentFeedback = feedbacks[s._id] !== undefined ? feedbacks[s._id] : (s.feedback ?? "");

              return (
                <div
                  key={s._id}
                  className={`bg-white border rounded-xl shadow-sm overflow-hidden ${
                    isGraded ? "border-green-100" : "border-gray-200"
                  }`}
                >
                  
                  <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {s.studentId?.name?.charAt(0).toUpperCase() || "S"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {s.studentId?.name || "Unknown Student"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {s.studentId?.email}
                        </p>
                        <p className="text-xs text-gray-400">
                            Submit time:{" "}
                            {s.submittedAt
                              ? new Date(s.submittedAt).toLocaleString("vi-VN")
                              : "Not submitted yet"}
                          </p>

                          {isLate && (
                            <p className="text-xs text-red-600 font-semibold">
                              
                          This is a late submission
                            </p>
                          )}

                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        isGraded
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {isGraded ? "Graded" : "Pending"}
                    </span>
                  </div>

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                   
                    <div className="lg:col-span-7">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                        Submitted Work
                      </h4>

                     
                      <div
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                          activePreviewId === s._id
                            ? "bg-blue-100 border-blue-300"
                            : "bg-blue-50 hover:bg-blue-100 border-blue-100"
                        }`}
                    onClick={async () => {
                      const raw = s.file.fileUrl || s.file.downloadUrl;
                      const clean = raw?.split(/[?#]/)[0];
                      const ft = getFileType(clean, s.file.originalName);

                      if (ft === "code") {
                        downloadFile(s.file.downloadUrl || s.file.fileUrl, s.file.originalName);
                        return;
                      }

                      const next = activePreviewId === s._id ? null : s._id;
                      setActivePreviewId(next);

                    }}


                      >
                        <div className="flex items-center gap-3">
                          <FileText className="text-blue-600" size={20} />
                          <span className="font-medium text-sm text-blue-700">
                            {activePreviewId === s._id
                              ? "Đóng bản xem trước"
                              : `Xem bài nộp trực tiếp (${fileType.toUpperCase()})`}
                          </span>
                        </div>
                        <Search size={16} className="text-blue-400" />
                      </div>

                      {/* ACTUAL PREVIEW AREA */}
                      {activePreviewId === s._id && (
                        <div className="mt-4 border rounded-lg overflow-hidden bg-white shadow-inner animate-in fade-in zoom-in duration-200">
                          <div className="bg-gray-800 text-white p-2 flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold ml-2">Preview Mode</span>
                            <div className="flex gap-3">
                              <a
                                href={s.file.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-300 hover:text-white"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </div>

                          <div className="bg-gray-100 min-h-[400px] flex items-center justify-center relative">
{(() => {
  const raw = s.file.fileUrl || s.file.downloadUrl;
  const clean = raw?.split(/[?#]/)[0];
  const ft = getFileType(clean, s.file.originalName);
  const inlineUrl = toInlineCloudinary(raw);

  if (!raw) return <div className="text-gray-500">Don't have link file.</div>;

  if (ft === "image") {
    return (
      <img
        src={raw}
        alt="Preview"
        className="max-w-full h-auto"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

 if (ft === "pdf") {
  const googleViewer =
    `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(raw)}`;

  return (
    <iframe
      src={googleViewer}
      className="w-full h-[600px] border-none"
      title="PDF Preview"
    />
  );
}


  if (ft === "office") {
  return (
    <div className="p-10 text-center">
      <p className="text-gray-600 mb-4">
       Word files are not supported for inline preview.
      </p>
      <Button onClick={() => downloadFile(raw, s.file.originalName)}>
        <Download size={16} className="mr-2" /> Dowload File
      </Button>
    </div>
  );
}


  return (
    <div className="p-10 text-center">
      <p className="text-gray-500 mb-4 font-medium">Preview is not supported.</p>
      <Button onClick={() => downloadFile(raw, s.file.originalName)}>
        <Download size={16} className="mr-2" /> Dowload File
      </Button>
    </div>
  );
})()}





                          </div>
                        </div>
                      )}

                      {/* FOOTER FILE INFO */}
                      <div className="mt-4 flex items-center gap-2 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-500 truncate flex-1">
                          {s.file.originalName}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600"
                          onClick={() =>
 downloadFile(s.file.downloadUrl || s.file.fileUrl, s.file.originalName)

}

                        >
                          <Download size={16} />
                        </Button>
                      </div>
                    </div>

                    {/* --- RIGHT COLUMN (5/12): GRADING FORM --- */}
                    <div className="lg:col-span-5 bg-gray-50 rounded-xl p-5 border border-gray-100 h-full">
                       <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center justify-between">
                         <span>Grading & Feedback</span>
                         {isGraded && (
                           <span className="text-green-600 text-[10px] bg-green-50 px-2 py-0.5 rounded border border-green-100">
                             Saved: {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "Recently"}
                           </span>
                         )}
                       </h4>

                       <div className="space-y-5">
                          {/* Score Input */}
                          <div>
                              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Score (0-100)</label>
                              <input 
                                  type="number" 
                                  min="0"
                                  max="100"
                                  value={currentScore}
                                  onChange={(e) => setScores({ ...scores, [s._id]: e.target.value })}
                                  placeholder="Enter score"
                                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                              />
                          </div>

                          {/* Feedback Input */}
                          <div>
                              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Feedback</label>
                              <textarea 
                                  rows="4"
                                  value={currentFeedback}
                                  onChange={(e) => setFeedbacks({ ...feedbacks, [s._id]: e.target.value })}
                                  placeholder="Write your feedback here..."
                                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                              />
                          </div>

                          {/* Save Button */}
                          <div className="pt-2 flex justify-end">
                              <Button 
                                onClick={() => handleSaveGrade(s._id)}
                                disabled={isSaving}
                                className={`w-full sm:w-auto ${isGraded ? "bg-gray-800 hover:bg-gray-900" : "bg-blue-600 hover:bg-blue-700"} text-white transition-all`}
                              >
                                <Save size={16} className="mr-2"/>
                                {isSaving ? "Saving..." : isGraded ? "Update Grade" : "Save Grade"}
                              </Button>
                          </div>
                       </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default GradingPage;