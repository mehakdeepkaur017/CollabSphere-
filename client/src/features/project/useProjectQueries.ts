import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "./project.api";
import type { CreateProjectPayload } from "./project.api";

export const projectKeys = {
  all: (workspaceId: string) => ["projects", workspaceId] as const,
  detail: (workspaceId: string, projectId: string) => [...projectKeys.all(workspaceId), projectId] as const,
};

export const useProjects = (workspaceId: string | undefined) => {
  return useQuery({
    queryKey: projectKeys.all(workspaceId!),
    queryFn: () => projectApi.getProjects(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useProject = (workspaceId: string | undefined, projectId: string | undefined) => {
  return useQuery({
    queryKey: projectKeys.detail(workspaceId!, projectId!),
    queryFn: () => projectApi.getProjectById(workspaceId!, projectId!),
    enabled: !!workspaceId && !!projectId,
  });
};

export const useCreateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectApi.createProject(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all(workspaceId) });
    },
  });
};

export const useUpdateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: Partial<CreateProjectPayload> & { progress?: number } }) => 
      projectApi.updateProject(workspaceId, projectId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(workspaceId, variables.projectId) });
    },
  });
};

export const useDeleteProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectApi.deleteProject(workspaceId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all(workspaceId) });
    },
  });
};

// ================= EXTRAS =================

export const projectExtrasKeys = {
  comments: (projectId: string) => ["project_comments", projectId] as const,
  tasks: (projectId: string) => ["project_tasks", projectId] as const,
  taskComments: (taskId: string) => ["task_comments", taskId] as const,
  attachments: (projectId: string) => ["project_attachments", projectId] as const,
};

export const useProjectComments = (workspaceId: string | undefined, projectId: string | undefined) => {
  return useQuery({
    queryKey: projectExtrasKeys.comments(projectId!),
    queryFn: () => projectApi.getComments(workspaceId!, projectId!),
    enabled: !!workspaceId && !!projectId,
  });
};

export const useAddProjectComment = (workspaceId: string, projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => projectApi.addComment(workspaceId, projectId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectExtrasKeys.comments(projectId) });
    },
  });
};

export const useTaskComments = (taskId: string | undefined) => {
  return useQuery({
    queryKey: projectExtrasKeys.taskComments(taskId!),
    queryFn: () => projectApi.getTaskComments(taskId!),
    enabled: !!taskId,
  });
};

export const useAddTaskComment = (taskId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => projectApi.addTaskComment(taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectExtrasKeys.taskComments(taskId) });
    },
  });
};

export const useDeleteTaskComment = (taskId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => projectApi.deleteTaskComment(taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectExtrasKeys.taskComments(taskId) });
    },
  });
};

export const useProjectTasks = (projectId: string | undefined) => {
  return useQuery({
    queryKey: projectExtrasKeys.tasks(projectId!),
    queryFn: () => projectApi.getTasks(projectId!),
    enabled: !!projectId,
  });
};

export const useMyTasks = (workspaceId: string | undefined) => {
  return useQuery({
    queryKey: ["my_tasks", workspaceId],
    queryFn: async () => {
      const allTasks = await projectApi.getMyTasks();
      // Filter out tasks that belong to a different workspace
      return allTasks.filter((t: any) => t.projectId?.workspaceId === workspaceId);
    },
    enabled: !!workspaceId,
  });
};

export const useAddProjectTask = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => projectApi.addTask({ ...payload, projectId }),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: projectExtrasKeys.tasks(projectId) });
      const previousTasks = queryClient.getQueryData(projectExtrasKeys.tasks(projectId));
      if (previousTasks) {
        queryClient.setQueryData(projectExtrasKeys.tasks(projectId), (old: any) => {
          if (!old) return old;
          return [...old, { ...payload, _id: "temp-" + Date.now(), createdAt: new Date().toISOString() }];
        });
      }
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(projectExtrasKeys.tasks(projectId), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectExtrasKeys.tasks(projectId) });
      queryClient.invalidateQueries({ queryKey: ["my_tasks"] });
    },
  });
};

