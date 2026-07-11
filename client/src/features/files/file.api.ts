import axios from "axios";
import { api } from "@/lib/api";

export interface File {
  _id: string;
  name: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  url: string;
  workspaceId: string;
  folderId?: string;
  projectId?: string;
  taskId?: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  isPinned: boolean;
  isStarred: boolean;
  deletedAt?: string;
  versions: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  _id: string;
  name: string;
  workspaceId: string;
  parentFolderId?: string;
  createdBy: string;
  color?: string;
  isPinned: boolean;
  isStarred: boolean;
  fileCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StorageStats {
  used: number;
  limit: number;
  percentage: number;
  totalFiles: number;
}

export interface FileComment {
  _id: string;
  fileId: string;
  userId: { _id: string; name: string; email: string; avatar?: string };
  content: string;
  mentions: { _id: string; name: string }[];
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export const fileApi = {
  // Files
  getFiles: async (params: { workspaceId: string; folderId?: string; isStarred?: boolean; search?: string; isDeleted?: boolean }): Promise<File[]> => {
    const { data } = await api.get("/files", { params });
    return data;
  },

  uploadFiles: async (formData: FormData): Promise<File[]> => {
    // We use raw axios to ensure the browser natively handles FormData boundaries
    // without the global api.ts interceptor interfering with the Content-Type header.
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files`;
    try {
      const { data } = await axios.post(url, formData, { withCredentials: true });
      return data;
    } catch (error: any) {
      // Manually handle token refresh if expired, similar to the api.ts interceptor
      if (error.response?.status === 401) {
        await api.post('/auth/refresh');
        const { data } = await axios.post(url, formData, { withCredentials: true });
        return data;
      }
      throw error;
    }
  },

  updateFile: async (id: string, updates: Partial<File>): Promise<File> => {
    const { data } = await api.patch(`/files/${id}`, updates);
    return data;
  },

  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },

  getStorageStats: async (workspaceId: string): Promise<StorageStats> => {
    const { data } = await api.get(`/files/stats/${workspaceId}`);
    return data;
  },

  // Folders
  getFolders: async (params: { workspaceId: string; parentFolderId?: string; isDeleted?: boolean }): Promise<Folder[]> => {
    const { data } = await api.get("/folders", { params });
    return data;
  },

  createFolder: async (payload: { name: string; workspaceId: string; parentFolderId?: string; color?: string }): Promise<Folder> => {
    const { data } = await api.post("/folders", payload);
    return data;
  },

  updateFolder: async (id: string, updates: Partial<Folder>): Promise<Folder> => {
    const { data } = await api.patch(`/folders/${id}`, updates);
    return data;
  },

  deleteFolder: async (id: string): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },

  // Comments
  getComments: async (fileId: string): Promise<FileComment[]> => {
    const { data } = await api.get(`/files/${fileId}/comments`);
    return data;
  },

  createComment: async (fileId: string, payload: { content: string; mentions?: string[] }): Promise<FileComment> => {
    const { data } = await api.post(`/files/${fileId}/comments`, payload);
    return data;
  },

  updateComment: async (id: string, updates: Partial<FileComment>): Promise<FileComment> => {
    const { data } = await api.patch(`/files/comments/${id}`, updates);
    return data;
  },

  deleteComment: async (id: string): Promise<void> => {
    await api.delete(`/files/comments/${id}`);
  },
};
