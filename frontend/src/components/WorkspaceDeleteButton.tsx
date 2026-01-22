
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteWorkspace } from "@/services/workspace/workspace.mutations";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WorkspaceDeleteButtonProps {
  workspaceId: string;
  workspaceName: string;
  onDeleted?: () => void;
}

const WorkspaceDeleteButton: React.FC<WorkspaceDeleteButtonProps> = ({
  workspaceId,
  workspaceName,
  onDeleted,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteWorkspace(workspaceId);
      
      if (!success) {
        throw new Error("Failed to delete workspace");
      }
      
      toast({
        title: "Workspace deleted",
        description: `${workspaceName} and all associated data have been removed.`,
      });
      
      if (onDeleted) {
        // Call the passed callback to update parent component state
        onDeleted();
      } else {
        // If we're on the workspace page, redirect to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast({
        title: "Error",
        description: "Failed to delete workspace. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost" 
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        aria-label={`Delete ${workspaceName}`}
        className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm text-red-500 hover:text-red-600 hover:bg-red-50 shadow-sm"
      >
        {isDeleting ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Trash className="h-4 w-4" />
        )}
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{workspaceName}</strong>? This will permanently remove the workspace and all its data, including files, messages, and invoices. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkspaceDeleteButton;
