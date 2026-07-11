import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect } from "react";
import { useSocket } from "@/providers/SocketProvider";
import { useWorkspaceStore } from "@/store/workspaceStore";

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
  createdBy: any;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  recurring: "none" | "daily" | "weekly" | "monthly";
  color: string;
  participants: any[];
  agenda?: string;
  notes?: string;
  waitingRoom: boolean;
  password?: string;
  jitsiRoomName: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  chatChannelId?: string;
  createdAt: string;
  updatedAt: string;
}

export const meetingKeys = {
  all: ["meetings"] as const,
  list: (workspaceId: string) => [...meetingKeys.all, workspaceId] as const,
  detail: (id: string) => [...meetingKeys.all, "detail", id] as const,
};

export const useMeetings = () => {
  const workspace = useWorkspaceStore((state) => state.activeWorkspace);
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: meetingKeys.list(workspace?._id || ""),
    queryFn: async () => {
      const { data } = await api.get<Meeting[]>(`/meetings`, {
        params: { workspaceId: workspace?._id },
      });
      return data;
    },
    enabled: !!workspace?._id,
  });

  useEffect(() => {
    if (!socket || !workspace?._id) return;

    const handleCreated = (newMeeting: Meeting) => {
      queryClient.setQueryData(meetingKeys.list(workspace._id), (old: Meeting[] = []) => {
        return [...old, newMeeting].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });
    };

    const handleUpdated = (updatedMeeting: Meeting) => {
      queryClient.setQueryData(meetingKeys.list(workspace._id), (old: Meeting[] = []) => {
        return old.map((m) => (m._id === updatedMeeting._id ? updatedMeeting : m));
      });
      queryClient.setQueryData(meetingKeys.detail(updatedMeeting._id), updatedMeeting);
    };

    const handleDeleted = (id: string) => {
      queryClient.setQueryData(meetingKeys.list(workspace._id), (old: Meeting[] = []) => {
        return old.filter((m) => m._id !== id);
      });
    };

    socket.on("meeting:created", handleCreated);
    socket.on("meeting:updated", handleUpdated);
    socket.on("meeting:status_changed", handleUpdated);
    socket.on("meeting:deleted", handleDeleted);

    return () => {
      socket.off("meeting:created", handleCreated);
      socket.off("meeting:updated", handleUpdated);
      socket.off("meeting:status_changed", handleUpdated);
      socket.off("meeting:deleted", handleDeleted);
    };
  }, [socket, workspace?._id, queryClient]);

  return query;
};

export const useMeeting = (id: string) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: meetingKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<Meeting>(`/meetings/${id}`);
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("meeting:join", { meetingId: id });

    const handleNotesUpdated = ({ meetingId, notes }: { meetingId: string; notes: string }) => {
      if (meetingId === id) {
        queryClient.setQueryData(meetingKeys.detail(id), (old: Meeting | undefined) => {
          if (!old) return old;
          return { ...old, notes };
        });
      }
    };

    socket.on("meeting:notes_updated", handleNotesUpdated);

    return () => {
      socket.emit("meeting:leave", { meetingId: id });
      socket.off("meeting:notes_updated", handleNotesUpdated);
    };
  }, [socket, id, queryClient]);

  return query;
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  const workspace = useWorkspaceStore((state) => state.activeWorkspace);

  return useMutation({
    mutationFn: async (payload: Partial<Meeting>) => {
      const { data } = await api.post<Meeting>("/meetings", payload);
      return data;
    },
    onSuccess: () => {
      if (workspace) {
        queryClient.invalidateQueries({ queryKey: meetingKeys.list(workspace._id) });
      }
    },
  });
};

export const useUpdateMeetingStatus = () => {
  const queryClient = useQueryClient();
  const workspace = useWorkspaceStore((state) => state.activeWorkspace);

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Meeting["status"] }) => {
      const { data } = await api.patch<Meeting>(`/meetings/${id}/status`, { status });
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(meetingKeys.detail(data._id), data);
      if (workspace) {
        queryClient.invalidateQueries({ queryKey: meetingKeys.list(workspace._id) });
      }
    },
  });
};

export const useUpdateMeetingNotes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data } = await api.patch<Meeting>(`/meetings/${id}/notes`, { notes });
      return data;
    },
    onSuccess: (data) => {
      // Optistic update handles local UI, this handles the actual save
      queryClient.setQueryData(meetingKeys.detail(data._id), data);
    },
  });
};

export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();
  const workspace = useWorkspaceStore((state) => state.activeWorkspace);

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/meetings/${id}`);
      return data;
    },
    onSuccess: () => {
      if (workspace) {
        queryClient.invalidateQueries({ queryKey: meetingKeys.list(workspace._id) });
      }
    },
  });
};
