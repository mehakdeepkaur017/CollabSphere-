import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { chatApi } from "./chat.api";
import { useAuthStore } from "@/store/authStore";

export const chatKeys = {
  channels: (workspaceId: string) => ["channels", workspaceId] as const,
  messages: (channelId: string) => ["messages", channelId] as const,
  threadMessages: (threadId: string) => ["thread_messages", threadId] as const,
};

// ===== Channels =====

export const useChannels = (workspaceId: string | undefined) => {
  return useQuery({
    queryKey: chatKeys.channels(workspaceId!),
    queryFn: () => chatApi.getChannels(workspaceId!),
    enabled: !!workspaceId,
  });
};

export const useCreateChannel = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; type?: string; members?: string[] }) =>
      chatApi.createChannel(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.channels(workspaceId) });
    },
  });
};

export const useUpdateChannel = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      channelId,
      payload,
    }: {
      channelId: string;
      payload: { name?: string; description?: string; isArchived?: boolean };
    }) => chatApi.updateChannel(workspaceId, channelId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.channels(workspaceId) });
    },
  });
};

export const useDeleteChannel = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (channelId: string) => chatApi.deleteChannel(workspaceId, channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.channels(workspaceId) });
    },
  });
};

// ===== Messages =====

export const useMessages = (workspaceId: string | undefined, channelId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(channelId!),
    queryFn: ({ pageParam = 1 }) => chatApi.getMessages(workspaceId!, channelId!, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!workspaceId && !!channelId,
  });
};

export const useThreadMessages = (workspaceId: string | undefined, channelId: string | undefined, threadId: string | undefined) => {
  return useQuery({
    queryKey: chatKeys.threadMessages(threadId!),
    queryFn: () => chatApi.getMessages(workspaceId!, channelId!, 1, 50, threadId),
    enabled: !!workspaceId && !!channelId && !!threadId,
  });
};

export const useSendMessage = (workspaceId: string, channelId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore.getState();

  return useMutation({
    mutationFn: (payload: {
      content: string;
      type?: string;
      fileDetails?: { url: string; name: string; size: number; mimeType: string };
      mentions?: string[];
      threadId?: string;
    }) => chatApi.sendMessage(workspaceId, channelId, payload),
    onMutate: async (newMsgPayload) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: chatKeys.messages(channelId) });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(chatKeys.messages(channelId));

      // Optimistically update to the new value
      queryClient.setQueryData(chatKeys.messages(channelId), (old: any) => {
        if (!old || !old.pages || old.pages.length === 0) return old;
        const optimisticMessage = {
          _id: `temp-${Date.now()}`,
          content: newMsgPayload.content,
          channelId,
          sender: {
            _id: user?.id || "me", // fixed _id to id for local user
            name: user?.name || "Me",
            email: user?.email || "",
          },
          type: newMsgPayload.type || "text",
          fileDetails: newMsgPayload.fileDetails,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPending: true, // Custom flag to show a sending state
          reactions: [],
        };
        
        // Add to the FIRST page (since we are prepending? No, getMessages returns chronological array.)
        // Actually, if we fetch older messages, they go to page 2. Page 1 is the latest messages.
        // Wait, if page 1 is latest, and we scroll UP to get page 2 (older), then the NEWEST message should be added to the END of page 1.
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          messages: [...newPages[0].messages, optimisticMessage],
        };
        return { ...old, pages: newPages };
      });

      return { previousMessages };
    },
    onError: (err, newMsgPayload, context: any) => {
      // Rollback
      queryClient.setQueryData(chatKeys.messages(channelId), context.previousMessages);
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to sync fully
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(channelId) });
      if (variables.threadId) {
        queryClient.invalidateQueries({ queryKey: chatKeys.threadMessages(variables.threadId) });
      }
    },
  });
};

export const useUpdateMessage = (workspaceId: string, channelId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, payload }: { messageId: string; payload: { content?: string; isPinned?: boolean } }) =>
      chatApi.updateMessage(workspaceId, channelId, messageId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(channelId) });
    },
  });
};

export const useDeleteMessage = (workspaceId: string, channelId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => chatApi.deleteMessage(workspaceId, channelId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(channelId) });
    },
  });
};

export const useToggleReaction = (workspaceId: string, channelId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      chatApi.toggleReaction(workspaceId, channelId, messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(channelId) });
    },
  });
};
