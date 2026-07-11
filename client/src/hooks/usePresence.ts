import { useEffect, useState } from 'react';
import { useSocket } from '../providers/SocketProvider';

export const usePresence = () => {
  const { socket, isConnected } = useSocket();
  // Map of userId -> status
  const [presenceMap, setPresenceMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handlePresenceUpdate = ({ userId, status }: { userId: string, status: string, timestamp: string }) => {
      setPresenceMap(prev => ({
        ...prev,
        [userId]: status
      }));
    };

    socket.on('presence:update', handlePresenceUpdate);

    return () => {
      socket.off('presence:update', handlePresenceUpdate);
    };
  }, [socket, isConnected]);

  const isUserOnline = (userId: string) => {
    return presenceMap[userId] === 'online';
  };

  return {
    presenceMap,
    isUserOnline
  };
};
