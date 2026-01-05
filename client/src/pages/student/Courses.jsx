import React, { useState, useEffect } from "react";
import Course from "./Course";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { useSearchParams } from "react-router-dom";

const Courses = ({ title = "Our Courses", enrolledCourses = null }) => {
  const isProfile = Array.isArray(enrolledCourses);
  const { data, isLoading, isError } = useGetPublishedCourseQuery();
  const [searchParams] = useSearchParams();
  const [searchCourses, setSearchCourses] = useState([]);
const [searchLoading, setSearchLoading] = useState(false);
const keyword = searchParams.get("q");
 const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const isFiltering = selectedInstructor || priceRange !== "all";

  const coursesToShow = isProfile
  ? enrolledCourses
  : isFiltering
  ? filteredCourses
  : keyword
  ? searchCourses
  : data?.courses || [];


  
useEffect(() => {
  fetch("http://localhost:8080/api/v1/user/instructors")
    .then(res => res.json())
    .then(data => setInstructors(data.instructors || []));
}, []);

useEffect(() => {
  const params = new URLSearchParams();

  if (selectedInstructor) params.append("instructorId", selectedInstructor);

  if (priceRange !== "all") {
    const [min, max] = priceRange.split("-");
    params.append("minPrice", min);
    params.append("maxPrice", max);
  }

  fetch(`http://localhost:8080/api/v1/course/filter?${params.toString()}`)
    .then(res => res.json())
    .then(data => setFilteredCourses(data.courses || []));
}, [selectedInstructor, priceRange]);

useEffect(() => {
  if (!keyword) return;

  const fetchSearchCourses = async () => {
    try {
      setSearchLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/v1/course/search?q=${keyword}`
      );
      const data = await res.json();
      setSearchCourses(data.courses || []);
    } catch (error) {
      console.error("Search courses error:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  fetchSearchCourses();
}, [keyword]);


  if (!isProfile && isError)
    return <h1>Some error occurred while fetching courses.</h1>;
  console.log(data);

  if (isError) return <h1>Some error occurred while fetching course. </h1>;

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto p-6">
        
        <h2 className="font-bold text-3xl text-center mb-10 text-gray-900">
          {title}
        </h2>
        <div className="flex gap-4 justify-center mb-8">

<select
  className="
    px-4 py-2 rounded-lg border
    bg-blue-50 text-blue-700 border-blue-300
    focus:outline-none focus:ring-2 focus:ring-blue-400
    hover:bg-blue-100
    transition
  "
  value={selectedInstructor}
  onChange={(e) => setSelectedInstructor(e.target.value)}
>
  <option value="">All Instructors</option>
  {instructors.map((ins) => (
    <option key={ins._id} value={ins._id}>
      {ins.name}
    </option>
  ))}
</select>



<select
  className="
    px-4 py-2 rounded-lg border
    bg-emerald-50 text-emerald-700 border-emerald-300
    focus:outline-none focus:ring-2 focus:ring-emerald-400
    hover:bg-emerald-100
    transition
  "
  value={priceRange}
  onChange={(e) => setPriceRange(e.target.value)}
>
  <option value="all">All Prices</option>
  <option value="0-500000">0 – 500.000</option>
  <option value="500000-1000000">500.000 – 1.000.000</option>
  <option value="1000000-99999999">Above 1.000.000</option>
</select>

</div>

        {keyword && (
  <p className="text-center text-gray-500 mb-6">
    Search results for “{keyword}”
  </p>
)}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <CourseSkeleton key={i} />
              ))
            : data?.courses?.length > 0 &&
              data.courses.map((course, i) => (
                <Course key={i} course={course} />
              ))} */}
          {(isLoading || searchLoading)
  ? Array.from({ length: 8 }).map((_, i) => (
      <CourseSkeleton key={i} />
    ))
  : coursesToShow.length > 0 &&
    coursesToShow.map((course, i) => (
      <Course key={i} course={course} />
    ))}

        </div>
      </div>
    </section>
  );
};

export default Courses;

const CourseSkeleton = () => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <Skeleton className="w-full h-36" />
    <div className="px-5 py-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-1/4" />
    </div>
  </div>
);
