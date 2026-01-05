import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Courses from "./Courses";
import { toast } from "sonner";
import { useEffect } from "react";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";

const Profile = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const { data, isLoading, isError, isSuccess, error, refetch } =
    useLoadUserQuery();

  const [
    updateUser,
    {
      data: updateData,
      isLoading: updateIsLoading,
      isSuccess: updateIsSuccess,
      error: updateError,
      isError: isUpdateError,
    },
  ] = useUpdateUserMutation();
  const onChangeHandler = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name);

    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }

    await updateUser(formData).unwrap();
  };

  const user = data?.user;

  console.log("User from backend:", user);

  useEffect(() => {
    if (open && user) {
      setName(user.name || "");
      setProfilePhoto(null);
    }
  }, [open, user]);
  useEffect(() => {
    if (updateIsSuccess) {
      toast.success(updateData?.message || "Profile updated successfully");
      refetch();
    }

    if (isUpdateError) {
      toast.error(updateError?.data?.message || "Failed to update profile");
    }
  }, [updateIsSuccess, isUpdateError, updateData, updateError, refetch]);

  if (isLoading) return <h1>Profile Loading...</h1>;
  if (!data || !data.user) {
    return <h1 className="text-red-500">Failed to load user data.</h1>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-12 px-6 pt-28">
      <div className="max-w-5xl mx-auto space-y-10">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">PROFILE</h2>

        {/* Thông tin người dùng */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white p-6 rounded-lg shadow-md text-gray-900">
          <img
            src={user.photoUrl || "/default-avatar.png"}
            alt="Profile Avatar"
            className="w-28 h-28 rounded-full border-4 border-gray-200 object-cover"
          />
          <div className="text-center sm:text-left space-y-2 text-black">
            <p>
              <span className="font-semibold text-gray-700">Name:</span>{" "}
              {user.name}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Email:</span>{" "}
              {user.email}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Role:</span>{" "}
              {user.role}
            </p>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="mt-3 bg-blue-600 hover:bg-blue-700">
                  Edit Profile
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md bg-white text-black rounded-xl shadow-lg border border-gray-200">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you’re
                    done.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4 bg-white rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Profile Photo
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={onChangeHandler}
                      className="mt-1"
                    />

                    {profilePhoto ? (
                      <img
                        src={URL.createObjectURL(profilePhoto)}
                        alt="Preview"
                        className="mt-3 w-24 h-24 rounded-full object-cover border"
                      />
                    ) : (
                      <img
                        src={user.photoUrl || "/default-avatar.png"}
                        alt="Profile Avatar"
                        className="mt-3 w-24 h-24 rounded-full object-cover border"
                      />
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={updateUserHandler}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Khóa học */}
        <div>
          {/* <Courses title="Courses you’re enrolled in" />
           */}
          {/* <Courses
            title="Courses you’re enrolled in"
            enrolledCourses={user.enrolledCourses}
          /> */}
          <div className="max-w-6xl mx-auto mt-8">
            <div className="flex flex-wrap gap-6 justify-center">
              <Courses
                title="Courses you’re enrolled in"
                enrolledCourses={user.enrolledCourses}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
