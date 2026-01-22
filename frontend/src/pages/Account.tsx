import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Activity, 
  FileText, 
  HelpCircle, 
  Mail
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-user-profile";
import { Badge } from "@/components/ui/badge";
import { hasFeatureAccess } from "@/utils/planFeatures";

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { user: profile, loading: loadingProfile } = useProfile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getPlanBadgeColor = () => {
    if (!profile) return "bg-gray-100 text-gray-800";
    
    switch (profile.plan) {
      case "pro":
        return "bg-blue-100 text-blue-800";
      case "pro_plus":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanDisplayName = () => {
    if (!profile) return "Free Plan";
    
    switch (profile.plan) {
      case "pro":
        return "Pro Plan";
      case "pro_plus":
        return "Pro Plus Plan";
      default:
        return "Free Plan";
    }
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <FadeIn>
            <div>
              <h1 className="text-3xl font-bold">Account</h1>
              <p className="text-gray-600">Manage your profile and account settings</p>
            </div>
          </FadeIn>
          
          {/* Removed the Settings and Sign Out buttons */}
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FadeIn className="md:col-span-1">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg" alt={profile?.name || "User"} />
                      <AvatarFallback className="text-lg bg-primary/10">
                        {profile?.name ? getInitials(profile.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <h2 className="text-xl font-semibold">{profile?.name || "User"}</h2>
                  <p className="text-sm text-gray-500 mt-1 mb-3">{profile?.email || "loading..."}</p>
                  
                  <Badge className={`${getPlanBadgeColor()} font-medium mt-1`}>
                    {getPlanDisplayName()}
                  </Badge>
                  
                  {profile?.memberSince && (
                    <p className="text-sm text-gray-500 mt-3">
                      Member since {profile.memberSince}
                    </p>
                  )}
                  
                  <div className="mt-6 w-full">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/settings/account')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <nav className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate('/settings/security')}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Security
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </FadeIn>
          
          <FadeIn delay="100" className="md:col-span-2">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                    onClick={() => navigate('/invoices')}
                  >
                    <FileText className="h-6 w-6 mb-2 text-blue-500" />
                    <div className="text-center">
                      <div className="font-medium">Create Invoice</div>
                      <p className="text-sm text-gray-500 mt-1">Create and send professional invoices</p>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                    onClick={() => navigate('/client-emails')}
                    disabled={!hasFeatureAccess(profile?.plan, 'emailBlaster')}
                  >
                    <Mail className="h-6 w-6 mb-2 text-purple-500" />
                    <div className="text-center">
                      <div className="font-medium">Send Client Emails</div>
                      <p className="text-sm text-gray-500 mt-1">
                        Send emails to clients
                        {!hasFeatureAccess(profile?.plan, 'emailBlaster') && (
                          <span className="block text-xs text-amber-600 mt-1">Requires Pro Plus</span>
                        )}
                      </p>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                    onClick={() => navigate('/settings/support')}
                  >
                    <HelpCircle className="h-6 w-6 mb-2 text-amber-500" />
                    <div className="text-center">
                      <div className="font-medium">Get Support</div>
                      <p className="text-sm text-gray-500 mt-1">Contact our support team</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </main>
    </div>
  );
};

export default Account;
