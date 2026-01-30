import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import IndexPage from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Invoices from "./pages/Invoices";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Workspace from "./pages/Workspace";
import SharedWorkspaceView from "./pages/SharedWorkspaceView";
import Settings from "./pages/Settings";
import AccountSettings from "./pages/settings/AccountSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import AppearanceSettings from "./pages/settings/AppearanceSettings";
import PricingSettings from "./pages/settings/PricingSettings";
import SupportSettings from "./pages/settings/SupportSettings";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Disclaimer from "./pages/Disclaimer";
import ReturnPolicy from "./pages/ReturnPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import NotFound from "./pages/NotFound";
import ClientEmails from "./pages/ClientEmails";
import ClientUpdates from "./pages/ClientUpdates";
import { hasFeatureAccess } from "./utils/planFeatures";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component to check authentication
const AuthProtectedRoute = ({ 
  element
}: { 
  element: React.ReactNode
}) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{element}</>;
};

// Feature protected route component for premium features
const FeatureProtectedRoute = ({ 
  element, 
  feature 
}: { 
  element: React.ReactNode, 
  feature: string 
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasFeatureAccess(user?.plan, feature as any)) {
    const requiredPlan = feature === "invoices" || feature === "documents" ? "Pro" : "Pro Plus";
    
    setTimeout(() => {
      toast.error(`🔒 Premium Feature\nThis feature is available in the ${requiredPlan} plan.`);
    }, 100);
    
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{element}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 2000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              padding: '16px',
            },
            success: {
              duration: 2000,
              style: {
                background: '#16a34a', // Green background
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '16px',
              },
            },
            error: {
              duration: 3000,
              style: {
                background: '#dc2626', // Red background
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '16px',
              },
            },
          }}
        />
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <Routes>
                <Route path="/" element={<IndexPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/account" element={<Account />} />
                <Route path="/workspace/:id" element={<Workspace />} />
                <Route path="/share/:id" element={<SharedWorkspaceView />} />
                <Route 
                  path="/client-emails" 
                  element={<ClientUpdates />}
                />
                <Route 
                  path="/client-updates" 
                  element={<ClientUpdates />}
                />
                <Route path="/settings/*" element={<Settings />}>
                  <Route index element={<Navigate to="/settings/account" replace />} />
                  <Route path="account" element={<AccountSettings />} />
                  <Route path="security" element={<SecuritySettings />} />
                  <Route path="notifications" element={<NotificationSettings />} />
                  <Route path="appearance" element={<AppearanceSettings />} />
                  <Route path="pricing" element={<PricingSettings />} />
                  <Route path="payment" element={<Navigate to="/settings/account" replace />} />
                  <Route path="support" element={<SupportSettings />} />
                </Route>
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
