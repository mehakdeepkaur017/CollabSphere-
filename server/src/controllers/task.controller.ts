import { Request, Response } from "express";
import { ProjectTask } from "../models/ProjectTask";
import { Project } from "../models/Project";
import { Activity } from "../models/Activity";
import { z } from "zod";
import { getIO } from "../sockets/socketManager";
import { NotificationService } from "../services/notification.service";
import { NotificationModule, NotificationPriority } from "../models/Notification";

async function updateProjectProgress(projectId: string, workspaceId: string) {
  const allTasks = await ProjectTask.find({ projectId });
  const total = allTasks.length;
  const completed = allTasks.filter(t => t.status === "completed").length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const updatedProject = await Project.findByIdAndUpdate(projectId, { progress }, { new: true });
  if (updatedProject) {
    getIO().to(`workspace:${workspaceId}`).emit("project:updated", updatedProject);
  }
}

export const getMyTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tasks = await ProjectTask.find({ assignee: userId })
      .populate("projectId", "name workspaceId")
      .populate("reporter", "name avatar");
    res.json(tasks);
  } catch (error) {
    console.error("Get my tasks error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

const createTaskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "review", "completed", "blocked"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assignee: z.string().optional(),
  labels: z.array(z.string()).default([]),
  dueDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  estimatedTime: z.number().default(0),
});

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const data = createTaskSchema.parse(req.body);

    const project = await Project.findById(data.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Determine order: place at bottom of the status column
    const existingTasks = await ProjectTask.find({ projectId: data.projectId, status: data.status });
    const order = existingTasks.length;

    const task = await ProjectTask.create({
      ...data,
      reporter: userId,
      order,
    });

    const populatedTask = await ProjectTask.findById(task._id)
      .populate("assignee", "name email avatar")
      .populate("reporter", "name email avatar")
      .populate("attachments");

    getIO().to(`workspace:${project.workspaceId}`).emit("task:created", populatedTask);

    const { User } = await import("../models/User");
    const currentUser = await User.findById(userId);
    const userName = currentUser ? currentUser.name : "A member";

    await Activity.create({
      workspaceId: project.workspaceId,
      user: { _id: userId, name: userName, avatar: currentUser?.avatar },
      action: "created_task",
      resourceId: task._id,
      resourceType: "ProjectTask",
      message: `created task "${task.title}"`
    });

    await updateProjectProgress(data.projectId, project.workspaceId.toString());

    // Notify assignee
    if (data.assignee && data.assignee !== userId) {
      await NotificationService.notifyUsers([data.assignee], {
        actorId: userId,
        workspaceId: project.workspaceId.toString(),
        module: NotificationModule.TASK,
        type: 'assigned',
        title: 'New Task Assignment',
        message: `assigned you to "${task.title}"`,
        entityId: task._id.toString(),
        entityType: 'ProjectTask',
        priority: NotificationPriority.HIGH
      });
    }

    res.status(201).json(populatedTask);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const tasks = await ProjectTask.find({ projectId })
      .populate("assignee", "name email avatar")
      .populate("reporter", "name email avatar")
      .populate("attachments")
      .sort({ order: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { taskId } = req.params;
    const updates = req.body;

    const oldTask = await ProjectTask.findById(taskId);
    if (!oldTask) return res.status(404).json({ error: "Task not found" });

    const project = await Project.findById(oldTask.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { Workspace } = await import("../models/Workspace");
    const workspace = await Workspace.findById(project.workspaceId);

    // Check permissions
    const member = workspace?.members.find(m => m.user.toString() === userId);
    if (!member) return res.status(403).json({ error: "Not a workspace member" });

    const canEditAny = ["owner", "admin", "leader"].includes(member.role);
    const isAssignee = oldTask.assignee?.toString() === userId;
    const isReporter = oldTask.reporter?.toString() === userId;

    if (!canEditAny && !isAssignee && !isReporter) {
      return res.status(403).json({ error: "You do not have permission to edit this task" });
    }

    if (updates.progress === 100) {
      updates.status = "completed";
    } else if (updates.progress !== undefined && updates.progress < 100 && oldTask.status === "completed" && !updates.status) {
      updates.status = "in-progress";
    } else if (updates.status === "completed") {
      updates.progress = 100;
    }

    const task = await ProjectTask.findByIdAndUpdate(taskId, { $set: updates }, { new: true })
      .populate("assignee", "name email avatar")
      .populate("reporter", "name email avatar")
      .populate("attachments");

    if (updates.status && updates.status !== oldTask.status) {
      const { User } = await import("../models/User");
      const currentUser = await User.findById(userId);
      const userName = currentUser ? currentUser.name : "A member";

      const isCompleted = updates.status === "completed";
      await Activity.create({
        workspaceId: project!.workspaceId,
        user: { _id: userId, name: userName, avatar: currentUser?.avatar },
        action: isCompleted ? "task_completed" : "moved_task",
        resourceId: task!._id,
        resourceType: "ProjectTask",
        message: isCompleted ? `completed task "${task!.title}"` : `moved task "${task!.title}" to ${updates.status}`
      });

      // Notify assignee of status change
      if (task!.assignee && task!.assignee._id.toString() !== userId) {
        await NotificationService.notifyUsers([task!.assignee._id.toString()], {
          actorId: userId,
          workspaceId: project!.workspaceId.toString(),
          module: NotificationModule.TASK,
          type: isCompleted ? 'completed' : 'status_change',
          title: isCompleted ? 'Task Completed' : 'Task Updated',
          message: isCompleted ? `completed "${task!.title}"` : `moved "${task!.title}" to ${updates.status}`,
          entityId: task!._id.toString(),
          entityType: 'ProjectTask',
          priority: isCompleted ? NotificationPriority.NORMAL : NotificationPriority.LOW
        });
      }
    }

    getIO().to(`workspace:${project!.workspaceId}`).emit("task:updated", task);

    await updateProjectProgress(task!.projectId.toString(), project!.workspaceId.toString());

    res.json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const reorderTasks = async (req: Request, res: Response) => {
  try {
    // Array of { _id: string, status: string, order: number }
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: "No tasks provided" });
    }

    const projectId = (await ProjectTask.findById(tasks[0]._id))?.projectId;

    const bulkOps = tasks.map((t: any) => ({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { status: t.status, order: t.order } }
      }
    }));

    await ProjectTask.bulkWrite(bulkOps);

    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        getIO().to(`workspace:${project.workspaceId}`).emit("task:reordered", { projectId });
      }
    }

    res.json({ message: "Tasks reordered successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { taskId } = req.params;

    const task = await ProjectTask.findByIdAndDelete(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const project = await Project.findById(task.projectId);

    getIO().to(`workspace:${project!.workspaceId}`).emit("task:deleted", { taskId });

    await updateProjectProgress(task.projectId.toString(), project!.workspaceId.toString());

    const { User } = await import("../models/User");
    const currentUser = await User.findById(userId);
    const userName = currentUser ? currentUser.name : "A member";

    await Activity.create({
      workspaceId: project!.workspaceId,
      user: { _id: userId, name: userName, avatar: currentUser?.avatar },
      action: "deleted_task",
      resourceId: taskId,
      resourceType: "ProjectTask",
      message: `deleted task "${task.title}"`
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTaskComments = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { TaskComment } = await import("../models/TaskComment");
    const comments = await TaskComment.find({ taskId }).populate("userId", "name avatar");
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addTaskComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { taskId } = req.params;
    const { content } = req.body;
    
    if (!content) return res.status(400).json({ error: "Content is required" });
    
    const { TaskComment } = await import("../models/TaskComment");
    const comment = await TaskComment.create({ taskId, userId, content });
    
    const populated = await TaskComment.findById(comment._id).populate("userId", "name avatar");
    
    const task = await ProjectTask.findById(taskId);
    if (task) {
      const project = await Project.findById(task.projectId);
      if (project) {
        getIO().to(`workspace:${project.workspaceId}`).emit("task:comment_added", populated);
      }
    }
    
    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTaskComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { taskId, commentId } = req.params;
    
    const { TaskComment } = await import("../models/TaskComment");
    const comment = await TaskComment.findById(commentId);
    
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.userId.toString() !== userId) return res.status(403).json({ error: "Unauthorized" });
    
    await TaskComment.findByIdAndDelete(commentId);
    
    const task = await ProjectTask.findById(taskId);
    if (task) {
      const project = await Project.findById(task.projectId);
      if (project) {
        getIO().to(`workspace:${project.workspaceId}`).emit("task:comment_deleted", { taskId, commentId });
      }
    }
    
    res.json({ message: "Comment deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
