import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Activity {
  _id: string;
  workspaceId: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  resourceId?: string;
  resourceType?: string;
  message: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const activityKeys = {
  all: (workspaceId: string) => ["activities", workspaceId] as const,
};

export const useActivities = (workspaceId?: string) => {
  return useQuery({
    queryKey: activityKeys.all(workspaceId!),
    queryFn: async () => {
      const response = await api.get<{ activities: Activity[] }>(`/workspaces/${workspaceId}/activities`);
      return response.data.activities;
    },
    enabled: !!workspaceId,
  });
};
