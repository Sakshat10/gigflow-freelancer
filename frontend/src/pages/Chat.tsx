import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Loader2,
  ChevronRight,
  Clock,
  User,
  Building2
} from "lucide-react";
import { fetchWorkspaces } from "@/services/workspace";
import { Workspace } from "@/types";

interface WorkspaceWithMessages extends Workspace {
  latestMessage?: {
    text: string;
    sender: string;
    createdAt: string;
  };
  unreadCount?: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithMessages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkspacesWithMessages = async () => {
      try {
        const ws = await fetchWorkspaces();

        // Fetch latest message for each workspace
        const workspacesWithMessages = await Promise.all(
          ws.map(async (workspace) => {
            try {
              const response = await fetch(
                `${API_URL}/api/workspaces/${workspace.id}/messages`,
                { credentials: "include" }
              );
              if (response.ok) {
                const data = await response.json();
                const messages = data.messages || [];
                const latestMessage = messages.length > 0
                  ? messages[messages.length - 1]
                  : null;
                return {
                  ...workspace,
                  latestMessage,
                  unreadCount: workspace.hasNewMessages ? 1 : 0,
                };
              }
            } catch (e) {
              console.error("Error fetching messages for workspace:", workspace.id);
            }
            return { ...workspace };
          })
        );

        // Sort by latest message time (most recent first)
        workspacesWithMessages.sort((a, b) => {
          const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
          const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
          return bTime - aTime;
        });

        setWorkspaces(workspacesWithMessages);
      } catch (error) {
        console.error("Error loading workspaces:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspacesWithMessages();
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const truncateMessage = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Navbar />

      <main className="flex-1 pt-24 pb-12 px-4 max-w-4xl mx-auto w-full">
        <FadeIn>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Messages
              </h1>
            </div>
            <p className="text-gray-500 ml-[52px]">
              All your workspace conversations in one place
            </p>
          </div>

          {/* Chat List */}
          <Card className="border-0 shadow-xl shadow-gray-200/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Recent Conversations
                {workspaces.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {workspaces.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-gray-400 text-sm">Loading conversations...</p>
                  </div>
                </div>
              ) : workspaces.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-gray-400 text-sm max-w-sm mx-auto">
                    Start chatting with clients in your workspaces to see conversations here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {workspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className="group flex items-center justify-between p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 cursor-pointer"
                      onClick={() => navigate(`/workspace/${workspace.id}?tab=chat`)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 ${workspace.hasNewMessages
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                            : "bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-blue-100 group-hover:to-indigo-50"
                          }`}>
                          <Building2 className={`h-5 w-5 ${workspace.hasNewMessages ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                            }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                              {workspace.name}
                            </p>
                            {workspace.hasNewMessages && (
                              <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                New
                              </Badge>
                            )}
                          </div>
                          {workspace.latestMessage ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {workspace.latestMessage.sender === "client" ? "Client" : "You"}:
                              </span>
                              <p className="text-sm text-gray-500 truncate">
                                {truncateMessage(workspace.latestMessage.text)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 mt-1">
                              No messages yet
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        {workspace.latestMessage && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(workspace.latestMessage.createdAt)}</span>
                          </div>
                        )}
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </main>
    </div>
  );
};

export default Chat;
