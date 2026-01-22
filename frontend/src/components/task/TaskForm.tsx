import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Tag, 
  AlertCircle,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { Thing } from "@/types";
import { createTask } from "@/services/taskService";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface TaskFormProps {
  workspaceId: string;
  initialStatus: Thing['status'];
  onTaskCreated: (task: Thing) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  workspaceId,
  initialStatus = "todo",
  onTaskCreated,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    status: initialStatus,
    priority: "medium",
    category: "General",
    dueDate: format(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 2 days from now
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Please enter a task title");
      return;
    }

    setLoading(true);
    try {
      const task = await createTask({
        ...formData,
        workspaceId,
        completed: formData.status === "done",
      });
      onTaskCreated(task);
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-2 mb-2 text-primary">
          <CheckSquare className="h-5 w-5" />
          <CardTitle className="text-xl">Add New Task</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Define the task, set a priority, and assign it to a column.
        </p>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="px-0 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Task Title</Label>
            <Input
              id="title"
              placeholder="Design system update..."
              value={formData.title}
              onChange={handleChange}
              className="rounded-xl border-gray-200 focus:ring-primary/20 h-11"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => handleSelectChange("status", v as Thing['status'])}
              >
                <SelectTrigger id="status" className="rounded-xl border-gray-200 h-11">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(v) => handleSelectChange("priority", v)}
              >
                <SelectTrigger id="priority" className="rounded-xl border-gray-200 h-11">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="high">
                    <span className="flex items-center text-red-600">
                      <AlertCircle className="h-4 w-4 mr-2" /> High
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center text-blue-600">
                      <AlertCircle className="h-4 w-4 mr-2" /> Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="low">
                    <span className="flex items-center text-gray-600">
                      <AlertCircle className="h-4 w-4 mr-2" /> Low
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                Category
              </Label>
              <Input
                id="category"
                placeholder="Design, Marketing, etc."
                value={formData.category}
                onChange={handleChange}
                className="rounded-xl border-gray-200 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-semibold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                className="rounded-xl border-gray-200 h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this task..."
              value={formData.notes}
              onChange={handleChange}
              className="min-h-[80px] rounded-xl border-gray-200 resize-none py-3"
            />
          </div>
        </CardContent>

        <CardFooter className="px-0 pt-6 flex justify-end gap-3 border-t border-gray-100 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="rounded-full px-6"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Task"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TaskForm;
