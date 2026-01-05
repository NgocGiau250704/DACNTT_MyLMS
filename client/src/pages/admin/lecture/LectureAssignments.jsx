import { useState } from "react";
import { useGetAssignmentsByLectureQuery } from "@/features/api/assignmentApi";
import { useSubmitAssignmentMutation } from "@/features/api/submissionApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AssignmentItem } from "../lecture/AssignmentItem";

export const LectureAssignments = ({ lectureId }) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [localSubmissions, setLocalSubmissions] = useState({});
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);

  const { data, isLoading } = useGetAssignmentsByLectureQuery(lectureId, {
    skip: !lectureId,
  });

  const [submitAssignment, { isLoading: submitting }] =
    useSubmitAssignmentMutation();

  if (isLoading) return <p>Loading assignments...</p>;

  const assignments = data?.assignments || [];

  if (assignments.length === 0) {
    return <p className="text-gray-900">Don't have any assignments</p>;
  }

  const handleFileChange = (assignmentId, file) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [assignmentId]: file,
    }));
  };

  const handleSubmit = async (assignmentId) => {
    const file = selectedFiles[assignmentId];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      setActiveAssignmentId(assignmentId);

      const res = await submitAssignment({
        assignmentId,
        formData,
      }).unwrap();

      setLocalSubmissions((prev) => ({
        ...prev,
        [assignmentId]: res.submission,
      }));

      setSelectedFiles((prev) => ({
        ...prev,
        [assignmentId]: null,
      }));

      toast.success("Submit assignment successfully");
    } catch (err) {
      toast.error("Submit assignment failed");
    } finally {
      setActiveAssignmentId(null);
    }
  };

  const handleDeleteLocal = (assignmentId) => {
    setLocalSubmissions((prev) => {
      const clone = { ...prev };
      delete clone[assignmentId];
      return clone;
    });
  };

  const downloadFile = async (url, filename) => {
    const res = await fetch(url);
    const blob = await res.blob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-lg font-semibold text-gray-700">
        Assignments
      </h3>

      {assignments.map((assignment, index) => (
        <div key={assignment._id}>
          <AssignmentItem
            assignment={assignment}
            downloadFile={downloadFile}
            mode="full"
          />

          {index !== assignments.length - 1 && (
            <div className="relative my-12">
              <div className="border-t border-gray-300" />
              <div className="absolute left-1/2 -top-1.5 w-3 h-3 bg-white border border-gray-400 rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
