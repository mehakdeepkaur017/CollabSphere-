import { api } from "@/lib/api";

export interface ProjectMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ProjectLabel {
  _id: string;
  name: string;
  color: string;
}

export interface ProjectMilestone {
  _id: string;
  name: string;
  dueDate?: string;
  isCompleted: boolean;
}

export interface Project {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  progress: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "planning" | "active" | "review" | "completed" | "archived";
  dueDate?: string;
  tags: string[];
  members: ProjectMember[];
  labels: ProjectLabel[];
  milestones: ProjectMilestone[];
  isTemplate?: boolean;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "planning" | "active" | "review" | "completed" | "archived";
  dueDate?: string;
  tags?: string[];
  members?: string[];
  labels?: Omit<ProjectLabel, "_id">[];
  milestones?: Omit<ProjectMilestone, "_id">[];
  isTemplate?: boolean;
  coverImage?: string;
}

export interface TaskSubtask {
  _id: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface TaskChecklistItem {
  _id: string;
  content: string;
  isCompleted: boolean;
}

export interface TaskChecklist {
  _id: string;
  title: string;
  items: TaskChecklistItem[];
}

export interface ProjectTask {
  _id: string;
  projectId: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "review" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: ProjectMember;
  reporter: ProjectMember;
  labels: string[]; 
  dueDate?: string;
  order: number;
  estimatedTime?: number;
  timeSpent?: number;
  progress?: number;
  subtasks: TaskSubtask[];
  checklists: TaskChecklist[];
  attachments: any[]; // File refs
  dependencies: string[];
  milestone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  projectId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  labels?: string[];
  dueDate?: string;
  estimatedTime?: number;
}

export const projectApi = {
  getProjects: async (workspaceId: string): Promise<Project[]> => {
    const { data } = await api.get(`/workspaces/${workspaceId}/projects`);
    return data;
  },
  
  getProjectById: async (workspaceId: string, projectId: string): Promise<Project> => {
    const { data } = await api.get(`/workspaces/${workspaceId}/projects/${projectId}`);
    return data;
  },

  createProject: async (workspaceId: string, payload: CreateProjectPayload): Promise<Project> => {
    const { data } = await api.post(`/workspaces/${workspaceId}/projects`, payload);
    return data;
  },

  updateProject: async (workspaceId: string, projectId: string, payload: Partial<CreateProjectPayload> & { progress?: number }): Promise<Project> => {
    const { data } = await api.patch(`/workspaces/${workspaceId}/projects/${projectId}`, payload);
    return data;
  },

  deleteProject: async (workspaceId: string, projectId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}`);
  },

  // Tasks
  getTasks: async (projectId: string): Promise<ProjectTask[]> => {
    const { data } = await api.get(`/tasks/project/${projectId}`);
    return data;
  },
  getMyTasks: async (): Promise<ProjectTask[]> => {
    const { data } = await api.get(`/tasks/my-tasks`);
    return data;
  },
  addTask: async (payload: CreateTaskPayload): Promise<ProjectTask> => {
    const { data } = await api.post(`/tasks`, payload);
    return data;
  },
  updateTask: async (taskId: string, payload: Partial<ProjectTask>): Promise<ProjectTask> => {
    const { data } = await api.patch(`/tasks/${taskId}`, payload);
    return data;
  },
  reorderTasks: async (tasks: { _id: string; status: string; order: number }[]): Promise<void> => {
    await api.post(`/tasks/reorder`, { tasks });
  },
  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },

  getTaskComments: async (taskId: string): Promise<any[]> => {
    const { data } = await api.get(`/tasks/${taskId}/comments`);
    return data;
  },
  addTaskComment: async (taskId: string, content: string): Promise<any> => {
    const { data } = await api.post(`/tasks/${taskId}/comments`, { content });
    return data;
  },
  deleteTaskComment: async (taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  getComments: async (workspaceId: string, projectId: string): Promise<any[]> => {
    const { data } = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/comments`);
    return data;
  },
  addComment: async (workspaceId: string, projectId: string, content: string): Promise<any> => {
    const { data } = await api.post(`/workspaces/${workspaceId}/projects/${projectId}/comments`, { content });
    return data;
  },
  getAttachments: async (workspaceId: string, projectId: string): Promise<any[]> => {
    const { data } = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/attachments`);
    return data;
  },
  addAttachment: async (workspaceId: string, projectId: string, payload: any): Promise<any> => {
    const { data } = await api.post(`/workspaces/${workspaceId}/projects/${projectId}/attachments`, payload);
    return data;
  },
  deleteAttachment: async (workspaceId: string, projectId: string, attachmentId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/attachments/${attachmentId}`);
  }
};