export const useUpdateProjectTask = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: any }) => 
      projectApi.updateTask(taskId, payload),
    onMutate: async ({ taskId, payload }) => {
      await queryClient.cancelQueries({ queryKey: projectExtrasKeys.tasks(projectId) });
      const previousTasks = queryClient.getQueryData(projectExtrasKeys.tasks(projectId));
      
      const updateFn = (old: any) => {
        if (!old) return old;
        return old.map((t: any) => {
          if (t._id === taskId) {
            const updated = { ...t, ...payload };
            if (payload.progress === 100) updated.status = "completed";
            else if (payload.progress !== undefined && payload.progress < 100 && t.status === "completed" && !payload.status) updated.status = "in-progress";
            else if (payload.status === "completed") updated.progress = 100;
            return updated;
          }
          return t;
        });
      };

      queryClient.setQueryData(projectExtrasKeys.tasks(projectId), updateFn);
      queryClient.setQueriesData({ queryKey: ["my_tasks"] }, updateFn);

      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(projectExtrasKeys.tasks(projectId), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectExtrasKeys.tasks(projectId) });
      queryClient.invalidateQueries({ queryKey: ["my_tasks"] });
    },
  });
};

export const useReorderTasks = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tasks: { _id: string; status: string; order: number }[]) => 
      projectApi.reorderTasks(tasks),
    onMutate: async (newTasks) => {
      await queryClient.cancelQueries({ queryKey: projectExtrasKeys.tasks(projectId) });
      const previousTasks = queryClient.getQueryData(projectExtrasKeys.tasks(projectId));
      // Optimistically update
      if (previousTasks) {
        queryClient.setQueryData(projectExtrasKeys.tasks(projectId), (old: any) => {
          if (!old) return old;
          const updated = [...old];
          newTasks.forEach(nt => {
            const index = updated.findIndex(t => t._id === nt._id);
            if (index !== -1) {
              updated[index] = { ...updated[index], status: nt.status, order: nt.order };
            }
          });
          return updated.sort((a, b) => a.order - b.order);
        });
      }
      return { previousTasks };
    },
    onError: (err, newTasks, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(projectExtrasKeys.tasks(projectId), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectExtrasKeys.tasks(projectId) });
      queryClient.invalidateQueries({ queryKey: ["my_tasks"] });
    },
  });
};

export const useDeleteProjectTask = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => projectApi.deleteTask(taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: projectExtrasKeys.tasks(projectId) });
      const previousTasks = queryClient.getQueryData(projectExtrasKeys.tasks(projectId));
      if (previousTasks) {
        queryClient.setQueryData(projectExtrasKeys.tasks(projectId), (old: any) => {
          if (!old) return old;
          return old.filter((t: any) => t._id !== taskId);
        });
      }
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(projectExtrasKeys.tasks(projectId), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectExtrasKeys.tasks(projectId) });
      queryClient.invalidateQueries({ queryKey: ["my_tasks"] });
    },
  });
};

export const useProjectAttachments = (workspaceId: string | undefined, projectId: string | undefined) => {
  return useQuery({
    queryKey: projectExtrasKeys.attachments(projectId!),
    queryFn: () => projectApi.getAttachments(workspaceId!, projectId!),
    enabled: !!workspaceId && !!projectId,
  });
};

export const useAddProjectAttachment = (workspaceId: string, projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; url: string; size: number; type: string }) => 
      projectApi.addAttachment(workspaceId, projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectExtrasKeys.attachments(projectId) });
    },
  });
};

export const useDeleteProjectAttachment = (workspaceId: string, projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) => projectApi.deleteAttachment(workspaceId, projectId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectExtrasKeys.attachments(projectId) });
    },
  });
};
