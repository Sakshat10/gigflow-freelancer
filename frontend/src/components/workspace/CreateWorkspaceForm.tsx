import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workspace } from "@/types";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { createWorkspace } from "@/services/workspace";

interface CreateWorkspaceFormProps {
  onWorkspaceCreated: (workspace: Workspace) => void;
  onCancel?: () => void;
}

const colors = [
  { name: "blue", class: "bg-blue-400", hover: "hover:ring-blue-200" },
  { name: "purple", class: "bg-purple-400", hover: "hover:ring-purple-200" },
  { name: "green", class: "bg-emerald-400", hover: "hover:ring-emerald-200" },
  { name: "amber", class: "bg-amber-400", hover: "hover:ring-amber-200" },
  { name: "pink", class: "bg-rose-400", hover: "hover:ring-rose-200" },
];

const CreateWorkspaceForm: React.FC<CreateWorkspaceFormProps> = ({
  onWorkspaceCreated,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [color, setColor] = useState("blue");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    setLoading(true);

    try {
      // Create workspace via backend API
      const newWorkspace = await createWorkspace({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        clientEmail: clientEmail.trim() || undefined,
      });

      toast.success("Workspace created successfully!");
      onWorkspaceCreated(newWorkspace);
    } catch (error: any) {
      console.error("Error creating workspace:", error);
      toast.error(error.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Create New Workspace</CardTitle>
        <p className="text-sm text-muted-foreground">
          Set up a new workspace for your client
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workspace Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Acme Corp Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this workspace..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <Label>Workspace Color</Label>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={`
                    w-10 h-10 rounded-full ${c.class} ${c.hover}
                    transition-all duration-200 ring-2 ring-offset-2
                    ${color === c.name ? "ring-gray-900 scale-110" : "ring-transparent"}
                    hover:scale-105 flex items-center justify-center
                  `}
                >
                  {color === c.name && (
                    <Check className="h-5 w-5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 rounded-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateWorkspaceForm;
