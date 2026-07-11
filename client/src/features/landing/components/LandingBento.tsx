import * as React from "react"
import { motion } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { cn } from "@/lib/utils"

function ShowcaseCard({ 
  title, 
  description, 
  icon,
  children 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <motion.div 
      whileHover="hover"
      className="group relative flex flex-col md:flex-row h-full min-h-[350px] overflow-hidden rounded-[2rem] bg-[#0A0A10] border border-white/5 transition-all duration-500 hover:bg-[#0F0F18] hover:border-white/10 hover:shadow-2xl hover:shadow-purple-500/10"
    >
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay" />
      
      {/* Left Area (40-45%) */}
      <div className="relative z-10 w-full md:w-[45%] p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-r from-transparent to-black/20">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-white/10 text-white/80 group-hover:bg-purple-500/20 group-hover:text-purple-400 group-hover:border-purple-500/30 transition-colors">
          {icon}
        </div>
        <h3 className="mb-3 text-2xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-white/50 leading-relaxed text-sm">{description}</p>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mt-8 opacity-50 group-hover:bg-white/10 group-hover:opacity-100 transition-all duration-300 border border-white/5">
          <Icons.arrowRight className="w-4 h-4 text-white" />
        </div>
      </div>
      
      {/* Abstract Interactive Preview (55%) */}
      <div className="relative w-full md:w-[55%] min-h-[280px] md:min-h-0 flex items-center justify-center overflow-hidden preserve-3d perspective-1000 bg-black/20">
        {/* Subtle background glow */}
        <div className="absolute w-64 h-64 bg-purple-500/5 rounded-full blur-[80px]" />
        {children}
      </div>
    </motion.div>
  )
}

