
import React from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LectureTab from "./LectureTab";

const EditLecture = () => {
  const { courseId } = useParams();


  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/edit-course/${courseId}`}>

            <Button size="icon" variant="outline" className="rounded-full">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <h1 className="font-bold text-2xl text-gray-800">Update Your Lecture</h1>
        </div>
      </div>

      {/* Lecture form */}
      <LectureTab />
    </div>
  );
};

export default EditLecture;
