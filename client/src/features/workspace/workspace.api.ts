import { api } from "@/lib/api";
import type { Workspace } from "@/store/workspaceStore";

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
  academicYear?: string;
  semester?: string;
  department?: string;
  privacy: "public" | "private";
  theme?: string;
  icon?: string;
}

export const workspaceApi = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    const { data } = await api.get("/workspaces");
    return data;
  },
  
  getWorkspaceById: async (id: string): Promise<Workspace> => {
    const { data } = await api.get(`/workspaces/${id}`);
    return data;
  },

  createWorkspace: async (payload: CreateWorkspacePayload): Promise<Workspace> => {
    const { data } = await api.post("/workspaces", payload);
    return data;
  },

  joinWorkspace: async (inviteCode: string): Promise<Workspace> => {
    const { data } = await api.post("/workspaces/join", { inviteCode });
    return data;
  },

  updateWorkspace: async (id: string, payload: Partial<CreateWorkspacePayload>): Promise<Workspace> => {
    const { data } = await api.patch(`/workspaces/${id}`, payload);
    return data;
  }
};
