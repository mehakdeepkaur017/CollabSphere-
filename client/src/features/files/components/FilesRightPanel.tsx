import React from "react";
import { motion } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { formatDistanceToNow } from "date-fns";

export function FilesRightPanel() {
  const activities = [
    { id: 1, user: "Mehakdeep", action: "uploaded", file: "DesignSystem.pdf", time: new Date(Date.now() - 1000 * 60 * 2) },
    { id: 2, user: "Rahul", action: "edited", file: "Requirements.docx", time: new Date(Date.now() - 1000 * 60 * 15) },
    { id: 3, user: "Aman", action: "deleted", file: "OldPrototype.fig", time: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  ];

  return (
    <div className="w-72 bg-[#111116] border-l border-white/5 flex flex-col h-full flex-shrink-0 relative overflow-hidden hidden lg:flex">
      <div className="h-16 flex items-center px-5 border-b border-white/5 shrink-0 bg-white/[0.01]">
        <h2 className="font-semibold text-white/90 text-sm tracking-wide">Activity Feed</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        <div className="relative border-l border-white/10 ml-3 space-y-6">
          {activities.map((activity) => (
            <motion.div 
              key={activity.id} 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative pl-6"
            >
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-[#111116] border-2 border-indigo-500" />
              <div className="flex flex-col gap-1">
                <p className="text-xs text-white/80 leading-relaxed">
                  <span className="font-semibold text-white">{activity.user}</span> {activity.action} <span className="font-medium text-indigo-400">{activity.file}</span>
                </p>
                <span className="text-[10px] text-white/40 font-medium">
                  {formatDistanceToNow(activity.time, { addSuffix: true })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
