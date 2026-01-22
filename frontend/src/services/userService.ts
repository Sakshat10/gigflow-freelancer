import { User } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Fetch current user from backend API
export const fetchUser = async (): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/api/user/me`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user:", error);
    // Fallback to localStorage for initial load
    const stored = localStorage.getItem('gigflow_user');
    if (stored) {
      return JSON.parse(stored);
    }
    throw error;
  }
};

// Update user profile via backend API
export const updateUserProfile = async (data: Partial<User>): Promise<User> => {
  const response = await fetch(`${API_URL}/api/user/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update profile");
  }

  const result = await response.json();

  // Also update localStorage for auth context
  const stored = localStorage.getItem('gigflow_user');
  if (stored) {
    const user = JSON.parse(stored);
    const updatedUser = { ...user, ...result.user };
    localStorage.setItem('gigflow_user', JSON.stringify(updatedUser));
  }

  return result.user;
};

// Change password via backend API
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/user/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update password");
  }
};

// Fetch PayPal.Me username
export const fetchPaypalUsername = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_URL}/api/user/paypal`, {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.paypalMeUsername || null;
  } catch (error) {
    console.error("Error fetching PayPal username:", error);
    return null;
  }
};

// Update PayPal.Me username
export const updatePaypalUsername = async (paypalMeUsername: string): Promise<string | null> => {
  const response = await fetch(`${API_URL}/api/user/paypal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ paypalMeUsername }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update PayPal username");
  }

  const data = await response.json();
  return data.paypalMeUsername;
};

// Alias for backward compatibility
export const updateUser = updateUserProfile;

