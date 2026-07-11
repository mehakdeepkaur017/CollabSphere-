import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import path from 'path';

import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import channelRoutes from "./routes/channel.routes";
import projectRoutes from "./routes/project.routes";
import whiteboardRoutes from './routes/whiteboard.routes';
import uploadRoutes from './routes/upload.routes';
import filesRoutes from "./routes/files.routes";
import foldersRoutes from "./routes/folders.routes";
import fileCommentsRoutes from "./routes/fileComments.routes";
import inviteRoutes from "./routes/invite.routes";
import taskRoutes from "./routes/task.routes";
import notificationRoutes from "./routes/notification.routes";
import securityRoutes from "./routes/security.routes";
import meetingRoutes from "./routes/meeting.routes";

const app = express();
const httpServer = createServer(app);

// Rate limiting for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Middleware
app.use(helmet());
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:5173', 
  credentials: true 
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Serve static files from public directory
// app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads'))); // No longer needed with Cloudinary

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

import { initSocketManager } from './sockets/socketManager';
initSocketManager(io);

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces', whiteboardRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/files', fileCommentsRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/meetings', meetingRoutes);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collabsphere';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
