import { useQuery } from "@tanstack/react-query"

export interface QuickFile {
  id: string
  name: string
  url: string
  uploadedAt: string
  uploadedBy: string
}

export function useQuickFiles(workspaceId?: string) {
  return useQuery({
    queryKey: ['workspace', workspaceId, 'files'],
    queryFn: async (): Promise<QuickFile[]> => {
      // Temporary placeholder: returning empty array since backend route does not exist yet.
      return []
    },
    enabled: !!workspaceId
  })
}
