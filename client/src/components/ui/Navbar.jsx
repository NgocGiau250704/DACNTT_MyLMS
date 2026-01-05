import { School } from "lucide-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { useEffect } from "react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Navbar = () => {
  // const user = true;
  const {user} = useSelector((state) => state.auth);
  const [logoutUser, { data, isSuccess, reset }] = useLogoutUserMutation();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    await logoutUser();
  };

  // useEffect(() => {
  //   if (isSuccess) {
  //     toast.success(data.message || "Logged out successfully");
  //     navigate("/login");
  //   }
  // }, [isSuccess, navigate]);

  useEffect(() => {
  if (isSuccess) {
    toast.success(data?.message || "Logged out successfully");
    navigate("/login");
    reset(); 
  }
}, [isSuccess, navigate, reset, data]);

  // const navigate = useNavigate();
  return (
    <div className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-50">
      <Link to="/">
      <div className="flex items-center gap-3">
        <School size={30} className="text-indigo-600" />
        
        <h1 className="font-extrabold text-2xl text-indigo-700">E-Learning</h1>
      </div>
      </Link>
      <div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer" tabIndex={0}>
                <AvatarImage
                  src={user.photoUrl|| "https://github.com/shadcn.png"}
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 bg-white z-[9999]" align="end">
              <DropdownMenuLabel className="text-black hover:bg-gray-100">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-black hover:bg-gray-100">
                  <Link to = "my-learning">
                  My Learning
                </Link>
                  
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="text-black hover:bg-gray-100 cursor-pointer"
                >
                  Profile
                </DropdownMenuItem>
                 <DropdownMenuItem
                  onClick={() => navigate("/change-password")}
                  className="text-black hover:bg-gray-100 cursor-pointer"
                >
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-black hover:bg-gray-100"
                  onClick={logoutHandler}
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuGroup>
               {user.role === "instructor" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard")}
                    className="text-black hover:bg-gray-100"
                  >
                    Dashboard
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/login")} variant="outline">Login</Button>
            <Button onClick={() => navigate("/signup")}>Signup</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
