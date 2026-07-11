import { useEffect, useState } from 'react';
import { useSocket } from '../providers/SocketProvider';
import { useAuthStore } from '../store/authStore';

export interface ProjectUser {
  userId: string;
  name: string;
}

export const useProjectSocket = (projectId?: string) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();
  const [typingUsers, setTypingUsers] = useState<ProjectUser[]>([]);
  const [viewingUsers, setViewingUsers] = useState<ProjectUser[]>([]);

  useEffect(() => {
    if (!socket || !isConnected || !projectId || !user) return;

    const roomId = `project:${projectId}`;
    socket.emit('room:join', { roomId });
    
    // Announce viewing
    socket.emit('project:viewing', { roomId, userId: user.id, name: user.name });

    const handleTypingStart = (data: ProjectUser) => {
      setTypingUsers(prev => {
        if (prev.some(u => u.userId === data.userId)) return prev;
        return [...prev, data];
      });
    };

    const handleTypingStop = (data: ProjectUser) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    const handleViewing = (data: ProjectUser) => {
      if (data.userId === user.id) return;
      setViewingUsers(prev => {
        if (prev.some(u => u.userId === data.userId)) return prev;
        return [...prev, data];
      });
    };

    const handleStopViewing = (data: ProjectUser) => {
      setViewingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('project:viewing', handleViewing);
    socket.on('project:stop_viewing', handleStopViewing);

    return () => {
      socket.emit('project:stop_viewing', { roomId, userId: user.id, name: user.name });
      socket.emit('room:leave', { roomId });
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('project:viewing', handleViewing);
      socket.off('project:stop_viewing', handleStopViewing);
    };
  }, [socket, isConnected, projectId, user]);

  const emitTypingStart = () => {
    if (socket && isConnected && projectId && user) {
      socket.emit('typing:start', { roomId: `project:${projectId}`, userId: user.id, name: user.name });
    }
  };

  const emitTypingStop = () => {
    if (socket && isConnected && projectId && user) {
      socket.emit('typing:stop', { roomId: `project:${projectId}`, userId: user.id, name: user.name });
    }
  };

  return {
    typingUsers,
    viewingUsers,
    emitTypingStart,
    emitTypingStop
  };
};
