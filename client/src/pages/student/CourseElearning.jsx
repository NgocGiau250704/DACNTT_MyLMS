import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CourseDetail = () => {
  const { courseId } = useParams();
  const [lectures, setLectures] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/v1/course/${courseId}/lecture`)
      .then(res => setLectures(res.data.lectures));
  }, [courseId]);

  return (
    <div>
      <h3>Lectures</h3>

      {lectures.map(lec => (
        <p
          key={lec._id}
          style={{ cursor: "pointer", marginLeft: 10 }}
          onClick={() =>
            navigate(`/my-learning/lecture/${lec._id}`)
          }
        >
          {lec.lectureTitle}
        </p>
      ))}
    </div>
  );
};

export default CourseDetail;