export function LandingBento() {
  return (
    <section id="features" className="relative w-full max-w-7xl mx-auto py-32 px-6">
      
      {/* Title Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="mb-20 text-center"
      >
        <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">Built for Modern Teams.</h2>
        <p className="text-xl text-white/50 max-w-2xl mx-auto">Everything you need to orchestrate a project from inception to delivery, inside a premium real-time environment.</p>
      </motion.div>

      {/* Strict 2x3 Grid matching reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-[350px]">
        
        {/* 1. Smart Projects */}
        <ShowcaseCard 
          title="Smart Projects" 
          description="Organize tasks, track progress, set deadlines, and manage everything in one place."
          icon={<Icons.folder className="w-5 h-5" />}
        >
          <motion.div 
            variants={{ hover: { rotateX: 15, rotateZ: -10, scale: 1.05 } }}
            initial={{ rotateX: 20, rotateZ: -15, rotateY: 5 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-48 h-48 bg-[#111116] border border-white/10 rounded-2xl p-5 shadow-2xl relative z-10 flex flex-col gap-4"
          >
            <div className="w-2/3 h-2 bg-white/10 rounded-full" />
            <div className="w-full h-10 bg-white/5 rounded-xl border border-white/5 flex items-center px-3"><div className="w-1/2 h-1.5 bg-white/10 rounded-full" /></div>
            <div className="w-full h-10 bg-white/5 rounded-xl border border-white/5 flex items-center px-3"><div className="w-3/4 h-1.5 bg-white/10 rounded-full" /></div>
            <div className="w-full h-10 bg-white/5 rounded-xl border border-white/5 flex items-center px-3"><div className="w-1/3 h-1.5 bg-white/10 rounded-full" /></div>
          </motion.div>
          {/* Floating Pills */}
          <motion.div 
            animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute z-20 px-3 py-1.5 bg-blue-500 text-[10px] text-white font-bold rounded-md shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-1 translate-x-[-70px] translate-y-[-40px]"
            style={{ transform: "translateZ(50px)" }}
          >
            <Icons.pencil className="w-3 h-3" /> In Progress
          </motion.div>
          <motion.div 
            animate={{ y: [5, -5, 5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute z-20 px-3 py-1.5 bg-emerald-500 text-[10px] text-white font-bold rounded-md shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1 translate-x-[70px] translate-y-[0px]"
            style={{ transform: "translateZ(80px)" }}
          >
            <Icons.check className="w-3 h-3" /> Done
          </motion.div>
          <motion.div 
            animate={{ y: [-3, 3, -3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute z-20 px-3 py-1.5 bg-purple-500 text-[10px] text-white font-bold rounded-md shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-1 translate-x-[50px] translate-y-[60px]"
            style={{ transform: "translateZ(40px)" }}
          >
            <Icons.check className="w-3 h-3" /> To Do
          </motion.div>
        </ShowcaseCard>

        {/* 2. Meetings */}
        <ShowcaseCard 
          title="Meetings" 
          description="Seamless integrated video and audio calls with your team for productive syncs."
          icon={<Icons.video className="w-5 h-5" />}
        >
          <motion.div 
            variants={{ hover: { rotateX: 20, rotateZ: 5, scale: 1.05 } }}
            initial={{ rotateX: 30, rotateZ: 10, rotateY: -10 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-56 h-40 bg-[#111116] border border-white/10 rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-wrap p-2 gap-2 justify-center items-center"
          >
            {/* Video Grid */}
            <div className="w-[45%] h-[40%] bg-[#1a1a24] rounded-lg border border-white/5 relative overflow-hidden flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-500/80" />
              <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
            </div>
            <div className="w-[45%] h-[40%] bg-[#1a1a24] rounded-lg border-2 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)] relative overflow-hidden flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-purple-500/80" />
            </div>
            <div className="w-[45%] h-[40%] bg-[#1a1a24] rounded-lg border border-white/5 relative overflow-hidden flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-pink-500/80" />
            </div>
            <div className="w-[45%] h-[40%] bg-[#1a1a24] rounded-lg border border-white/5 relative overflow-hidden flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-orange-500/80" />
            </div>
          </motion.div>
          {/* Floating Icons */}
          <motion.div animate={{ y: [-4, 4, -4], rotateZ: -5 }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute z-20 w-10 h-10 bg-[#1a1a24]/90 rounded-full shadow-lg border border-white/10 flex items-center justify-center translate-x-[-70px] translate-y-[-20px]" style={{ transform: "translateZ(50px)" }}>
            <Icons.mic className="w-4 h-4 text-emerald-400" />
          </motion.div>
          <motion.div animate={{ y: [4, -4, 4], rotateZ: 5 }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute z-20 w-10 h-10 bg-[#1a1a24]/90 rounded-full shadow-lg border border-white/10 flex items-center justify-center translate-x-[40px] translate-y-[30px]" style={{ transform: "translateZ(70px)" }}>
            <Icons.video className="w-4 h-4 text-purple-400" />
          </motion.div>
        </ShowcaseCard>

        {/* 3. Real-time Chat */}
        <ShowcaseCard 
          title="Real-time Chat" 
          description="Stay connected with your team through instant messaging and threaded conversations."
          icon={<Icons.inbox className="w-5 h-5" />}
        >
          <motion.div 
            variants={{ hover: { rotateY: -10, rotateX: 5, scale: 1.05 } }}
            initial={{ rotateY: -20, rotateX: 10, rotateZ: 5 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-56 h-48 bg-[#111116] border border-white/10 rounded-2xl p-4 shadow-2xl relative z-10 flex flex-col gap-3 justify-end"
          >
             <div className="self-end w-3/4 h-10 bg-[#4c3a9f] rounded-2xl rounded-tr-sm shadow-[0_0_15px_rgba(76,58,159,0.3)] border border-[#5d46c2] flex flex-col justify-center px-4 gap-1.5"><div className="w-2/3 h-1.5 bg-white/50 rounded-full" /><div className="w-1/2 h-1.5 bg-white/30 rounded-full" /></div>
             <div className="self-start w-2/3 h-8 bg-white/5 rounded-2xl rounded-tl-sm border border-white/10 flex items-center px-4"><div className="w-3/4 h-1.5 bg-white/20 rounded-full" /></div>
          </motion.div>
          {/* Floating Avatars */}
          <motion.div className="absolute z-20 w-6 h-6 rounded-full border border-white/10 bg-blue-500 translate-x-[100px] translate-y-[-40px]" style={{ transform: "translateZ(60px)" }} />
          <motion.div className="absolute z-20 w-6 h-6 rounded-full border border-white/10 bg-purple-500 translate-x-[-100px] translate-y-[0px]" style={{ transform: "translateZ(50px)" }} />
          {/* Typing Indicator */}
          <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute z-20 translate-x-[-60px] translate-y-[60px]" style={{ transform: "translateZ(80px)" }}>
            <div className="bg-[#111116] border border-white/10 rounded-full px-4 py-2 flex gap-1.5 shadow-xl">
               <div className="w-1.5 h-1.5 bg-white/40 rounded-full" /><div className="w-1.5 h-1.5 bg-white/40 rounded-full" /><div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
            </div>
          </motion.div>
        </ShowcaseCard>

        {/* 4. Planner */}
        <ShowcaseCard 
          title="Planner" 
          description="Plan your schedule, manage deadlines, and never miss important milestones."
          icon={<Icons.calendar className="w-5 h-5" />}
        >
          <motion.div 
            variants={{ hover: { rotateX: 35, rotateZ: -10, scale: 1.05 } }}
            initial={{ rotateX: 45, rotateZ: -15, rotateY: 10 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-56 h-40 bg-[#111116] border border-white/10 rounded-xl shadow-2xl relative z-10 flex flex-col overflow-hidden"
          >
            <div className="flex border-b border-white/5 px-3 py-2 justify-between text-[8px] text-white/30 font-bold tracking-widest">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            <div className="flex-1 grid grid-cols-7 grid-rows-4 gap-px bg-white/5 p-px">
              {Array.from({ length: 28 }).map((_, i) => <div key={i} className="bg-[#111116]" />)}
            </div>
            
            {/* Floating Date Blocks */}
            <motion.div className="absolute top-[35%] left-[20%] w-8 h-4 rounded bg-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-[#c084fc]" style={{ transform: "translateZ(20px)" }} />
            <motion.div className="absolute top-[55%] left-[70%] w-8 h-4 rounded bg-[#ec4899] shadow-[0_0_15px_rgba(236,72,153,0.5)] border border-[#f472b6]" style={{ transform: "translateZ(30px)" }} />
            <motion.div className="absolute top-[80%] left-[30%] w-8 h-6 rounded border border-[#3b82f6] flex items-center justify-center bg-[#3b82f6]/20 text-[10px] text-[#60a5fa] font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ transform: "translateZ(40px)" }}>12</motion.div>
            <motion.div className="absolute top-[80%] left-[55%] w-6 h-4 rounded bg-[#34d399] shadow-[0_0_15px_rgba(52,211,153,0.5)] border border-[#6ee7b7]" style={{ transform: "translateZ(35px)" }} />
            <motion.div className="absolute top-[80%] left-[75%] w-8 h-4 rounded bg-[#ec4899] shadow-[0_0_15px_rgba(236,72,153,0.5)] border border-[#f472b6]" style={{ transform: "translateZ(25px)" }} />
          </motion.div>
        </ShowcaseCard>

        {/* 5. Team Spaces */}
        <ShowcaseCard 
          title="Team Spaces" 
          description="Create dedicated spaces for different teams and manage permissions seamlessly."
          icon={<Icons.users className="w-5 h-5" />}
        >
          <motion.div 
            variants={{ hover: { rotateX: 20, scale: 1.05 } }}
            initial={{ rotateX: 30, rotateY: 10 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-48 h-48 relative z-10 flex items-center justify-center"
          >
            {/* Radar Rings */}
            <div className="absolute w-full h-full rounded-full border border-white/5" />
            <div className="absolute w-3/4 h-3/4 rounded-full border border-white/10 bg-white/[0.02]" />
            <div className="absolute w-1/2 h-1/2 rounded-full border border-[#4c3a9f]/50 bg-[#4c3a9f]/10" />
            
            <div className="w-10 h-10 rounded-full bg-[#4c3a9f] border-2 border-[#111116] flex items-center justify-center shadow-[0_0_25px_rgba(76,58,159,0.8)] relative z-20">
               <Icons.users className="w-4 h-4 text-white" />
            </div>

            {/* Orbiting Orbs */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-0 z-30">
              <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-[#111116] absolute top-0 left-1/2 -ml-3 shadow-[0_0_15px_rgba(168,85,247,0.6)]" style={{ transform: "translateZ(30px)" }} />
            </motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-4 z-30">
              <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-[#111116] absolute bottom-0 left-1/4 shadow-[0_0_15px_rgba(59,130,246,0.6)]" style={{ transform: "translateZ(40px)" }} />
            </motion.div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-[-1rem] z-30">
              <div className="w-5 h-5 rounded-full bg-yellow-500 border-2 border-[#111116] absolute bottom-1/4 left-0 shadow-[0_0_15px_rgba(234,179,8,0.6)]" style={{ transform: "translateZ(50px)" }} />
              <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#111116] absolute bottom-1/4 right-0 shadow-[0_0_15px_rgba(16,185,129,0.6)]" style={{ transform: "translateZ(50px)" }} />
            </motion.div>
          </motion.div>
        </ShowcaseCard>

        {/* 6. Activity Timeline */}
        <ShowcaseCard 
          title="Activity Timeline" 
          description="Track every action, change, and update with a beautiful activity timeline."
          icon={<Icons.clock className="w-5 h-5" />}
        >
          <motion.div 
            variants={{ hover: { scale: 1.05 } }}
            initial={{ rotateY: -15, rotateX: 5 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-48 h-48 relative z-10 flex"
          >
            {/* The Track */}
            <div className="w-px h-full bg-white/10 absolute left-6 top-0" />
            
            <div className="flex flex-col justify-between h-full w-full py-2 relative z-10">
              {/* Timeline Item 1 */}
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] ml-[18px]" />
                <div className="flex flex-col gap-2 w-full translate-y-[-5px]" style={{ transform: "translateZ(20px)" }}>
                  <div className="w-3/4 h-2 bg-white/10 rounded-full" />
                  <div className="w-1/2 h-1.5 bg-white/5 rounded-full" />
                </div>
              </div>
              {/* Timeline Item 2 */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#27273A] border border-white/10 flex items-center justify-center ml-2 shadow-lg">
                  <Icons.users className="w-3 h-3 text-blue-400" />
                </div>
                <div className="w-full h-3 bg-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-full" style={{ transform: "translateZ(30px)" }} />
              </div>
              {/* Timeline Item 3 */}
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)] ml-[18px]" />
                <div className="flex flex-col gap-2 w-full translate-y-[-5px]" style={{ transform: "translateZ(20px)" }}>
                  <div className="w-2/3 h-2 bg-white/10 rounded-full" />
                  <div className="w-1/3 h-1.5 bg-white/5 rounded-full" />
                </div>
              </div>
              {/* Timeline Item 4 */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#27273A] border border-white/10 flex items-center justify-center ml-2 shadow-lg">
                  <Icons.file className="w-3 h-3 text-orange-400" />
                </div>
                <div className="w-1/2 h-3 bg-orange-500/80 shadow-[0_0_15px_rgba(249,115,22,0.5)] rounded-full" style={{ transform: "translateZ(40px)" }} />
              </div>
            </div>
          </motion.div>
        </ShowcaseCard>

      </div>
    </section>
  )
}
