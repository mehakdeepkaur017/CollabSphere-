import { api } from "@/lib/api";

// ===== Types =====

export interface Channel {
  _id: string;
  workspaceId: string;
  projectId?: string;
  name: string;
  description?: string;
  icon?: string;
  type: "public" | "private" | "direct" | "project";
  members: ChannelMember[];
  createdBy: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelMember {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Message {
  _id: string;
  channelId: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  type: "text" | "file" | "system";
  fileDetails?: {
    url: string;
    name: string;
    size: number;
    mimeType: string;
  };
  reactions: { emoji: string; users: string[] }[];
  mentions: { _id: string; name: string }[];
  threadId?: string;
  isPinned: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== API =====

export const chatApi = {
  // Channels
  getChannels: async (workspaceId: string): Promise<Channel[]> => {
    const { data } = await api.get(`/workspaces/${workspaceId}/channels`);
    return data;
  },

  createChannel: async (
    workspaceId: string,
    payload: { name: string; description?: string; type?: string; members?: string[] }
  ): Promise<Channel> => {
    const { data } = await api.post(`/workspaces/${workspaceId}/channels`, payload);
    return data;
  },

  updateChannel: async (
    workspaceId: string,
    channelId: string,
    payload: { name?: string; description?: string; isArchived?: boolean }
  ): Promise<Channel> => {
    const { data } = await api.patch(`/workspaces/${workspaceId}/channels/${channelId}`, payload);
    return data;
  },

  deleteChannel: async (workspaceId: string, channelId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/channels/${channelId}`);
  },

  // Messages
  getMessages: async (
    workspaceId: string,
    channelId: string,
    page: number = 1,
    limit: number = 50,
    threadId?: string
  ): Promise<{ messages: Message[]; nextPage: number | null; hasMore: boolean }> => {
    const params: any = { page, limit };
    if (threadId) params.threadId = threadId;
    const { data } = await api.get(`/workspaces/${workspaceId}/channels/${channelId}/messages`, { params });
    return data;
  },

  sendMessage: async (
    workspaceId: string,
    channelId: string,
    payload: {
      content: string;
      type?: string;
      fileDetails?: { url: string; name: string; size: number; mimeType: string };
      mentions?: string[];
      threadId?: string;
    }
  ): Promise<Message> => {
    const { data } = await api.post(`/workspaces/${workspaceId}/channels/${channelId}/messages`, payload);
    return data;
  },

  updateMessage: async (
    workspaceId: string,
    channelId: string,
    messageId: string,
    payload: { content?: string; isPinned?: boolean }
  ): Promise<Message> => {
    const { data } = await api.patch(
      `/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}`,
      payload
    );
    return data;
  },

  deleteMessage: async (workspaceId: string, channelId: string, messageId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}`);
  },

  toggleReaction: async (
    workspaceId: string,
    channelId: string,
    messageId: string,
    emoji: string
  ): Promise<Message> => {
    const { data } = await api.post(
      `/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}/reactions`,
      { emoji }
    );
    return data;
  },
};
