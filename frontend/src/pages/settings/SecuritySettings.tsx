import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/animations/FadeIn";
import toast from "react-hot-toast";
import { updatePassword } from "@/services/userService";
import { Eye, EyeOff } from "lucide-react";

const SecuritySettings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);

      toast.success("Password updated! Please log in again.");

      // Force full logout — clears React state, localStorage, and redirects
      setTimeout(() => {
        logout();
      }, 1500);

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
                  <div className="relative w-full max-w-md">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium">
                    New Password
                  </label>
                  <div className="relative w-full max-w-md">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <div className="relative w-full max-w-md">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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
