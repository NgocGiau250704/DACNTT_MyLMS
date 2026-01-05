const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // TODO: Thay bằng mutation thực tế của cậu
  const fakeChangePasswordAPI = async () => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill in all fields.");
    }

    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters.");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New password and confirm password do not match.");
    }

    try {
      await fakeChangePasswordAPI();
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error("Failed to update password.");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 py-4 bg-white rounded-lg">
        <div>
          <label className="text-sm font-medium text-gray-700">Current Password</label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">New Password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="mt-1"
          />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-700">
          Save Password
        </Button>
      </DialogFooter>
    </>
  );
};
