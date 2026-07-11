import { useQuery } from "@tanstack/react-query"

export interface PlannerEvent {
  id: string
  title: string
  date: string
  type: 'deadline' | 'meeting' | 'event'
}

export function usePlannerEvents(workspaceId?: string) {
  return useQuery({
    queryKey: ['workspace', workspaceId, 'planner'],
    queryFn: async (): Promise<PlannerEvent[]> => {
      // Temporary placeholder: returning empty array since backend route does not exist yet.
      return []
    },
    enabled: !!workspaceId
  })
}
