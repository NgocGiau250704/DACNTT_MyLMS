// src/components/AdminSidebar.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen} from "lucide-react";
import { Button } from "@/components/ui/button";


const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Courses", icon: BookOpen, path: "/courseAdmin" },
    { label: "Assignments", icon: BookOpen, path: "/assignmentAdmin" },
    
  ];

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm 
                 flex flex-col pt-30 p-6 z-40"
    >
      <nav className="flex flex-col gap-6 text-gray-700 font-medium">
        {links.map(({ label, icon: Icon, path }) => (
          <Button
            key={path}
            variant="ghost"
            onClick={() => navigate(path)}
            className={`justify-start text-base ${
              location.pathname === path
                ? "bg-indigo-100 text-indigo-600"
                : "hover:bg-gray-100 text-white"
            }`}
          >
            <Icon size={18} className="mr-2" />
            {label}
          </Button>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
