import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useSocket } from "@/providers/SocketProvider";

export interface Notification {
  _id: string;
  recipient: string;
  actor?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  workspace?: string;
  module: string;
  type: string;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  priority: "low" | "normal" | "high" | "urgent";
  read: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  totalPages: number;
  unreadCount: number;
}

export const useNotificationQueries = (filters: { unreadOnly?: boolean, filter?: string }) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const queryKey = ["notifications", filters];

  const queryInfo = useInfiniteQuery<NotificationResponse>({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: "20",
      });
      if (filters.unreadOnly) params.append("unreadOnly", "true");
      if (filters.filter && filters.filter !== "all") params.append("filter", filters.filter);

      const res = await api.get(`/notifications?${params.toString()}`);
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) return lastPage.page + 1;
      return undefined;
    }
  });

  // Setup WebSocket Listener
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      // Optimistically update notifications list
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (data: any) => {
        if (!data) return data;
        
        const newPages = [...data.pages];
        if (newPages.length > 0) {
          // If unreadOnly filter is true and notification is read, we skip it (but it's unread by default)
          if (filters.filter && filters.filter !== "all" && notification.module !== filters.filter) {
            return data;
          }
          newPages[0] = {
            ...newPages[0],
            notifications: [notification, ...newPages[0].notifications],
            unreadCount: (newPages[0].unreadCount || 0) + 1
          };
        }
        return {
          ...data,
          pages: newPages,
        };
      });
      
      // We also update the unread count globally if needed
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket, queryClient, filters.filter]);

  return queryInfo;
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      const res = await api.get("/notifications?limit=1&unreadOnly=true");
      return res.data.unreadCount as number;
    }
  });
};

export const useNotificationMutations = () => {
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/notifications/mark-all-read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    }
  });

  const archive = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/notifications/${id}/archive`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/notifications/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    }
  });

  return { markAsRead, markAllAsRead, archive, deleteNotification };
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ["notification-settings"],
    queryFn: async () => {
      const res = await api.get("/notifications/settings");
      return res.data;
    }
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preferences: any) => {
      const res = await api.patch("/notifications/settings", { preferences });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
    }
  });
};
