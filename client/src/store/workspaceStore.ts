import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WorkspaceMember {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: "owner" | "leader" | "member";
  joinedAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  academicYear?: string;
  semester?: string;
  department?: string;
  privacy: "public" | "private";
  theme: string;
  icon: string;
  accentColor?: string;
  timezone?: string;
  language?: string;
  banner?: string;
  url?: string;
  inviteCode: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  members: WorkspaceMember[];
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceState {
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspace: null,
      setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
    }),
    {
      name: "collabsphere-workspace-storage",
    }
  )
);
