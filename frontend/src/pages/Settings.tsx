
import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { FadeIn } from "@/components/animations/FadeIn";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lock,
  LifeBuoy,
  DollarSign,
  Loader2,
  Wallet,
  CreditCard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Import settings page components
import AccountSettings from "./settings/AccountSettings";
import SecuritySettings from "./settings/SecuritySettings";
import PricingSettings from "./settings/PricingSettings";
import PaymentSettings from "./settings/PaymentSettings";
import SupportSettings from "./settings/SupportSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after a short delay to allow components to load
    const timer = setTimeout(() => {
      setIsSettingsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Extract the current tab from the URL path
  const getTabFromPath = (path: string) => {
    if (path === "/settings" || path === "/settings/") return "account";
    if (path.includes("account")) return "account";
    if (path.includes("security")) return "security";
    if (path.includes("pricing")) return "pricing";
    if (path.includes("support")) return "support";
    return "account";
  };

  const currentTab = getTabFromPath(currentPath);

  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    navigate(`/settings/${value}`);
  };

  const getPlanBadge = () => {
    if (!user) return null;

    let color = "";
    let text = "";

    switch (user.plan) {
      case "free":
        color = "bg-gray-100 text-gray-800";
        text = "Free Plan";
        break;
      case "pro":
        color = "bg-blue-100 text-blue-800";
        text = "Pro Plan";
        break;
      case "pro_plus":
        color = "bg-purple-100 text-purple-800";
        text = "Pro Plus Plan";
        break;
    }

    return (
      <Badge className={`ml-2 ${color}`}>{text}</Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 pt-24 pb-12 px-4 max-w-7xl mx-auto w-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 pt-24 pb-12 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <FadeIn>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">Settings</h1>
              {getPlanBadge()}
              <div>
                <p className="text-gray-600 mt-1">Manage your account preferences</p>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          <FadeIn className="md:col-span-3">
            {isMobile ? (
              <div className="mb-6">
                <Tabs
                  defaultValue={currentTab}
                  value={currentTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 w-full mb-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-2 w-full mb-2">
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="support">Support</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <Tabs
                  defaultValue={currentTab}
                  value={currentTab}
                  onValueChange={handleTabChange}
                >
                  <TabsList className="flex flex-col h-fit items-stretch gap-1 bg-gray-50 p-3 rounded-xl">
                    <TabsTrigger value="account" className="justify-start rounded-none border-l-2 border-transparent data-[state=active]:border-l-gray-400 data-[state=active]:bg-white data-[state=active]:shadow-none">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Account</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="justify-start rounded-none border-l-2 border-transparent data-[state=active]:border-l-gray-400 data-[state=active]:bg-white data-[state=active]:shadow-none">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Security</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="justify-start rounded-none border-l-2 border-transparent data-[state=active]:border-l-gray-400 data-[state=active]:bg-white data-[state=active]:shadow-none">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Pricing Plans</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="support" className="justify-start rounded-none border-l-2 border-transparent data-[state=active]:border-l-gray-400 data-[state=active]:bg-white data-[state=active]:shadow-none">
                      <div className="flex items-center gap-2">
                        <LifeBuoy className="h-4 w-4" />
                        <span>Help & Support</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}
          </FadeIn>

          <FadeIn delay="100" className="md:col-span-9">
            {isSettingsLoading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex justify-center items-center min-h-[300px]">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <p className="mt-4 text-gray-600">Loading settings content...</p>
                </div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Navigate to="/settings/account" replace />} />
                <Route path="/account" element={<AccountSettings />} />
                <Route path="/security" element={<SecuritySettings />} />
                <Route path="/pricing" element={<PricingSettings />} />
                <Route path="/payment" element={<PaymentSettings />} />
                <Route path="/support" element={<SupportSettings />} />
              </Routes>
            )}
          </FadeIn>
        </div>
      </main>
    </div>
  );
};

export default Settings;
