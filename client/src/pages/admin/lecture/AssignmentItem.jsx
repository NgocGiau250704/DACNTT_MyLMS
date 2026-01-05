import { useRef, useState } from "react";
import {
  useGetMySubmissionQuery,
  useSubmitAssignmentMutation,
} from "@/features/api/submissionApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Download,
} from "lucide-react"; // Import Icons

export const AssignmentItem = ({ assignment, mode = "full" }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [localSubmission, setLocalSubmission] = useState(null);

  const { data, isLoading, isError, error, refetch } = useGetMySubmissionQuery(
    assignment._id
  );

  const [submitAssignment, { isLoading: submitting }] =
    useSubmitAssignmentMutation();

  const submission = localSubmission || data?.submission;
  // const isExpired = new Date(assignment.deadline) < new Date();

  const isExpired = assignment.deadline
    ? new Date(assignment.deadline) < new Date()
    : false;

  const canSubmitLate = assignment.allowLate === true;
  const canSubmit = !isExpired || canSubmitLate;

  const formatDate = (date) =>
    new Date(date).toLocaleString("vi-VN", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const isGraded = submission?.status === "graded";

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await submitAssignment({
        assignmentId: assignment._id,
        formData,
      }).unwrap();

      // Reset logic
      setLocalSubmission(res.submission);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      refetch();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Nộp bài thất bại");
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Google Classroom Style Status Badge
  const getStatusBadge = () => {
    if (isGraded)
      return <span className="text-green-600 font-bold text-sm">Graded</span>;
    if (submission)
      return (
        <span className="text-gray-500 font-medium text-sm">Turned In</span>
      );
    if (isExpired && !canSubmitLate)
      return <span className="text-red-600 font-bold text-sm">Missing</span>;

    if (isExpired && canSubmitLate)
      return (
        <span className="text-orange-500 font-bold text-sm">Late allowed</span>
      );

    return <span className="text-green-600 font-bold text-sm">Assigned</span>;
  };

  if (isLoading) return <div className="p-4 text-gray-500">Loading...</div>;

const downloadFile = async (url, filename) => {
  try {
    if (!url || !filename) {
      alert("Missing link or file name");
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
    alert("Unable to download the file.");
  }
};


 

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full animate-in fade-in duration-500">
      {/* LEFT COLUMN: INSTRUCTIONS & MATERIALS */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-normal text-blue-600">
              {assignment.title}
            </h2>
            <div className="text-gray-500 text-sm flex gap-2">
              <span>{assignment.teacherName || "Instructor"}</span>
              <span>•</span>
              <span>
                {assignment.createdAt
                  ? formatDate(assignment.createdAt)
                  : "Recently"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <p className="text-sm font-medium text-gray-700">
            {assignment.points ? `${assignment.points} points` : "10 points"}
          </p>
          {assignment.deadline && (
            <p
              className={`text-sm font-medium ${
                isExpired && !submission ? "text-red-600" : "text-gray-500"
              }`}
            >
              Due {formatDate(assignment.deadline)}
            </p>
          )}
        </div>

        {/* Description */}
        {assignment.description && (
          <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
            {assignment.description}
          </div>
        )}

        {/* Attachment Material Card */}
        {mode === "full" && assignment.attachment?.fileUrl && (
          <div className="mt-6">
            <div
              className="group flex items-center border rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 hover:shadow-sm transition-all w-fit pr-4"
              // onClick={() =>
              //   downloadFile(
              //     assignment.attachment.fileUrl,
              //     assignment.attachment.originalName
              //   )
              // }
              onClick={() =>
                downloadFile(
  assignment.attachment.downloadUrl || assignment.attachment.fileUrl,
  assignment.attachment.originalName
)


              }
            >
              <div className="h-16 w-16 bg-gray-100 flex items-center justify-center border-r">
                <Download className="text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600 group-hover:underline truncate max-w-[200px]">
                  {assignment.attachment.originalName}
                </p>
                <p className="text-xs text-gray-500">Material</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: "YOUR WORK" CARD (The Google Classroom Signature) */}
      <div className="w-full md:w-80 shrink-0">
        <Card className="shadow-md border-0 rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-center py-3 px-4 bg-white border-b">
            <CardTitle className="text-lg font-normal text-gray-800">
              Your work
            </CardTitle>
            {getStatusBadge()}
          </CardHeader>
          <CardContent className="p-4 space-y-4 bg-white">
            {/* 1. Display Submitted File or Selected File */}
            {submission ? (
              <div className="border rounded-md p-3 flex items-center gap-3 relative group">
                <div className="bg-red-100 p-2 rounded text-red-600">
                  <FileText size={18} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p
                    className="text-sm font-medium text-blue-600 truncate cursor-pointer hover:underline"
                    // onClick={() =>
                    //   downloadFile(
                    //     submission.file.fileUrl,
                    //     submission.file.originalName
                    //   )
                    // }
                   onClick={() =>
downloadFile(
  submission.file.downloadUrl || submission.file.fileUrl,
  submission.file.originalName
)

}

                      

                  >
                    {submission.file.originalName}
                  </p>
                  <p className="text-xs text-gray-400">PDF/File</p>
                </div>
                {/* Grade Display */}
                {isGraded && (
                  <div className="absolute right-2 top-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                    {submission.score}/100
                  </div>
                )}
              </div>
            ) : selectedFile ? (
              <div className="border rounded-md p-3 flex items-center gap-3 relative bg-gray-50">
                <div className="bg-gray-200 p-2 rounded text-gray-600">
                  <FileText size={18} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-400">Ready to submit</p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : null}

            {/* 2. Action Buttons */}
            {!isGraded &&
              canSubmit && ( //mới sửa từ  !isExpired sang submit
                <div className="space-y-3 pt-2">
                  {/* Hidden File Input + Custom Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {!submission && !selectedFile && (
                    <Button
                      variant="outline"
                      className="w-full text-blue-600 border-gray-300 hover:bg-blue-50 h-10 shadow-sm"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <span className="mr-2 text-xl pb-1">+</span> Add or create
                    </Button>
                  )}

                  {/* Submit Button */}
                  {isExpired && canSubmitLate && (
                    <div className="text-xs text-orange-600 text-center font-medium">
                      This is a late submission
                    </div>
                  )}

                  <Button
                    className={`w-full h-10 font-medium shadow-sm ${
                      submission
                        ? "bg-white text-gray-700 border hover:bg-gray-50"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                    disabled={
                      submitting ||
                      (!selectedFile && !submission) ||
                      (isExpired && !canSubmitLate)
                    }
                    onClick={() => {
                      if (!selectedFile) {
                        fileInputRef.current.click(); // chọn file
                      } else {
                        handleSubmit(); // nộp bài
                      }
                    }}
                  >
                    {submitting
                      ? "Processing..."
                      : submission
                      ? selectedFile
                        ? "Turn in"
                        : "Resubmit"
                      : "Turn in"}
                  </Button>

                  {submission && (
                    <p className="text-xs text-center text-gray-500">
                      Unsubmit to add or change attachments
                    </p>
                  )}
                </div>
              )}

            {/* Feedback Section */}
            {submission?.feedback && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-1">
                  <CheckCircle size={14} className="text-green-600" /> Private
                  comments
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic">
                  "{submission.feedback}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssignmentItem;
