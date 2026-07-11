import { create } from "zustand";

export interface ActiveMeetingState {
  meetingId: string | null;
  activePanel: "chat" | "notes" | "participants" | "whiteboard" | null;
  jitsiApi: any | null;
  isHost: boolean;
  
  setMeetingId: (id: string | null) => void;
  setActivePanel: (panel: "chat" | "notes" | "participants" | "whiteboard" | null) => void;
  setJitsiApi: (api: any) => void;
  setIsHost: (isHost: boolean) => void;
  reset: () => void;
}

export const useMeetingStore = create<ActiveMeetingState>((set) => ({
  meetingId: null,
  activePanel: null,
  jitsiApi: null,
  isHost: false,
  
  setMeetingId: (id) => set({ meetingId: id }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setJitsiApi: (api) => set({ jitsiApi: api }),
  setIsHost: (isHost) => set({ isHost }),
  reset: () => set({ meetingId: null, activePanel: null, jitsiApi: null, isHost: false }),
}));
