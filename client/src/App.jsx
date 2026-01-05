import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import { Toaster } from "sonner";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import Navbar from "./components/ui/Navbar";
import HeroSection from "./pages/student/HeroSection";
import Course from "./pages/student/Course";
import Courses from "./pages/student/Courses";
import Profile from "./pages/student/Profile";
import CourseAdmin from "./pages/admin/CourseAdmin";
import CreateCourse from "./pages/admin/CreateCourse";
import Dashboard from "./pages/admin/Dashboard";
import Signup from "./pages/signup";
import EditCourse from "./pages/admin/EditCourse";
import AddLecture from "./pages/admin/lecture/AddLecture";
import EditLecture from "./pages/admin/lecture/EditLecture";
import MyLearning from "./pages/student/MyLearning";
import CourseDetail from "./pages/student/CourseDetail";
import CheckoutPage from "./pages/student/CheckoutPage";
import CourseProgress from "./pages/admin/lecture/CourseProgress";
import PaymentStatus from "./pages/PaymentStatus";
import AssignmentAdmin from "./pages/admin/AssignmentsAdmin";
import AssignmentSubmissions from "./pages/admin/AssignmentSubmissions";
import GradingPage from "./pages/admin/GradingPage";


import CourseChat from "./pages/student/CourseChat";

import ChangePassword from "./pages/ChangePassword";

function App() {
  return (
    <>
      <Toaster richColors position="bottom-right" />
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <Courses />
              <CourseChat/>
            </>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courseAdmin" element={<CourseAdmin />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/edit-course/:courseId" element={<EditCourse />} />
        <Route path="/:courseId/add-lecture" element={<AddLecture />} />
        <Route
          path="/:courseId/edit-lecture/:lectureId"
          element={<EditLecture />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="my-learning" element={<MyLearning />} />
        <Route path="course-detail/:courseId" element={<CourseDetail />} />
        <Route path="/checkout/:courseId" element={<CheckoutPage />} />
        <Route path="/course-progress/:courseId" element={<CourseProgress />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route path="/assignmentAdmin" element={<AssignmentAdmin />} />
        <Route
          path="/assignment-submissions/:assignmentId"
          element={<AssignmentSubmissions />}
        />
        <Route
          path="/admin/assignments/:assignmentId/grading"
          element={<GradingPage />}
        />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
    </>
  );
}

export default App;
