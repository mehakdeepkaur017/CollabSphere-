import { create } from 'zustand'
import { api } from '../lib/api'

export type UserRole = 'student' | 'team_leader'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  verified: boolean
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  checkAuth: () => Promise<void>
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user, isLoading: false })
    import('./workspaceStore').then(({ useWorkspaceStore }) => {
      useWorkspaceStore.getState().setActiveWorkspace(null)
    })
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me')
      set({ user: response.data.user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false })
      import('./workspaceStore').then(({ useWorkspaceStore }) => {
        useWorkspaceStore.getState().setActiveWorkspace(null)
      })
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error("Logout failed", error)
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false })
      // Explicitly clear the persisted workspace state when logging out
      import('./workspaceStore').then(({ useWorkspaceStore }) => {
        useWorkspaceStore.getState().setActiveWorkspace(null)
      })
    }
  }
}))
