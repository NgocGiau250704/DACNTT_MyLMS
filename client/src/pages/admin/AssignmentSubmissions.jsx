import {
  useGetSubmissionsByAssignmentQuery,
  useGradeSubmissionMutation,
} from "@/features/api/submissionApi";

const AssignmentSubmissions = ({ assignmentId }) => {
  const { data, isLoading } =
    useGetSubmissionsByAssignmentQuery(assignmentId);

  const [gradeSubmission] = useGradeSubmissionMutation();

  if (isLoading) return <p>Loading submission...</p>;

  if (!data?.submissions?.length) {
    return <p className="text-gray-500">No students have submitted their assignments yet.</p>;
  }

  return (
    <div className="space-y-4">
      {data.submissions.map((s) => (
        <div
          key={s._id}
          className="bg-white border rounded-lg p-4 shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-semibold">{s.studentId.name}</p>
              <p className="text-sm text-gray-500">
                {s.studentId.email}
              </p>
            </div>

            <span
              className={`text-xs px-3 py-1 rounded-full ${
                s.status === "graded"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {s.status === "graded" ? "Graded" : "Not Graded"}
            </span>
          </div>

          <a
            href={s.file.fileUrl}
            target="_blank"
            className="underline text-sm text-gray-800"
          >
             {s.file.originalName}
          </a>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <input
              type="number"
              defaultValue={s.score ?? ""}
              placeholder="Score"
              className="border rounded px-2 py-1"
              onBlur={(e) =>
                gradeSubmission({
                  submissionId: s._id,
                  score: Number(e.target.value),
                  feedback: s.feedback,
                })
              }
            />

            <input
              type="text"
              defaultValue={s.feedback}
              placeholder="Feedback"
              className="border rounded px-2 py-1 col-span-2"
              onBlur={(e) =>
                gradeSubmission({
                  submissionId: s._id,
                  score: s.score,
                  feedback: e.target.value,
                })
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentSubmissions;
