import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useChatStore } from "@/store/chatStore";
import { useChannels } from "./useChatQueries";
import { useSocket } from "@/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "./useChatQueries";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatArea } from "./components/ChatArea";
import { WorkspacePanel } from "./components/WorkspacePanel";
import { CreateChannelModal } from "./components/CreateChannelModal";
import { InviteModal } from "./components/InviteModal";
import { CallModal } from "./components/CallModal";
import { GlobalSearchOverlay } from "./components/GlobalSearchOverlay";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/store/authStore";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import type { Channel } from "./chat.api";

export function CollaborationPage() {
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { activeWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { 
    activeChannelId, setActiveChannel, isDetailsPanelOpen, 
    isGlobalSearchOpen, setGlobalSearchOpen,
    isCallOpen, closeCall, activeCallRoom, isCallVideo 
  } = useChatStore();
  const { data: channels } = useChannels(activeWorkspace?._id);
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  // Auto-select the first channel if none is active
  useEffect(() => {
    if (channels && channels.length > 0 && !activeChannelId) {
      setActiveChannel(channels[0]._id);
    }
  }, [channels, activeChannelId, setActiveChannel]);

  // Socket listeners for channel events
  useEffect(() => {
    if (!socket || !activeWorkspace) return;

    const handleNewChannel = (channel: Channel) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.channels(activeWorkspace._id) });
      toast.success(`New space created: ${channel.name}`);
    };

    const handleUpdatedChannel = (channel: Channel) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.channels(activeWorkspace._id) });
    };

    const handleDeletedChannel = (channelId: string) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.channels(activeWorkspace._id) });
      if (activeChannelId === channelId) {
        setActiveChannel(null);
      }
      toast.info("A space was deleted");
    };

    const handleNewMessage = (message: any) => {
      // Optimistic cache update if we want, or just invalidate to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(message.channelId) });
      if (message.threadId) {
        queryClient.invalidateQueries({ queryKey: chatKeys.threadMessages(message.threadId) });
      }
      if (message.sender._id !== user?.id && message.channelId !== activeChannelId) {
        toast(`New message in workspace from ${message.sender.name || 'someone'}`);
      }
    };

    const handleUpdatedMessage = (message: any) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(message.channelId) });
    };

    const handleDeletedMessage = (messageId: string) => {
      // Invalidate all messages for simplicity, since we don't have channelId here
      // Real app might include channelId in payload or update all message queries
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    };

    const handlePresenceUpdate = (data: { userId: string, status: string, timestamp: string }) => {
      // You could push this into a Zustand store for global presence
    };

    socket.on("channel:new", handleNewChannel);
    socket.on("channel:updated", handleUpdatedChannel);
    socket.on("channel:deleted", handleDeletedChannel);
    socket.on("message:new", handleNewMessage);
    socket.on("message:updated", handleUpdatedMessage);
    socket.on("message:deleted", handleDeletedMessage);
    socket.on("presence:update", handlePresenceUpdate);

    return () => {
      socket.off("channel:new", handleNewChannel);
      socket.off("channel:updated", handleUpdatedChannel);
      socket.off("channel:deleted", handleDeletedChannel);
      socket.off("message:new", handleNewMessage);
      socket.off("message:updated", handleUpdatedMessage);
      socket.off("message:deleted", handleDeletedMessage);
      socket.off("presence:update", handlePresenceUpdate);
    };
  }, [socket, activeWorkspace, activeChannelId, setActiveChannel, queryClient]);

  if (!activeWorkspace) {
    return (
      <MotionWrapper variant="page" className="flex flex-1 items-center justify-center h-full bg-[#0c0c0e]">
        <EmptyState
          icon="folder"
          title="No Active Workspace"
          description="Select or create a workspace to start collaborating."
          className="w-full max-w-3xl border-none bg-transparent shadow-none"
          colorClass="bg-indigo-500/10 text-indigo-500"
        />
      </MotionWrapper>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#0c0c0e] overflow-hidden min-h-0 min-w-0">
      {/* Left Sidebar */}
      <ChatSidebar 
        onCreateChannel={() => setIsCreateChannelOpen(true)} 
        onInviteMembers={() => setIsInviteModalOpen(true)}
      />

      {/* Center: Chat Area */}
      <ChatArea />

      {/* Right Sidebar: Workspace Panel */}
      <AnimatePresence>
        {isDetailsPanelOpen && <WorkspacePanel />}
      </AnimatePresence>

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
      />
      
      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Global Search Overlay */}
      <GlobalSearchOverlay 
        isOpen={isGlobalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
      />

      {/* Jitsi Call Modal */}
      <CallModal
        isOpen={isCallOpen}
        onClose={closeCall}
        roomName={activeCallRoom || "Collaboration-Room"}
        userName={user?.name || "Guest"}
        isVideo={isCallVideo}
      />
    </div>
  );
}
