import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/providers/SocketProvider";

interface TypingUser {
  userId: string;
  userName: string;
}

export function TypingIndicator({ channelId }: { channelId: string }) {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleStart = ({ userId, userName }: TypingUser) => {
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === userId)) return prev;
        return [...prev, { userId, userName }];
      });
    };

    const handleStop = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    socket.on("chat:typing_start", handleStart);
    socket.on("chat:typing_stop", handleStop);

    return () => {
      socket.off("chat:typing_start", handleStart);
      socket.off("chat:typing_stop", handleStop);
    };
  }, [socket, channelId]);

  // Clean stale typing after timeout
  useEffect(() => {
    setTypingUsers([]);
  }, [channelId]);

  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.userName);
  let text = "";
  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing`;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="px-5 pb-1"
      >
        <div className="flex items-center gap-2 text-xs text-white/40">
          <div className="flex gap-[3px]">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-[5px] h-[5px] rounded-full bg-emerald-400"
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          <span className="font-medium">{text}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
