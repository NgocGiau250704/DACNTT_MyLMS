import { useEffect, useState } from "react";
import axios from "axios";
import AssignmentItem from "../admin/lecture/AssignmentItem";
import { BookOpen, ChevronDown, ChevronUp, ClipboardList, Folder } from "lucide-react";

const MyLearning = () => {
  const [courses, setCourses] = useState([]);
  const [openCourseId, setOpenCourseId] = useState(null);
  const [openLectureId, setOpenLectureId] = useState(null);
  const [lecturesMap, setLecturesMap] = useState({});
  const [assignmentsMap, setAssignmentsMap] = useState({});
  const [openAssignmentId, setOpenAssignmentId] = useState(null);

  useEffect(() => {
    axios.get("/api/v1/user/my-learning").then((res) => {
      setCourses(res.data.courses || []);
    });
  }, []);

  const handleClickCourse = async (courseId) => {
    if (openCourseId === courseId) {
      setOpenCourseId(null); setOpenLectureId(null); return;
    }
    setOpenCourseId(courseId); setOpenLectureId(null);

    if (!lecturesMap[courseId]) {
      const res = await axios.get(`/api/v1/course/${courseId}/lecture`);
      setLecturesMap((prev) => ({ ...prev, [courseId]: res.data.lectures || [] }));
    }
  };

  const handleClickLecture = async (lectureId) => {
    if (openLectureId === lectureId) {
      setOpenLectureId(null); setOpenAssignmentId(null); return;
    }
    setOpenLectureId(lectureId); setOpenAssignmentId(null);

    if (!assignmentsMap[lectureId]) {
      const res = await axios.get(`/api/v1/assignment/lecture/${lectureId}`);
      setAssignmentsMap((prev) => ({ ...prev, [lectureId]: res.data.assignments || [] }));
    }
  };

  
  return (
    <div className="max-w-6xl mx-auto mt-24 px-4 pb-20">
      <h1 className="text-3xl font-normal text-gray-800 mb-8 flex items-center gap-3">
        <Folder className="text-blue-600" /> Enrolled Courses
      </h1>

      {courses.map((course) => (
        <div key={course._id} className="mb-8 border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
          
          {/* COURSE HEADER - Like Google Classroom Header */}
          <div
            className="cursor-pointer group relative"
            onClick={() => handleClickCourse(course._id)}
          >
            <div className="h-2 bg-blue-600 w-full"></div> {/* Decorative Stripe */}
            <div className="px-6 py-5 flex justify-between items-center bg-white">
                <div>
                    <h2 className="text-xl font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                        {course.courseTitle}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Section 1 • Fall 2025</p>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                    {openCourseId === course._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>
          </div>

          {openCourseId === course._id && (
            <div className="border-t border-gray-100 bg-gray-50/50">
              {lecturesMap[course._id]?.map((lec) => (
                <div key={lec._id} className="border-b border-gray-200 last:border-0">
                  
                  
                  <div
                    className="px-6 py-4 cursor-pointer flex items-center hover:bg-gray-100 transition-colors"
                    onClick={() => handleClickLecture(lec._id)}
                  >
                    <BookOpen size={18} className="text-gray-400 mr-3" />
                    <p className="font-medium text-gray-800 flex-1">{lec.lectureTitle}</p>
                    {openLectureId === lec._id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>

                
                  {openLectureId === lec._id && (
                    <div className="px-6 pb-6 bg-white pl-12 pt-2">
                      {assignmentsMap[lec._id]?.map((a) => (
                        <div key={a._id} className="group mb-4 last:mb-0">
                          
                         
                          <div 
                            className={`flex items-center gap-4 py-3 cursor-pointer rounded-lg px-2 transition-all ${openAssignmentId === a._id ? '' : 'hover:bg-gray-50'}`}
                            onClick={() => setOpenAssignmentId(openAssignmentId === a._id ? null : a._id)}
                          >
                             <div className={`p-2 rounded-full ${openAssignmentId === a._id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                                <ClipboardList size={20} />
                             </div>
                             <div className="flex-1">
                                <p className="text-gray-900 font-medium text-sm md:text-base">{a.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Posted {new Date().toLocaleDateString()}
                                </p>
                             </div>
                             {a.deadline && (
                                <span className="text-xs text-gray-500 hidden sm:block">
                                    Due {new Date(a.deadline).toLocaleDateString()}
                                </span>
                             )}
                          </div>

                          {/* EXPANDED ASSIGNMENT DETAIL */}
                          {openAssignmentId === a._id && (
                            <div className="mt-2 pl-2 border-l-2 border-blue-200 ml-5">
                              <AssignmentItem assignment={a} />
                            </div>
                          )}
                        </div>
                      ))}

                      {assignmentsMap[lec._id]?.length === 0 && (
                        <div className="text-sm text-gray-400 italic py-2 pl-2">No assignments for this lecture.</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyLearning;