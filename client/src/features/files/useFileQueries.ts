import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fileApi } from "./file.api";
import type { File, Folder } from "./file.api";



export const fileKeys = {
  all: ["files"] as const,
  lists: () => [...fileKeys.all, "list"] as const,
  list: (params: any) => [...fileKeys.lists(), params] as const,
  stats: (workspaceId: string) => [...fileKeys.all, "stats", workspaceId] as const,
};

export const folderKeys = {
  all: ["folders"] as const,
  lists: () => [...folderKeys.all, "list"] as const,
  list: (params: any) => [...folderKeys.lists(), params] as const,
};

export const useFiles = (params: { workspaceId?: string; folderId?: string; isStarred?: boolean; search?: string; isDeleted?: boolean }) => {
  return useQuery({
    queryKey: fileKeys.list(params),
    queryFn: () => fileApi.getFiles(params as any),
  });
};

export const useFolders = (params: { workspaceId?: string; parentFolderId?: string; isDeleted?: boolean }) => {
  return useQuery({
    queryKey: folderKeys.list(params),
    queryFn: () => fileApi.getFolders(params as any),
  });
};

export const useStorageStats = (workspaceId?: string) => {
  return useQuery({
    queryKey: fileKeys.stats(workspaceId!),
    queryFn: () => fileApi.getStorageStats(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useUploadFiles = (workspaceId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fileApi.uploadFiles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
    },
  });
};

export const useUpdateFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<File> }) => fileApi.updateFile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fileApi.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all });
    },
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fileApi.createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Folder> }) => fileApi.updateFolder(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fileApi.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
};

// ===== Comments =====

export const useFileComments = (fileId: string | undefined) => {
  return useQuery({
    queryKey: ["fileComments", fileId],
    queryFn: () => fileApi.getComments(fileId!),
    enabled: !!fileId,
  });
};

export const useCreateFileComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fileId, payload }: { fileId: string; payload: { content: string; mentions?: string[] } }) =>
      fileApi.createComment(fileId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["fileComments", variables.fileId] });
    },
  });
};

export const useUpdateFileComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => fileApi.updateComment(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fileComments", data.fileId] });
    },
  });
};

export const useDeleteFileComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fileId }: { id: string; fileId: string }) => fileApi.deleteComment(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["fileComments", variables.fileId] });
    },
  });
};
