import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Use an ID or fetch from a global store. For this example, we assume there's a workspace ID available, or we just fetch the active workspace from context.
import { useWorkspaceStore } from "@/store/workspaceStore";

export function useWorkspaceSettings() {
  const workspace = useWorkspaceStore((state) => state.activeWorkspace);
  const queryClient = useQueryClient();

  const updateWorkspaceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/workspaces/${workspace?._id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  return { updateWorkspace: updateWorkspaceMutation };
}

export function useWorkspaceAnalytics() {
  const workspace = useWorkspaceStore((state) => state.activeWorkspace);
  return useQuery({
    queryKey: ["workspace-analytics", workspace?._id],
    queryFn: async () => {
      const response = await api.get(`/workspaces/${workspace?._id}/analytics`);
      return response.data;
    },
    enabled: !!workspace?._id,
  });
}

export function useWorkspaceRoles() {
  const workspace = useWorkspaceStore((state) => state.activeWorkspace);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["workspace-roles", workspace?._id],
    queryFn: async () => {
      const response = await api.get(`/workspaces/${workspace?._id}/roles`);
      return response.data;
    },
    enabled: !!workspace?._id,
  });

  const createRole = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/workspaces/${workspace?._id}/roles`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-roles"] }),
  });

  const updateRole = useMutation({
    mutationFn: async ({ roleId, data }: { roleId: string; data: any }) => {
      const response = await api.put(`/workspaces/${workspace?._id}/roles/${roleId}`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-roles"] }),
  });

  const deleteRole = useMutation({
    mutationFn: async (roleId: string) => {
      const response = await api.delete(`/workspaces/${workspace?._id}/roles/${roleId}`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-roles"] }),
  });

  return { ...query, createRole, updateRole, deleteRole };
}

export function useSecuritySessions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["security-sessions"],
    queryFn: async () => {
      const response = await api.get("/security/sessions");
      return response.data;
    },
  });

  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.delete(`/security/sessions/${sessionId}`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["security-sessions"] }),
  });

  const revokeAll = useMutation({
    mutationFn: async () => {
      const response = await api.delete("/security/sessions");
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["security-sessions"] }),
  });

  return { ...query, revokeSession, revokeAll };
}

export function useDangerZone() {
  const workspace = useWorkspaceStore((state) => state.activeWorkspace);
  const queryClient = useQueryClient();

  const deleteWorkspace = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/workspaces/${workspace?._id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      window.location.href = "/app";
    },
  });

  const transferOwnership = useMutation({
    mutationFn: async (newOwnerId: string) => {
      const response = await api.post(`/workspaces/${workspace?._id}/transfer-ownership`, { newOwnerId });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
  });

  return { deleteWorkspace, transferOwnership };
}

export function useWorkspaceMembers() {
  const workspace = useWorkspaceStore((state) => state.activeWorkspace);
  const queryClient = useQueryClient();

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await api.delete(`/workspaces/${workspace?._id}/members/${memberId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const response = await api.put(`/workspaces/${workspace?._id}/members/${memberId}`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  return { removeMember, updateMemberRole };
}
