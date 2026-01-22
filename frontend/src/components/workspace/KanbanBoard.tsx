import React, { useState } from "react";
import { Thing } from "@/types";
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  Trash2,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface KanbanBoardProps {
  tasks: Thing[];
  onUpdateStatus: (taskId: string, status: Thing['status']) => void;
  onAddTask: (status: Thing['status']) => void;
  onDeleteTask: (taskId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onUpdateStatus, onAddTask, onDeleteTask }) => {
  const columns: { id: Thing['status']; title: string; color: string }[] = [
    { id: "todo", title: "To Do", color: "text-blue-600 bg-blue-50" },
    { id: "in-progress", title: "In Progress", color: "text-amber-600 bg-amber-50" },
    { id: "done", title: "Done", color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
      {columns.map((column) => (
        <div key={column.id} className="flex flex-col h-full bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge className={`${column.color} border-none font-bold py-1 px-3`}>
                {column.title}
              </Badge>
              <span className="text-sm text-muted-foreground font-medium">
                {tasks.filter((t) => t.status === column.id).length}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white"
              onClick={() => onAddTask(column.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            <AnimatePresence>
              {tasks
                .filter((t) => t.status === column.id)
                .map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onUpdateStatus={onUpdateStatus} 
                    onDeleteTask={onDeleteTask}
                  />
                ))}
            </AnimatePresence>
            
            {tasks.filter((t) => t.status === column.id).length === 0 && (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <p className="text-xs text-muted-foreground">No tasks here yet</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-primary mt-2 h-auto p-0"
                  onClick={() => onAddTask(column.id)}
                >
                  Create first task
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

interface TaskCardProps {
  task: Thing;
  onUpdateStatus: (taskId: string, status: Thing['status']) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateStatus, onDeleteTask }) => {
  const priorityColors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-blue-100 text-blue-700",
    low: "bg-gray-100 text-gray-700",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Badge className={`${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium} border-none text-[10px] uppercase font-bold px-1.5 py-0`}>
              {task.priority}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => onDeleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h4 className="font-semibold text-sm mb-3 line-clamp-2 leading-snug">
            {task.title}
          </h4>

          <div className="flex flex-wrap gap-3 mt-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            {task.category && (
              <div className="flex items-center gap-1.5 font-medium">
                <Tag className="h-3.5 w-3.5" />
                {task.category}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            <div className="flex gap-1">
              {task.status !== 'todo' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full hover:bg-gray-100"
                  onClick={() => onUpdateStatus(task.id, task.status === 'done' ? 'in-progress' : 'todo')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-1">
              {task.status !== 'done' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full hover:bg-gray-100"
                  onClick={() => onUpdateStatus(task.id, task.status === 'todo' ? 'in-progress' : 'done')}
                >
                  <ChevronRight className="h-4 w-4 font-bold" />
                </Button>
              )}
              {task.status === 'done' && (
                <div className="h-7 w-7 flex items-center justify-center text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default KanbanBoard;
