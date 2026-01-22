import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";
import toast from "react-hot-toast";

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface UserUpdateData {
  name?: string;
  email?: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, company?: string, paypalMeUsername?: string) => Promise<{ user: any, error: any }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: UserUpdateData) => Promise<void>;
  upgradePlan: (plan: "free" | "pro" | "pro_plus", subscriptionId?: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get stored user from localStorage
const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('gigflow_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Helper to store user in localStorage
const storeUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('gigflow_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('gigflow_user');
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = getStoredUser();
        if (storedUser) {
          // Verify session with backend
          try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
              credentials: "include",
            });

            if (response.ok) {
              const data = await response.json();
              const userData: User = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                plan: data.user.plan,
                company: storedUser.company || "",
              };
              setUser(userData);
              setIsAuthenticated(true);
              storeUser(userData);
            } else {
              // Session expired, clear local data
              storeUser(null);
            }
          } catch (error) {
            // Network error, use cached data
            console.log("Using cached user data");
            setUser(storedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: Include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        plan: data.user.plan,
        company: "",
      };

      setUser(userData);
      setIsAuthenticated(true);
      storeUser(userData);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, company?: string, paypalMeUsername?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: Include cookies
        body: JSON.stringify({ name, email, password, paypalMeUsername }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        plan: data.user.plan,
        company: company || "",
      };

      setUser(userData);
      setIsAuthenticated(true);
      storeUser(userData);
      navigate("/dashboard");

      return { user: userData, error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { user: null, error };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API fails
    }

    setUser(null);
    setIsAuthenticated(false);
    storeUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const updateUserProfile = async (data: UserUpdateData) => {
    if (!user) return;

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    storeUser(updatedUser);
  };

  const upgradePlan = async (plan: "free" | "pro" | "pro_plus", subscriptionId?: string) => {
    if (!user) return;

    try {
      // Call the backend API to persist the plan change
      const response = await fetch(`${API_URL}/api/user/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ plan, subscriptionId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update plan");
      }

      const data = await response.json();

      // Update local state with the response from server
      const updatedUser = { ...user, plan: data.user.plan };
      setUser(updatedUser);
      storeUser(updatedUser);
      toast.success(`Plan upgraded to ${plan}`);
    } catch (error: any) {
      console.error("Upgrade plan error:", error);
      toast.error(error.message || "Failed to upgrade plan");
      throw error;
    }
  };

  const deleteAccount = async () => {
    await logout();
    toast.success("Account deleted successfully");
  };

  const resetPassword = async (email: string) => {
    // Mock password reset
    console.log('Reset password for:', email);
    toast.success("Password reset email sent");
  };

  const refreshUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const userData: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          plan: data.user.plan,
          company: user?.company || "",
        };
        setUser(userData);
        storeUser(userData);
      }
    } catch (error) {
      console.error("Refresh user data error:", error);
      // Fallback to localStorage
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading: loading,
        login,
        signup,
        logout,
        updateUserProfile,
        upgradePlan,
        deleteAccount,
        resetPassword,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
