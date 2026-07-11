import * as React from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { cn } from "@/lib/utils"

const principles = [
  {
    title: "Unified Workspace",
    description: "Everything happens in one place without switching apps.",
    icon: <Icons.dashboard className="w-5 h-5" />
  },
  {
    title: "Real-Time Sync",
    description: "Every change syncs instantly so everyone stays on the same page.",
    icon: <Icons.activity className="w-5 h-5" />
  },
  {
    title: "Built for Students",
    description: "Designed around university projects, assignments, and teamwork.",
    icon: <Icons.users className="w-5 h-5" />
  },
  {
    title: "Modern Experience",
    description: "Fast, polished, responsive, and enjoyable to use.",
    icon: <Icons.star className="w-5 h-5" />
  }
]

export function LandingAbout() {
  const containerRef = React.useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section id="about" ref={containerRef} className="relative w-full overflow-hidden bg-black py-32 px-6 border-t border-white/5">
      {/* --- BACKGROUND AMBIANCE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
        
        {/* --- BLOCK A: SPLIT STORY & ORBITAL COMPOSITION --- */}
        <div className="w-full flex flex-col lg:flex-row gap-16 lg:gap-8 items-center min-h-[850px]">
          
          {/* LEFT SIDE: STORY (45%) */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mb-8 shadow-xl"
            >
              <span className="text-xs font-bold text-white/80 tracking-widest uppercase">✨ Our Vision</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6"
            >
              Built for the way students actually <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">collaborate.</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/60 leading-relaxed mb-12 max-w-xl"
            >
              University projects deserve better than scattered chats, endless file versions, and disconnected tools. CollabSphere brings planning, communication, and real-time workspaces together.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {principles.map((p, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.3 + (idx * 0.1) }}
                  whileHover="hover"
                  className="group relative bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.08] hover:border-white/20 overflow-hidden"
                >
                  <motion.div 
                    variants={{ hover: { opacity: 1 } }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none"
                  />
                  
                  <motion.div 
                    variants={{ hover: { scale: 1.1, rotate: 5, color: "#a855f7" } }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-white/70 transition-colors border border-white/5 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 relative z-10"
                  >
                    {p.icon}
                  </motion.div>
                  <h3 className="text-white font-semibold mb-1 relative z-10">{p.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed relative z-10">{p.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: ORBITAL VISUAL (55%) */}
          <div className="w-full lg:w-[55%] h-[600px] lg:h-[800px] relative flex items-center justify-center perspective-1000 mt-12 lg:mt-0">
            {/* Parallax Container */}
            <motion.div style={{ y: y1 }} className="absolute inset-0 flex items-center justify-center">
              
              {/* SVG Connection Lines (Drawing outwards) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 800">
                {/* Orbit Path 1 */}
                <motion.circle 
                  cx="400" cy="400" r="160" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4"
                  animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                  style={{ originX: "50%", originY: "50%" }}
                />
                {/* Orbit Path 2 */}
                <motion.circle 
                  cx="400" cy="400" r="280" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4"
                  animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                  style={{ originX: "50%", originY: "50%" }}
                />
                
                {/* Connecting Lines */}
                {[0, 72, 144, 216, 288].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 400 + Math.cos(rad) * 120;
                  const y1 = 400 + Math.sin(rad) * 120;
                  const x2 = 400 + Math.cos(rad) * 280;
                  const y2 = 400 + Math.sin(rad) * 280;
                  return (
                    <motion.line 
                      key={i}
                      x1={x1} y1={y1} x2={x2} y2={y2} 
                      stroke="url(#line-grad)" strokeWidth="1"
                      initial={{ strokeDashoffset: 160 }}
                      animate={isInView ? { strokeDashoffset: 0 } : { strokeDashoffset: 160 }}
                      transition={{ duration: 1.5, delay: 0.5 + (i * 0.2), ease: "easeOut" }}
                      strokeDasharray="160"
                    />
                  )
                })}
                <defs>
                  <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(168,85,247,0.5)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Element (Glass Workspace) */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", duration: 1.5, bounce: 0.4 }}
                className="absolute z-30 w-56 h-56 bg-[#0A0A10]/80 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-[0_0_80px_rgba(168,85,247,0.2)] flex flex-col overflow-hidden"
              >
                {/* Mini UI Header */}
                <div className="h-10 border-b border-white/10 flex items-center px-5 gap-2 bg-white/[0.02]">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                </div>
                {/* Mini UI Body */}
                <div className="flex-1 flex p-3 gap-3">
                  <div className="w-14 h-full bg-white/5 rounded-xl border border-white/5" />
                  <div className="flex-1 h-full bg-white/5 rounded-xl border border-white/5 flex flex-col p-3 gap-3">
                    <div className="w-full h-2.5 bg-white/20 rounded-full" />
                    <div className="w-2/3 h-2.5 bg-white/10 rounded-full" />
                    <div className="w-full h-2.5 bg-white/10 rounded-full mt-auto" />
                  </div>
                </div>
                {/* Glowing Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
              </motion.div>

              {/* Orbiting Ring 1 (Inner) */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute w-[320px] h-[320px] z-20"
              >
                {/* Panel 1 */}
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-7 left-1/2 -ml-7 w-14 h-14 bg-[#111118] border border-white/20 rounded-2xl shadow-2xl flex items-center justify-center text-blue-400 backdrop-blur-xl"
                >
                  <Icons.folder className="w-6 h-6" />
                </motion.div>
                {/* Panel 2 */}
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-7 left-1/2 -ml-7 w-14 h-14 bg-[#111118] border border-white/20 rounded-2xl shadow-2xl flex items-center justify-center text-emerald-400 backdrop-blur-xl"
                >
                  <Icons.pencil className="w-6 h-6" />
                </motion.div>
              </motion.div>

              {/* Orbiting Ring 2 (Outer) */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute w-[560px] h-[560px] z-10"
              >
                {/* Panel 3 */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute top-[10%] left-[10%] w-16 h-16 bg-[#111118] border border-white/20 rounded-2xl shadow-2xl flex items-center justify-center text-purple-400 backdrop-blur-xl"
                >
                  <Icons.inbox className="w-7 h-7" />
                </motion.div>
                {/* Panel 4 */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute top-[10%] right-[10%] w-16 h-16 bg-[#111118] border border-white/20 rounded-2xl shadow-2xl flex items-center justify-center text-pink-400 backdrop-blur-xl"
                >
                  <Icons.calendar className="w-7 h-7" />
                </motion.div>
                {/* Panel 5 */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-[5%] left-[50%] -ml-8 w-16 h-16 bg-[#111118] border border-white/20 rounded-2xl shadow-2xl flex items-center justify-center text-orange-400 backdrop-blur-xl"
                >
                  <Icons.clock className="w-7 h-7" />
                </motion.div>
              </motion.div>

            </motion.div>
          </div>
        </div>

        {/* --- BLOCK B: BOTTOM QUOTE --- */}
        <div className="w-full py-32 text-center relative z-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.3 } },
              hidden: {}
            }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-white/90 leading-tight"
          >
            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}>One workspace.</motion.p>
            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }} className="text-white/70">Every conversation.</motion.p>
            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }} className="text-white/50">Every project.</motion.p>
            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }} className="text-primary bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Every teammate.</motion.p>
          </motion.div>
        </div>



      </div>
    </section>
  )
}
