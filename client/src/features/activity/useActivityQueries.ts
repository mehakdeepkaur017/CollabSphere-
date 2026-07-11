import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/providers/SocketProvider";

export interface ActivityUser {
  _id: string;
  name: string;
  avatar?: string;
}

export interface Activity {
  _id: string;
  workspaceId: string;
  user: ActivityUser;
  action: string;
  resourceId?: string;
  resourceType?: string;
  message: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityResponse {
  activities: Activity[];
  total: number;
  page: number;
  totalPages: number;
}

export const useActivityQueries = (workspaceId: string, filters: { type?: string, dateRange?: string, search?: string }) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const queryKey = ["activities", workspaceId, filters];

  const queryInfo = useInfiniteQuery<ActivityResponse>({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: "20",
      });
      if (filters.type && filters.type !== "all") params.append("type", filters.type);
      if (filters.dateRange) params.append("dateRange", filters.dateRange);
      if (filters.search) params.append("search", filters.search);

      const res = await api.get(`/workspaces/${workspaceId}/activities?${params.toString()}`);
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) return lastPage.page + 1;
      return undefined;
    },
    enabled: !!workspaceId,
  });

  // Setup WebSocket Listener
  useEffect(() => {
    if (!socket || !workspaceId) return;

    const handleNewActivity = (activity: Activity) => {
      // If we are filtering, we could decide whether to inject it based on filters.
      // For simplicity, let's just invalidate the query if there's a search filter,
      // or prepend it if we are looking at 'all' or matching type.
      
      const isMatchingType = !filters.type || filters.type === "all" || activity.resourceType === filters.type;
      const isMatchingSearch = !filters.search || activity.message.toLowerCase().includes(filters.search.toLowerCase());
      
      if (isMatchingType && isMatchingSearch) {
        queryClient.setQueryData(queryKey, (data: any) => {
          if (!data) return data;
          
          const newPages = [...data.pages];
          if (newPages.length > 0) {
            newPages[0] = {
              ...newPages[0],
              activities: [activity, ...newPages[0].activities],
            };
          }
          return {
            ...data,
            pages: newPages,
          };
        });
      }
    };

    socket.on("activity:new", handleNewActivity);

    return () => {
      socket.off("activity:new", handleNewActivity);
    };
  }, [socket, workspaceId, filters, queryClient, queryKey]);

  return queryInfo;
};
