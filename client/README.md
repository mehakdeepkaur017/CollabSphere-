# 🚀 CollabSphere

> **A Modern Real-Time Collaborative Workspace Platform**
>
> CollabSphere is a full-stack collaboration platform that enables teams to communicate, manage projects, collaborate in real-time, share files, conduct meetings, maintain documentation, and organize work—all within a unified workspace.

---

## 📖 Overview

CollabSphere is designed to bring together the essential tools required for productive teamwork into a single application. Inspired by platforms like Slack, Notion, ClickUp, Trello, Microsoft Teams, and Discord, it provides a seamless collaboration experience with a modern glassmorphism interface and real-time synchronization.

The platform eliminates the need to switch between multiple applications by integrating communication, project management, documentation, meetings, whiteboards, and file management under one workspace.

---

# ✨ Features

## 🏢 Workspace Management

- Create and manage multiple workspaces
- Invite members using email invitations
- Role-based access control (Owner, Admin, Member)
- Workspace settings and customization
- Member management

---

## 💬 Real-Time Communication

- Workspace chat channels
- Project discussions
- Rich text messaging
- Emoji reactions
- File attachments
- Message search
- Real-time messaging using Socket.IO
- Online presence indicators

---

## 📁 File Management

- Upload files and folders
- Folder organization
- Drag & Drop uploads
- File previews
- File comments
- Version tracking
- Storage statistics
- Search & filters
- Batch operations

---

## 📋 Project Management

- Create unlimited projects
- Project overview dashboard
- Kanban task board
- Task creation and editing
- Task assignment
- Status tracking
- Due dates
- Priorities
- Labels
- Checklists
- Activity history
- Timeline view
- Calendar view

---

## ✅ Personal Task Manager

- Assigned tasks
- Overdue tasks
- Upcoming tasks
- Completed tasks
- Task progress tracking

---

## 📅 Planner

- Daily planner
- Monthly calendar
- Event scheduling
- Upcoming meetings
- Task deadlines

---

## 📚 Knowledge Hub

- Block-based document editor
- Nested pages
- Rich text editing
- Code blocks
- Checklists
- Quotes
- Slash commands
- Drag-and-drop blocks
- Word count
- Reading time estimation

---

## 🎨 Collaborative Whiteboard

- Shared drawing board
- Sticky notes
- Shapes
- Real-time collaboration
- Workspace whiteboards

---

## 🎥 Meetings

- Jitsi Meet integration
- Video conferencing
- Collaborative meeting notes
- Participant management
- Whiteboard integration
- Meeting chat

---

## 🔔 Notification Center

- Real-time notifications
- Mentions
- Task updates
- Project notifications
- File notifications
- Read/Unread management
- Notification preferences

---

## 📊 Activity Center

- Workspace activity feed
- Project activities
- File activities
- Member activities
- Search
- Filters
- Infinite scrolling

---


# ⚡ Real-Time Features

- Live chat
- Live notifications
- Online users
- Activity updates
- Meeting synchronization
- Collaborative notes
- Whiteboard synchronization

---

# 🎨 UI Highlights

- Modern Glassmorphism UI
- Dark Theme
- Framer Motion animations
- Responsive layouts
- Beautiful gradients
- Smooth transitions
- Premium cards
- Skeleton loading
- Interactive dashboards

---

# 🛠 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- TanStack Query
- Zustand
- React Router
- React Hook Form
- React Flow
- Recharts
- Lucide Icons

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication
- Multer
- Cloudinary
- bcrypt
- AES Encryption

---

## Real-Time

- Socket.IO
- WebSockets

---

## Video Meetings

- Jitsi Meet SDK

---

# 📂 Project Structure

```
CollabSphere/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   └── utils/
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── sockets/
│   ├── utils/
│   └── config/
│
└── README.md
```

---

# 🔐 Authentication

- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- 

---

# 📸 Major Modules

- Workspace Dashboard
- Chat
- Projects
- Tasks
- Files
- Planner
- Meetings
- Whiteboard
- Knowledge Hub
- Activity Center
- Notifications
- Integrations
- Settings

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/CollabSphere.git
```

## Navigate

```bash
cd CollabSphere
```

## Install Dependencies

### Client

```bash
cd client
npm install
```

### Server

```bash
cd server
npm install
```

---

## Environment Variables

Create a `.env` file in the server directory.

```env
PORT=5000

MONGO_URI=

JWT_SECRET=



CLIENT_URL=http://localhost:5173
```

---

## Run Backend

```bash
npm run dev
```

---

## Run Frontend

```bash
npm run dev
```

---

# 📌 Future Enhancements

- Mobile Application
- AI Meeting Summaries
- AI Task Suggestions
- Real Google OAuth
- Voice Channels
- Screen Recording
- Desktop Application
- Offline Support
- PWA Support

---

