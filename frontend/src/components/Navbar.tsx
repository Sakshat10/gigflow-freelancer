
import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  FileText, 
  MessageSquare, 
  Settings, 
  User, 
  Zap, 
  Sparkles,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationPopover } from "@/components/ui/notification-popover";
import { toast } from "sonner";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { fetchWorkspaces } from "@/services/api";
import { Workspace } from "@/types";
import { mapWorkspaceDataArrayToWorkspaceArray } from "@/services/workspace/workspace.types";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const { isAuthenticated, logout, user } = useAuth();
  const { 
    markAsRead, 
    markAllAsRead, 
    handleNotificationClick,
    addNotification
  } = useNotifications();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadWorkspaces();
    }
  }, [isAuthenticated]);

  const loadWorkspaces = async () => {
    if (isAuthenticated) {
      setIsLoadingWorkspaces(true);
      try {
        const workspacesData = await fetchWorkspaces();
        setWorkspaces(mapWorkspaceDataArrayToWorkspaceArray(workspacesData));
      } catch (error) {
        console.error("Failed to load workspaces:", error);
      } finally {
        setIsLoadingWorkspaces(false);
      }
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navbarClass = cn(
    "fixed top-0 w-full z-50 transition-all duration-300 px-4 md:px-8",
    {
      "py-2 bg-white/80 backdrop-blur-md shadow-sm": isScrolled,
      "py-4 bg-transparent": !isScrolled && isHomePage,
      "py-2 bg-white shadow-sm": !isScrolled && !isHomePage,
    }
  );

  const linkClass = "font-medium link-underline px-3 py-2 text-gray-700 hover:text-primary transition-colors";
  const activeLinkClass = "text-primary";

  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const { message, workspace, isClient } = event.detail;
      
      if (message && workspace) {
        const currentPath = location.pathname;
        const messageWorkspacePath = `/workspace/${message.workspace_id}`;
        
        if (!currentPath.includes(messageWorkspacePath) || !location.search.includes('tab=chat')) {
          addNotification({
            title: "New message",
            description: `You received a new message in workspace ${workspace.name}`,
            link: `${messageWorkspacePath}?tab=chat`,
            hasAttachment: message.has_attachment,
            attachmentType: message.attachment_type,
            senderName: workspace.name,
            isClient: isClient
          });
        }
      }
    };
    
    window.addEventListener('new-message', handleNewMessage as EventListener);
    
    return () => {
      window.removeEventListener('new-message', handleNewMessage as EventListener);
    };
  }, [location, addNotification]);

  const handleNotificationChange = (updatedNotifications) => {
    console.log("Notifications updated:", updatedNotifications);
  };

  const handleLogout = async () => {
    try {
      closeMobileMenu();
      await logout();
      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const navigateToWorkspaceChat = (workspaceId: string) => {
    navigate(`/workspace/${workspaceId}?tab=chat`);
  };

  const getUpgradeButton = () => {
    if (!user) return null;
    
    if (user.plan === "free") {
      return (
        <NavLink to="/settings/pricing">
          <Button variant="outline" className="rounded-full px-6 hover-translate text-primary border-primary hover:bg-primary/10">
            Upgrade to Pro
          </Button>
        </NavLink>
      );
    } else if (user.plan === "pro") {
      return (
        <NavLink to="/settings/pricing">
          <Button variant="outline" className="rounded-full px-6 hover-translate text-primary border-primary hover:bg-primary/10">
            Upgrade to Pro Plus
          </Button>
        </NavLink>
      );
    } else {
      return null;
    }
  };

  return (
    <nav className={navbarClass}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {isAuthenticated ? (
          <NavLink 
            to="/dashboard" 
            className="text-2xl font-bold flex items-center gap-1"
            onClick={closeMobileMenu}
          >
            <div className="bg-gradient-to-r from-primary to-blue-400 text-white p-1 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-gradient ml-1">GigFlow</span>
          </NavLink>
        ) : (
          <NavLink 
            to="/" 
            className="text-2xl font-bold flex items-center gap-1"
            onClick={closeMobileMenu}
          >
            <div className="bg-gradient-to-r from-primary to-blue-400 text-white p-1 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-gradient ml-1">GigFlow</span>
          </NavLink>
        )}

        <div className="hidden md:flex items-center space-x-1">
          {isAuthenticated ? (
            <>
              <NavLink 
                to="/invoices" 
                className={({ isActive }) => cn(linkClass, isActive && activeLinkClass)}
              >
                Invoices
              </NavLink>
              
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={cn(linkClass, location.pathname === "/chat" && activeLinkClass)}>
                      <span className="flex items-center">
                        Chat
                      </span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px] gap-3 p-4">
                        <li className="flex flex-col">
                          <span className="mb-2 text-xs font-semibold text-gray-500">
                            Workspaces
                          </span>
                          {isLoadingWorkspaces ? (
                            <div className="py-2 text-sm text-gray-500">Loading workspaces...</div>
                          ) : workspaces.length > 0 ? (
                            workspaces.map(workspace => (
                              <button
                                key={workspace.id}
                                onClick={() => navigateToWorkspaceChat(workspace.id)}
                                className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-gray-100"
                              >
                                <div className={`w-2 h-2 rounded-full bg-${workspace.color}-500`} />
                                <span className="truncate">{workspace.name}</span>
                                <span className="ml-auto text-xs text-gray-500">{workspace.messageCount} messages</span>
                              </button>
                            ))
                          ) : (
                            <div className="py-2 text-sm text-gray-500">No workspaces found</div>
                          )}
                        </li>
                        <li className="mt-2 border-t pt-2">
                          <NavLink
                            to="/chat"
                            className="flex items-center text-sm gap-2 p-2 rounded-md hover:bg-gray-100"
                          >
                            <MessageCircle size={16} />
                            <span>All messages</span>
                          </NavLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {getUpgradeButton()}
              <div className="flex items-center ml-4 space-x-2">
                <div className="mr-1">
                  <NotificationPopover 
                    onNotificationsChange={handleNotificationChange}
                    onNotificationClick={handleNotificationClick}
                    buttonClassName="rounded-full aspect-square hover:bg-gray-100"
                    popoverClassName="bg-white border border-gray-200"
                    textColor="text-gray-800"
                    hoverBgColor="hover:bg-gray-100"
                    dividerColor="divide-gray-200"
                    headerBorderColor="border-gray-200"
                  />
                </div>
                
                <NavLink to="/settings">
                  <Button variant="outline" size="icon" className="rounded-full hover-translate">
                    <Settings size={18} />
                  </Button>
                </NavLink>
                <Button 
                  variant="outline" 
                  className="rounded-full px-6 hover-translate"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <NavLink 
                to="/" 
                className={({ isActive }) => cn(linkClass, isActive && activeLinkClass)}
              >
                Home
              </NavLink>
              <NavLink 
                to="/login" 
                className="ml-4"
              >
                <Button variant="outline" className="rounded-full px-6 hover-translate">
                  Login
                </Button>
              </NavLink>
              <NavLink to="/signup">
                <Button className="rounded-full px-6 hover-translate">
                  Sign Up
                </Button>
              </NavLink>
            </>
          )}
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white glass-effect z-50 py-4 px-6 space-y-4 border-b border-gray-100 animate-fade-in-fast">
          {isAuthenticated ? (
            <>
              <NavLink 
                to="/invoices" 
                className={({ isActive }) => cn("block py-2", isActive && "text-primary font-medium")}
                onClick={closeMobileMenu}
              >
                Invoices
              </NavLink>
              
              <div className="block py-2">
                <span className="block mb-2 font-medium">Chat</span>
                <div className="ml-4 space-y-2">
                  {isLoadingWorkspaces ? (
                    <div className="py-1 text-sm text-gray-500">Loading workspaces...</div>
                  ) : workspaces.length > 0 ? (
                    workspaces.map(workspace => (
                      <NavLink
                        key={workspace.id}
                        to={`/workspace/${workspace.id}?tab=chat`}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2 py-1 text-sm"
                      >
                        <div className={`w-2 h-2 rounded-full bg-${workspace.color}-500`} />
                        <span>{workspace.name}</span>
                      </NavLink>
                    ))
                  ) : (
                    <div className="py-1 text-sm text-gray-500">No workspaces found</div>
                  )}
                  <NavLink
                    to="/chat"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 py-1 text-sm"
                  >
                    <MessageCircle size={16} />
                    <span>All messages</span>
                  </NavLink>
                </div>
              </div>

              <NavLink 
                to="/account" 
                className={({ isActive }) => cn("block py-2", isActive && "text-primary font-medium")}
                onClick={closeMobileMenu}
              >
                Account
              </NavLink>
              <NavLink 
                to="/settings" 
                className={({ isActive }) => cn("block py-2", isActive && "text-primary font-medium")}
                onClick={closeMobileMenu}
              >
                Settings
              </NavLink>
              
              {user?.plan !== "pro_plus" && (
                <NavLink 
                  to="/settings/pricing" 
                  className={({ isActive }) => cn("block py-2", isActive && "text-primary font-medium")}
                  onClick={closeMobileMenu}
                >
                  {user?.plan === "free" ? "Upgrade to Pro" : "Upgrade to Pro Plus"}
                </NavLink>
              )}
              
              <div className="pt-2">
                <Button 
                  className="w-full rounded-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <NavLink 
                to="/" 
                className={({ isActive }) => cn("block py-2", isActive && "text-primary font-medium")}
                onClick={closeMobileMenu}
              >
                Home
              </NavLink>
              <div className="pt-2 flex flex-col space-y-2">
                <NavLink 
                  to="/login" 
                  className="w-full"
                  onClick={closeMobileMenu}
                >
                  <Button variant="outline" className="w-full rounded-full">
                    Login
                  </Button>
                </NavLink>
                <NavLink 
                  to="/signup" 
                  className="w-full"
                  onClick={closeMobileMenu}
                >
                  <Button className="w-full rounded-full">
                    Sign Up
                  </Button>
                </NavLink>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
