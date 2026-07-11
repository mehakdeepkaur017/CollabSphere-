import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "./workspace.api";
import type { CreateWorkspacePayload } from "./workspace.api";
import { useWorkspaceStore } from "@/store/workspaceStore";

export const workspaceKeys = {
  all: ["workspaces"] as const,
  detail: (id: string) => [...workspaceKeys.all, id] as const,
};

export const useWorkspaces = () => {
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const query = useQuery({
    queryKey: workspaceKeys.all,
    queryFn: workspaceApi.getWorkspaces,
  });

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      if (!activeWorkspace) {
        setActiveWorkspace(query.data[0]);
      } else {
        const updatedActive = query.data.find((w) => w._id === activeWorkspace._id);
        if (updatedActive && JSON.stringify(updatedActive) !== JSON.stringify(activeWorkspace)) {
          setActiveWorkspace(updatedActive);
        } else if (!updatedActive) {
          // The active workspace was deleted or user lost access
          setActiveWorkspace(query.data[0]);
        }
      }
    } else if (query.isSuccess && query.data && query.data.length === 0) {
      console.log("NO WORKSPACES DETECTED. CLEARING ACTIVE WORKSPACE. current:", activeWorkspace);
      if (activeWorkspace) {
        setActiveWorkspace(null);
      }
    }
  }, [query.data, query.isSuccess, activeWorkspace, setActiveWorkspace]);

  return query;
};

export const useWorkspace = (id: string) => {
  return useQuery({
    queryKey: workspaceKeys.detail(id),
    queryFn: () => workspaceApi.getWorkspaceById(id),
    enabled: !!id,
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const { setActiveWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: (payload: CreateWorkspacePayload) => workspaceApi.createWorkspace(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      setActiveWorkspace(data);
    },
  });
};

export const useJoinWorkspace = () => {
  const queryClient = useQueryClient();
  const { setActiveWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: (inviteCode: string) => workspaceApi.joinWorkspace(inviteCode),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      setActiveWorkspace(data);
    },
  });
};
