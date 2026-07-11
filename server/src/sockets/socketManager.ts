import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";

let io: Server;

// Track connected users: userId -> Map<socketId, status>
// This allows a single user to be connected from multiple tabs
const connectedUsers = new Map<string, Map<string, { status: string, lastActive: Date }>>();

export const initSocketManager = (socketIoServer: Server) => {
  io = socketIoServer;

  // Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.match(/accessToken=([^;]+)/)?.[1];
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    
    // Add to connected users
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Map());
      // Only broadcast online status when the first socket connects
      broadcastPresence(userId, "online");
    }
    connectedUsers.get(userId)!.set(socket.id, { status: "online", lastActive: new Date() });

    console.log(`User ${userId} connected (Socket: ${socket.id})`);

    // Join a specific room for this user to receive direct events (like workspace:removed)
    socket.join(`user:${userId}`);

    // Room Management
    socket.on("room:join", ({ roomId }: { roomId: string }) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("room:leave", ({ roomId }: { roomId: string }) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Typing Indicators
    socket.on("typing:start", ({ roomId }) => {
      socket.to(roomId).emit("typing:start", { userId });
    });

    socket.on("typing:stop", ({ roomId }) => {
      socket.to(roomId).emit("typing:stop", { userId });
    });

    // Viewing Indicators
    socket.on("project:viewing", ({ roomId }) => {
      socket.to(roomId).emit("project:viewing", { userId });
    });

    socket.on("project:stop_viewing", ({ roomId }) => {
      socket.to(roomId).emit("project:stop_viewing", { userId });
    });

    // Whiteboard Sync
    socket.on("whiteboard:cursor-move", ({ roomId, userId, name, x, y, color }) => {
      socket.to(roomId).emit("whiteboard:cursor-move", { userId, name, x, y, color });
    });
    
    socket.on("whiteboard:object-add", ({ roomId, object }) => {
      socket.to(roomId).emit("whiteboard:object-add", { object });
    });
    
    socket.on("whiteboard:object-update", ({ roomId, object }) => {
      socket.to(roomId).emit("whiteboard:object-update", { object });
    });
    
    socket.on("whiteboard:object-delete", ({ roomId, objectId }) => {
      socket.to(roomId).emit("whiteboard:object-delete", { objectId });
    });
    
    socket.on("whiteboard:clear", ({ roomId }) => {
      socket.to(roomId).emit("whiteboard:clear");
    });

    // Chat: Join/Leave Channel rooms
    socket.on("channel:join", ({ channelId }: { channelId: string }) => {
      socket.join(`channel:${channelId}`);
    });

    socket.on("channel:leave", ({ channelId }: { channelId: string }) => {
      socket.leave(`channel:${channelId}`);
    });

    // Meeting: Join/Leave Meeting rooms (for live notes, etc)
    socket.on("meeting:join", ({ meetingId }: { meetingId: string }) => {
      socket.join(`meeting_${meetingId}`);
    });

    socket.on("meeting:leave", ({ meetingId }: { meetingId: string }) => {
      socket.leave(`meeting_${meetingId}`);
    });

    // Chat: Typing indicators
    socket.on("chat:typing_start", ({ channelId, userName }: { channelId: string; userName: string }) => {
      socket.to(`channel:${channelId}`).emit("chat:typing_start", { userId, userName });
    });

    socket.on("chat:typing_stop", ({ channelId }: { channelId: string }) => {
      socket.to(`channel:${channelId}`).emit("chat:typing_stop", { userId });
    });

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected (Socket: ${socket.id})`);
      
      const userSockets = connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        
        // If this was the last socket for this user, they are truly offline
        if (userSockets.size === 0) {
          connectedUsers.delete(userId);
          broadcastPresence(userId, "offline");
        }
      }
    });
  });
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Helper to broadcast presence to all connected clients
// In a real app, this might be restricted to specific workspaces
const broadcastPresence = (userId: string, status: "online" | "offline" | "away") => {
  if (io) {
    io.emit("presence:update", {
      userId,
      status,
      timestamp: new Date().toISOString()
    });
  }
};

export const getConnectedUsers = () => Array.from(connectedUsers.keys());
