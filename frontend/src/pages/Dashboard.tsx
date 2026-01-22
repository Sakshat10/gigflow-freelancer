import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { FadeIn } from "@/components/animations/FadeIn";
import WorkspaceCard from "@/components/WorkspaceCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Mail, Calendar, User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Workspace } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import CreateWorkspaceForm from "@/components/workspace/CreateWorkspaceForm";
import toast from "react-hot-toast";
import { fetchWorkspaces } from "@/services/workspace";
import { Card } from "@/components/ui/card";
import { Steps } from 'intro.js-react';
import { useIntroTour, TourStep } from "@/hooks/use-intro-tour";
import 'intro.js/introjs.css';

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  // Intro tour
  const {
    tourConfig,
    startTour,
    hasSeenTour,
    isFirstTimeUser,
    onExit,
    onComplete
  } = useIntroTour('dashboard');

  // Load workspaces from localStorage
  useEffect(() => {
    const loadWorkspaces = async () => {
      setLoading(true);
      try {
        const data = await fetchWorkspaces();
        setWorkspaces(data);
      } catch (error) {
        console.error("Error loading workspaces:", error);
      } finally {
        setLoading(false);
      }
    };
    loadWorkspaces();
  }, []);

  // Start tour for first-time users
  useEffect(() => {
    // Check localStorage directly to ensure we have the latest values
    const hasCompletedTour = localStorage.getItem('tour_completed_dashboard') === 'true';
    const isFirstTime = localStorage.getItem('first_time_user') === 'true';

    // Check session flag to prevent double trigger in same mount
    const hasTriggeredThisSession = sessionStorage.getItem('dashboard_tour_triggered') === 'true';

    if (isFirstTime && !hasCompletedTour && !loading && !dialogOpen && !hasTriggeredThisSession) {
      sessionStorage.setItem('dashboard_tour_triggered', 'true');
      const timer = setTimeout(() => {
        const steps: TourStep[] = [
          {
            element: '#dashboard-header',
            title: '👋 Welcome to GigFlow!',
            intro: 'This is your dashboard where you manage all your client workspaces.',
            position: 'bottom',
          },
          {
            element: '#search-workspaces',
            title: '🔍 Quick Search',
            intro: 'Find any workspace instantly by typing the client name.',
            position: 'bottom',
          },
          {
            element: '#email-clients-btn',
            title: '📧 Email Clients',
            intro: 'Send professional emails to your clients directly from GigFlow.',
            position: 'bottom',
          },
          {
            element: '#new-workspace-btn',
            title: '✨ Create Workspaces',
            intro: 'Click here to create a new workspace for each client. Each workspace has files, chat, invoices, and more!',
            position: 'bottom',
          },
          {
            element: '#workspaces-section',
            title: '📁 Your Workspaces',
            intro: 'All your client workspaces appear here. Click on any to access files, chat, invoices, and tasks.',
            position: 'top',
          },
          {
            element: '#profile-section',
            title: '👤 Your Profile',
            intro: 'View your account info and upgrade your plan for more features!',
            position: 'left',
          },
        ];
        startTour(steps);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [loading, dialogOpen, startTour]);

  const getWorkspaceLimit = () => {
    if (!user) return 0;
    switch (user.plan) {
      case "free":
        return 1;
      case "pro":
        return 5;
      case "pro_plus":
        return Infinity;
      default:
        return 1;
    }
  };

  const canCreateWorkspace = () => {
    const limit = getWorkspaceLimit();
    return workspaces.length < limit;
  };

  const getUpgradeMessage = () => {
    if (!user) return "";
    switch (user.plan) {
      case "free":
        return "Upgrade to Pro to create more workspaces";
      case "pro":
        return "Upgrade to Pro Plus for more workspaces";
      default:
        return "Upgrade your plan for more workspaces";
    }
  };

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateWorkspace = (newWorkspace: Workspace) => {
    setDialogOpen(false);
    setWorkspaces(prev => [newWorkspace, ...prev]);
    toast.success("Workspace created!");

    // Navigate to new workspace to show the workspace tour
    setTimeout(() => {
      navigate(`/workspace/${newWorkspace.id}?tour=true`);
    }, 300);
  };

  const handleWorkspaceDeleted = (deletedWorkspaceId: string) => {
    setWorkspaces(prev =>
      prev.filter(workspace => workspace.id !== deletedWorkspaceId)
    );
    toast.success("Workspace deleted");
  };

  const handleNewWorkspaceClick = () => {
    if (!canCreateWorkspace()) {
      toast.error(getUpgradeMessage());
      return;
    }
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Intro.js Steps */}
      <Steps
        enabled={tourConfig.enabled}
        steps={tourConfig.steps}
        initialStep={tourConfig.initialStep || 0}
        onExit={onExit}
        onComplete={onComplete}
        options={tourConfig.options}
      />

      <main className="flex-1 pt-24 pb-12 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <FadeIn>
            <div id="dashboard-header">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your client workspaces</p>
            </div>
          </FadeIn>

          <FadeIn delay="100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64" id="search-workspaces">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search workspaces"
                  className="pl-9 rounded-full"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  id="email-clients-btn"
                  className="rounded-full px-4 hover-translate flex-1 sm:flex-none"
                  variant="outline"
                  onClick={() => {
                    toast("Email Clients feature coming soon!", { icon: "🔒" });
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">Email Clients</span>
                  <Lock className="h-3 w-3 ml-2 text-gray-400" />
                </Button>

                <Button
                  id="new-workspace-btn"
                  className="rounded-full px-4 hover-translate flex items-center flex-1 sm:flex-none"
                  onClick={handleNewWorkspaceClick}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">New Workspace</span>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-12 gap-8 mt-8">
          <div id="workspaces-section" className="md:col-span-9 space-y-6">
            <FadeIn>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Workspaces</h2>
                <div className="text-sm text-gray-500">
                  {workspaces.length} of{" "}
                  {getWorkspaceLimit() === Infinity
                    ? "Unlimited"
                    : getWorkspaceLimit()}{" "}
                  workspaces used
                </div>
              </div>
            </FadeIn>

            {loading ? (
              <FadeIn>
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                  <p>Loading workspaces...</p>
                </div>
              </FadeIn>
            ) : filteredWorkspaces.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkspaces.map((workspace, index) => (
                  <FadeIn
                    key={workspace.id}
                    delay={
                      (index * 100 <= 300
                        ? (index * 100).toString()
                        : "300") as any
                    }
                  >
                    <WorkspaceCard
                      {...workspace}
                      onDeleted={() => handleWorkspaceDeleted(workspace.id)}
                    />
                  </FadeIn>
                ))}
              </div>
            ) : (
              <FadeIn>
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-blue-50 mx-auto flex items-center justify-center mb-4">
                    <PlusCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No workspaces found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery
                      ? "No workspaces match your search criteria."
                      : "Create your first workspace to get started."}
                  </p>
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  ) : (
                    <Button
                      className="rounded-full hover-translate"
                      onClick={handleNewWorkspaceClick}
                    >
                      Create Workspace
                    </Button>
                  )}
                </div>
              </FadeIn>
            )}
          </div>

          <div id="profile-section" className="md:col-span-3">
            <FadeIn delay="100">
              <Card className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{user?.name || "User"}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {user?.plan || "Free"} Plan
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {user?.email || "example@email.com"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Member since today
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-center rounded-full mt-2"
                    onClick={() => navigate("/account")}
                  >
                    View Profile
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="font-medium mb-4">Current Plan</h4>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <h5 className="font-medium mb-1 capitalize">
                      {user?.plan || "Free"} Plan
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      {workspaces.length} workspaces used
                    </p>
                    {user?.plan !== "pro_plus" && (
                      <Button
                        size="sm"
                        className="w-full rounded-full text-sm hover-translate"
                        onClick={() => navigate("/settings/pricing")}
                      >
                        Upgrade Plan
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </FadeIn>
          </div>
        </div>
      </main>

      {/* Create Workspace Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 rounded-2xl overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <CreateWorkspaceForm
            onWorkspaceCreated={handleCreateWorkspace}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
