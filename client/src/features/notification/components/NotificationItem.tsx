import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { Notification } from "../useNotificationQueries";
import {
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
  Check,
  Archive,
  Trash2,
  User,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useNotificationMutations } from "../useNotificationQueries";

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { markAsRead, archive, deleteNotification } = useNotificationMutations();

  const getModuleIcon = () => {
    switch (notification.module) {
      case "Chat": return <MessageSquare className="h-4 w-4" />;
      case "File": return <FileText className="h-4 w-4" />;
      case "Task": return <CheckCircle2 className="h-4 w-4" />;
      case "Project": return <Users className="h-4 w-4" />;
      case "Workspace": return <User className="h-4 w-4" />;
      case "Planner": return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case "high":
      case "urgent": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-primary bg-primary/10 border-primary/20";
    }
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "group relative flex gap-4 p-4 rounded-xl border transition-all cursor-pointer",
        notification.read
          ? "bg-black/20 border-white/5 opacity-80"
          : "bg-white/5 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]",
        "hover:bg-white/10 hover:border-white/20"
      )}
      onClick={() => onClick(notification)}
    >
      {/* Unread Glow Accent */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
      )}

      {/* Actor Avatar */}
      <div className="relative shrink-0">
        {notification.actor ? (
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarImage src={notification.actor.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary font-medium">
              {notification.actor.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center border", getPriorityColor())}>
            {getModuleIcon()}
          </div>
        )}
        
        {notification.actor && (
          <div className={cn("absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-background shadow-sm", getPriorityColor())}>
            {getModuleIcon()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground leading-snug">
            {notification.actor && <span className="font-bold mr-1">{notification.actor.name}</span>}
            <span className="text-muted-foreground">{notification.message}</span>
          </p>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-white/10 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 border-white/10 bg-black/95 backdrop-blur-xl">
                {!notification.read && (
                  <DropdownMenuItem onClick={(e) => handleAction(e, () => markAsRead.mutate(notification._id))}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={(e) => handleAction(e, () => archive.mutate(notification._id))}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={(e) => handleAction(e, () => deleteNotification.mutate(notification._id))}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
