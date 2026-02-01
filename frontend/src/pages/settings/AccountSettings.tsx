
import React, { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import { fetchUser, updateUserProfile, fetchPaypalUsername, updatePaypalUsername } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AccountSettings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [paypalUsername, setPaypalUsername] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPaypal, setIsUpdatingPaypal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshUserData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const userData = await fetchUser();
        setUser(userData);
        setName(userData.name);
        setEmail(userData.email);
        setCompany(userData.company || "");

        // Load PayPal username separately
        const paypalUser = await fetchPaypalUsername();
        setPaypalUsername(paypalUser || "");
      } catch (error) {
        console.error("Error loading user:", error);
        toast.error("❌ Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      if (!user) {
        toast.error("❌ User data not loaded");
        return;
      }

      // Basic validation
      if (!name.trim()) {
        toast.error("⚠️ Name is required");
        setIsUpdating(false);
        return;
      }

      if (!email.trim()) {
        toast.error("⚠️ Email is required");
        setIsUpdating(false);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("⚠️ Invalid email format");
        setIsUpdating(false);
        return;
      }

      // Update profile using backend API
      const updatedUser = await updateUserProfile({ name: name.trim(), email: email.trim(), company: company.trim() });

      // Update local state
      setUser(updatedUser);
      setName(updatedUser.name);
      setEmail(updatedUser.email);
      setCompany(updatedUser.company || "");

      // Refresh user context
      await refreshUserData();

      toast.success("🎉 User details updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`❌ Failed to update profile: ${error.message || "Please try again"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePaypal = async () => {
    setIsUpdatingPaypal(true);
    try {
      await updatePaypalUsername(paypalUsername.trim());
      toast.success("🎉 PayPal.Me username updated!");
    } catch (error: any) {
      console.error("Error updating PayPal username:", error);
      toast.error(`❌ ${error.message || "Failed to update PayPal username"}`);
    } finally {
      setIsUpdatingPaypal(false);
    }
  };

  const handleUpdatePasswordClick = () => {
    navigate("/settings/security");
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-10 w-full max-w-md bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full max-w-md bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full max-w-md bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.name} />
          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{user?.name || "Loading..."}</h2>
          <p className="text-sm text-gray-500">{user?.email || "Loading..."}</p>
          {user?.company && (
            <p className="text-xs text-gray-400">{user.company}</p>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-md"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-md"
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium">Company</Label>
            <Input
              id="company"
              placeholder="Enter your company name (optional)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="max-w-md"
              disabled={isUpdating}
            />
          </div>

          <div className="pt-2">
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating || !name.trim() || !email.trim()}
              className="min-w-[140px]"
            >
              {isUpdating ? (
                <>
                  <span className="mr-2">Updating...</span>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Settings</h3>
        <p className="text-sm text-gray-500">
          Connect your PayPal.Me username to receive payments on invoices.
          Clients will be able to pay you directly via PayPal.
        </p>

        <div className="space-y-2">
          <Label htmlFor="paypal" className="text-sm font-medium">PayPal.Me Username</Label>
          <div className="flex items-center gap-2 max-w-md">
            <span className="text-sm text-gray-500">paypal.me/</span>
            <Input
              id="paypal"
              placeholder="yourUsername"
              value={paypalUsername}
              onChange={(e) => setPaypalUsername(e.target.value)}
              className="flex-1"
              disabled={isUpdatingPaypal}
            />
          </div>
          <p className="text-xs text-gray-400">
            Example: If your PayPal.Me link is paypal.me/johnfreelancer, enter "johnfreelancer"
          </p>
        </div>

        <Button
          onClick={handleUpdatePaypal}
          disabled={isUpdatingPaypal}
          className="min-w-[140px]"
        >
          {isUpdatingPaypal ? (
            <>
              <span className="mr-2">Saving...</span>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </>
          ) : (
            "Save PayPal Username"
          )}
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Security</h3>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">Change your password to keep your account secure.</p>

          <Button
            variant="outline"
            onClick={handleUpdatePasswordClick}
            className="mt-2"
          >
            Update Password
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;

