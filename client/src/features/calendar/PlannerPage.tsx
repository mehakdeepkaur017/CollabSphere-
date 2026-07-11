import React, { useState, useEffect } from "react";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { Icons } from "@/components/shared/icons";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { motion, AnimatePresence } from "framer-motion";

export function PlannerPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const storageKey = `collabsphere-planner-${activeWorkspace?._id || 'default'}`;
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(true);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setContent(saved);
  }, [storageKey]);

  // Auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(storageKey, content);
      setIsSaved(true);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [content, storageKey]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const features = [
    {
      icon: Icons.activity, // Will use lightbulb if available, else activity
      iconColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
      title: "Brainstorm Freely",
      description: "Capture ideas and thoughts without limits."
    },
    {
      icon: Icons.list,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
      title: "Organize Easily",
      description: "Structure your plans the way you like."
    },
    {
      icon: Icons.calendar,
      iconColor: "text-pink-400",
      bgColor: "bg-pink-500/10",
      title: "Plan Effectively",
      description: "Turn ideas into actionable steps."
    },
    {
      icon: Icons.target,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      title: "Stay Focused",
      description: "Keep everything in one place and track progress."
    }
  ];

  return (
    <MotionWrapper variant="page" className="flex flex-col h-full bg-[#0a0a0f] text-white overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto w-full p-8 md:p-12 flex flex-col gap-8 relative pb-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
              Planner
              <Icons.sparkles className="w-6 h-6 text-indigo-400" />
            </h1>
            <p className="text-white/50 text-base">Your personal space to brainstorm, draft, and plan things out.</p>
          </div>

          {/* Right side with save status and illustration */}
          <div className="flex items-center gap-8 mt-6 md:mt-0 relative">
            
            {/* The decorative illustration */}
            <div className="hidden md:flex relative mr-12 items-center justify-center">
              <div className="absolute w-[300px] h-20 bg-indigo-500/20 blur-[60px] rounded-full top-1/2 -translate-y-1/2" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[-60px] w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent rotate-12 blur-[1px]" />
              
              <div className="relative w-20 h-24 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md transform -rotate-6 flex items-center justify-center">
                <div className="w-12 h-1 bg-white/30 rounded-full absolute top-6 left-4" />
                <div className="w-8 h-1 bg-white/30 rounded-full absolute top-10 left-4" />
                <div className="w-10 h-1 bg-white/30 rounded-full absolute top-14 left-4" />
                <div className="w-2 h-2 rounded-full bg-rose-400 absolute top-5 right-4 shadow-[0_0_10px_rgba(251,113,133,0.8)]" />
              </div>
              <div className="absolute -bottom-2 -right-4 w-12 h-12 bg-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] transform rotate-45 border-2 border-[#0a0a0f] flex items-center justify-center">
                <Icons.pencil className="w-5 h-5 text-white transform -rotate-45" />
              </div>
              
              <Icons.star className="w-3 h-3 text-indigo-400 absolute -top-4 -left-8 animate-pulse" />
              <Icons.sparkles className="w-4 h-4 text-purple-400 absolute top-2 -right-12 animate-pulse delay-75" />
            </div>

            <div className="flex items-center gap-2 text-[13px] font-medium text-white/50 bg-white/[0.02] px-4 py-2 rounded-full border border-white/5 shadow-sm">
              {isSaved ? (
                <><Icons.check className="w-4 h-4 text-emerald-400" /> Saved</>
              ) : (
                <><Icons.spinner className="w-4 h-4 animate-spin text-indigo-400" /> Saving...</>
              )}
            </div>
          </div>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full relative z-10">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${feature.bgColor}`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white/90 text-sm mb-1">{feature.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scratchpad Window */}
        <div className="w-full flex-1 min-h-[500px] flex flex-col bg-[#0f0e17] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mt-4">
          
          {/* Window Header */}
          <div className="h-14 border-b border-white/5 flex items-center px-6 bg-white/[0.01]">
            <div className="flex gap-2.5 opacity-80">
              <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
            </div>
            
            <div className="flex-1 flex justify-center">
              <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-white/30">
                Personal Scratchpad
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-white/30">
              <button className="hover:text-white/70 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              </button>
              <button className="hover:text-white/70 transition-colors">
                <Icons.settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Window Content */}
          <div className="flex-1 relative bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:32px_32px]">
            
            <AnimatePresence>
              {!content && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-[40px] rounded-full" />
                    <div className="relative w-24 h-28 bg-gradient-to-b from-indigo-500/40 to-purple-600/40 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm flex items-center justify-center">
                      <div className="w-14 h-1.5 bg-white/30 rounded-full absolute top-7 left-5" />
                      <div className="w-10 h-1.5 bg-white/30 rounded-full absolute top-12 left-5" />
                      <div className="w-12 h-1.5 bg-white/30 rounded-full absolute top-17 left-5" />
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 absolute top-6 right-5" />
                    </div>
                    <div className="absolute -bottom-3 -right-5 w-14 h-14 bg-indigo-500 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.5)] border-[3px] border-[#0f0e17] flex items-center justify-center">
                      <Icons.pencil className="w-6 h-6 text-white" />
                    </div>
                    <Icons.star className="w-3 h-3 text-purple-400 absolute -top-4 -left-6 animate-pulse" />
                    <Icons.sparkles className="w-5 h-5 text-indigo-400 absolute top-4 -right-8 animate-pulse delay-100" />
                    <Icons.star className="w-2 h-2 text-pink-400 absolute bottom-4 -left-4 animate-pulse delay-200" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">Start typing your plans here...</h3>
                  <p className="text-white/40 text-sm">Use this space as a scratchpad for your ideas and plans.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <textarea
              value={content}
              onChange={handleChange}
              className="absolute inset-0 w-full h-full bg-transparent p-8 md:p-12 text-white/90 placeholder:text-transparent resize-none outline-none leading-relaxed text-lg custom-scrollbar z-10"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </MotionWrapper>
  );
}
