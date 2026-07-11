import { create } from "zustand";

interface ChatState {
  activeChannelId: string | null;
  isDetailsPanelOpen: boolean;
  activeThreadId: string | null;

  isGlobalSearchOpen: boolean;
  isCallOpen: boolean;
  activeCallRoom: string | null;
  isCallVideo: boolean;

  setActiveChannel: (id: string | null) => void;
  toggleDetailsPanel: () => void;
  setDetailsPanel: (open: boolean) => void;
  openThread: (messageId: string) => void;
  closeThread: () => void;
  
  setGlobalSearchOpen: (open: boolean) => void;
  openCall: (roomName: string, isVideo: boolean) => void;
  closeCall: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChannelId: null,
  isDetailsPanelOpen: false,
  activeThreadId: null,
  isGlobalSearchOpen: false,
  isCallOpen: false,
  activeCallRoom: null,
  isCallVideo: false,

  setActiveChannel: (id) => set({ activeChannelId: id, activeThreadId: null }),
  toggleDetailsPanel: () => set((s) => ({ isDetailsPanelOpen: !s.isDetailsPanelOpen })),
  setDetailsPanel: (open) => set({ isDetailsPanelOpen: open }),
  openThread: (messageId) => set({ activeThreadId: messageId, isDetailsPanelOpen: true }),
  closeThread: () => set({ activeThreadId: null }),

  setGlobalSearchOpen: (open) => set({ isGlobalSearchOpen: open }),
  openCall: (roomName, isVideo) => set({ isCallOpen: true, activeCallRoom: roomName, isCallVideo: isVideo }),
  closeCall: () => set({ isCallOpen: false, activeCallRoom: null }),
}));
