import React from "react";
import { motion } from "framer-motion";
import { Icons } from "@/components/shared/icons";

interface EmptyStateProps {
  icon: any;
  title: string;
  subtitle: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, subtitle, primaryAction, secondaryAction }: EmptyStateProps) {
  const isMainWorkspaceEmpty = title === "Your workspace is empty";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center h-full w-full mx-auto"
    >
      <div className="relative mb-8 w-64 h-56 flex items-center justify-center">
        {/* Background glow */}
        <div className="absolute w-48 h-48 bg-purple-500/10 blur-[50px] rounded-full" />
        
        {/* Illustration */}
        {isMainWorkspaceEmpty ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Swoosh lines and airplane */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="200" height="150" className="absolute top-4 left-4" style={{ overflow: 'visible' }}>
                <path d="M 40,120 Q -20,80 30,30 T 160,20" fill="none" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 120,130 Q 180,100 160,20" fill="none" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>
              <Icons.send className="absolute top-2 right-6 w-5 h-5 text-purple-400 transform -rotate-45" fill="currentColor" />
            </div>

            {/* Subtle leaves */}
            <div className="absolute bottom-12 left-10 w-8 h-8 rounded-tl-full rounded-br-full bg-[#351e60] transform -rotate-12" />
            <div className="absolute bottom-8 left-6 w-6 h-6 rounded-tl-full rounded-br-full bg-[#2a1744] transform -rotate-45" />
            
            <div className="absolute bottom-12 right-12 w-8 h-8 rounded-tr-full rounded-bl-full bg-[#351e60] transform rotate-12" />
            <div className="absolute bottom-8 right-8 w-6 h-6 rounded-tr-full rounded-bl-full bg-[#2a1744] transform rotate-45" />

            {/* Folder Base */}
            <div className="relative z-10 w-40 h-28 mt-12">
              {/* Back flap */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-[#452889] rounded-xl transform -skew-x-6 rounded-tl-sm shadow-xl" />
              <div className="absolute bottom-16 left-4 right-16 h-8 bg-[#452889] rounded-t-xl" />

              {/* Paper */}
              <div className="absolute bottom-10 left-12 w-20 h-24 bg-white rounded-t-lg shadow-lg flex flex-col pt-3 px-3 gap-2 border border-purple-200">
                <div className="w-10 h-1.5 bg-purple-200 rounded-full" />
                <div className="w-14 h-1.5 bg-purple-100 rounded-full" />
                <div className="w-12 h-1.5 bg-purple-100 rounded-full" />
                <div className="w-16 h-1.5 bg-purple-100 rounded-full" />
              </div>

              {/* Front flap */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-br from-[#6b3deb] to-[#4523a7] rounded-xl shadow-[0_0_40px_rgba(107,61,235,0.4)] backdrop-blur-md border border-purple-400/20" />
            </div>

            {/* Sparkles */}
            <Icons.sparkles className="absolute top-12 left-12 w-4 h-4 text-purple-400" />
            <Icons.star className="absolute bottom-16 right-4 w-3 h-3 text-purple-400" />
            <Icons.star className="absolute top-20 right-16 w-2 h-2 text-purple-300" />
            <Icons.star className="absolute bottom-20 left-4 w-2 h-2 text-purple-300" />
          </div>
        ) : (
          <motion.div 
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/10 to-[#9d4edd]/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-2xl shadow-purple-500/10 relative"
          >
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full opacity-50" />
            <Icon className="w-10 h-10 relative z-10" />
          </motion.div>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{title}</h3>
      <p className="text-sm text-white/50 mb-8 leading-relaxed max-w-sm">{subtitle}</p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        {secondaryAction && (
          <button 
            onClick={secondaryAction.onClick}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-white/10 bg-[#16161f] hover:bg-white/5 text-white text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Icons.folderPlus className="w-4 h-4 text-white/70" />
            {secondaryAction.label}
          </button>
        )}
        {primaryAction && (
          <button 
            onClick={primaryAction.onClick}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-[#9d4edd] hover:from-purple-400 hover:to-[#7b2cbf] text-white text-sm font-medium transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            <Icons.uploadCloud className="w-4 h-4" />
            {primaryAction.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}
