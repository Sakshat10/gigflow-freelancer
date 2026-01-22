import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/animations/FadeIn";
import { toast } from "sonner";
import { updatePassword } from "@/services/userService";

const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");

    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "There was a problem updating your password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FadeIn delay="100" className="w-full">
      <Card className="rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
          <p className="text-gray-600 mb-6">
            Manage your password to keep your account secure.
          </p>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Change Password</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="current-password" className="text-sm font-medium">
                    Current Password
                  </label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full max-w-md"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleUpdatePassword}
                  className="rounded-full hover-translate"
                  disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </FadeIn>
  );
};

export default SecuritySettings;
