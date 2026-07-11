import { useQuery } from "@tanstack/react-query"
import { useWorkspaceStore } from "@/store/workspaceStore"

export interface WhiteboardMeta {
  id: string
  name: string
  updatedAt: string
}

export function useWhiteboardList(workspaceId?: string) {
  const { activeWorkspace } = useWorkspaceStore()
  return useQuery({
    queryKey: ['workspace', workspaceId, 'whiteboards'],
    queryFn: async (): Promise<WhiteboardMeta[]> => {
      // Temporary placeholder: since the backend only supports 1 whiteboard per workspace,
      // we'll mock a list containing just the main workspace whiteboard for the dashboard.
      if (!activeWorkspace) return []
      
      return [
        {
          id: 'default',
          name: `${activeWorkspace.name} Board`,
          updatedAt: new Date().toISOString()
        }
      ]
    },
    enabled: !!workspaceId
  })
}
