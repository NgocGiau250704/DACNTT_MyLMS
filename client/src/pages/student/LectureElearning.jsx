import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const LectureDetail = () => {
  const { lectureId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [submissionMap, setSubmissionMap] = useState({});
  const [fileMap, setFileMap] = useState({});

  useEffect(() => {
    axios.get(`/api/v1/assignment/lecture/${lectureId}`)
      .then(res => {
        setAssignments(res.data.assignments);

        res.data.assignments.forEach(a => {
          axios
            .get(`/api/v1/submission/${a._id}/me`)
            .then(r => {
              setSubmissionMap(prev => ({
                ...prev,
                [a._id]: r.data.submission,
              }));
            });
        });
      });
  }, [lectureId]);

  const submit = async (assignmentId) => {
    const formData = new FormData();
    formData.append("file", fileMap[assignmentId]);

    const res = await axios.post(
      `/api/v1/submission/${assignmentId}`,
      formData
    );

    setSubmissionMap(prev => ({
      ...prev,
      [assignmentId]: res.data.submission,
    }));
  };

  return (
    <div>
      <h4>Assignments</h4>

      {assignments.map(a => (
        <div key={a._id} style={{ marginLeft: 20 }}>
          <p>- {a.title}</p>

          {!submissionMap[a._id] ? (
            <>
              <input
                type="file"
                onChange={e =>
                  setFileMap({
                    ...fileMap,
                    [a._id]: e.target.files[0],
                  })
                }
              />
              <button onClick={() => submit(a._id)}>
                Submit
              </button>
            </>
          ) : (
            <p>
              Submited:{" "}
              <a href={submissionMap[a._id].file.fileUrl} target="_blank">
                {submissionMap[a._id].file.originalName}
              </a>
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default LectureDetail;
