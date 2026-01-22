
import React from "react";
import { Link } from "react-router-dom";
import { FileText, MessageSquare, Clock, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import WorkspaceDeleteButton from "./WorkspaceDeleteButton";

interface WorkspaceCardProps {
  id: string;
  name: string;
  description?: string;
  color: string;
  fileCount: number;
  messageCount: number;
  lastActivity: string;
  hasActiveCall?: boolean;
  onDeleted?: () => void;
}

const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  id,
  name,
  description,
  color,
  fileCount,
  messageCount,
  lastActivity,
  hasActiveCall = false,
  onDeleted
}) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-workspace-blue hover:bg-blue-100 border-blue-200",
    purple: "bg-workspace-purple hover:bg-purple-100 border-purple-200",
    green: "bg-workspace-green hover:bg-green-100 border-green-200",
    amber: "bg-workspace-amber hover:bg-amber-100 border-amber-200", 
    pink: "bg-workspace-pink hover:bg-pink-100 border-pink-200"
  };

  const colorClass = colorClasses[color] || colorClasses.blue;

  return (
    <Card className={cn("relative overflow-hidden border transition-all hover:shadow", colorClass)}>
      <Link to={`/workspace/${id}`} className="block">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="w-full">
              <h3 className="font-semibold text-lg truncate text-gray-800">{name}</h3>
              {description && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{description}</p>
              )}
              
              <div className="flex items-center mt-4 space-x-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span>{fileCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>{messageCount}</span>
                </div>
                {hasActiveCall && (
                  <div className="flex items-center gap-1.5 text-green-500">
                    <Video className="h-4 w-4" />
                    <span>Live</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 ml-auto" title="Last activity">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs">{lastActivity}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
      
      <div className="absolute top-3 right-3">
        <WorkspaceDeleteButton 
          workspaceId={id} 
          workspaceName={name} 
          onDeleted={onDeleted} 
        />
      </div>
    </Card>
  );
};

export default WorkspaceCard;
