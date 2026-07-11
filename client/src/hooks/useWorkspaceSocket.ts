import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../providers/SocketProvider';
import { workspaceKeys } from '../features/workspace/useWorkspaceQueries';
import { projectKeys } from '../features/project/useProjectQueries';
import type { Workspace } from '../store/workspaceStore';
import type { Project } from '../features/project/project.api';

export const useWorkspaceSocket = (workspaceId?: string) => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected || !workspaceId) return;

    const roomId = `workspace:${workspaceId}`;
    socket.emit('room:join', { roomId });

    const handleWorkspaceUpdated = (workspace: Workspace) => {
      // If we got removed from the workspace, this event won't have us in members, 
      // but to be safe, we have a dedicated workspace:removed event
      queryClient.setQueryData(workspaceKeys.detail(workspace._id), workspace);
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    };

    const handleWorkspaceRemoved = (removedWorkspaceId: string) => {
      if (removedWorkspaceId === workspaceId) {
        window.location.href = '/app'; // Kick them out to the main app dashboard
      }
    };

    const handleProjectCreated = (project: Project) => {
      queryClient.setQueryData(projectKeys.all(workspaceId), (oldData: Project[] | undefined) => {
        if (!oldData || oldData.length === 0) {
          // Trigger confetti on first project!
          import('canvas-confetti').then((confetti) => {
            confetti.default({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#10b981', '#3b82f6', '#6366f1']
            });
          });
          return [project];
        }
        // Check if it already exists to prevent duplicates
        if (oldData.some(p => p._id === project._id)) return oldData;
        return [project, ...oldData];
      });
    };

    const handleProjectUpdated = (project: Project) => {
      queryClient.setQueryData(projectKeys.detail(workspaceId, project._id), project);
      queryClient.setQueryData(projectKeys.all(workspaceId), (oldData: Project[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(p => p._id === project._id ? project : p);
      });
    };

    const handleProjectDeleted = ({ projectId }: { projectId: string }) => {
      queryClient.setQueryData(projectKeys.all(workspaceId), (oldData: Project[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(p => p._id !== projectId);
      });
    };

    // The Activity feed isn't explicitly requested to be stored in cache yet,
    // so we can just trigger a toast or something similar, or update a new state if needed.
    const handleActivity = (activity: { message: string, timestamp: string }) => {
      console.log('New Activity:', activity);
      // Optional: Add to a local Zustand store for toasts/notifications
    };

    socket.on('workspace:updated', handleWorkspaceUpdated);
    socket.on('workspace:removed', handleWorkspaceRemoved);
    socket.on('project:created', handleProjectCreated);
    socket.on('project:updated', handleProjectUpdated);
    socket.on('project:deleted', handleProjectDeleted);
    socket.on('activity:new', handleActivity);

    return () => {
      socket.emit('room:leave', { roomId });
      socket.off('workspace:updated', handleWorkspaceUpdated);
      socket.off('workspace:removed', handleWorkspaceRemoved);
      socket.off('project:created', handleProjectCreated);
      socket.off('project:updated', handleProjectUpdated);
      socket.off('project:deleted', handleProjectDeleted);
      socket.off('activity:new', handleActivity);
    };
  }, [socket, isConnected, workspaceId, queryClient]);
};
