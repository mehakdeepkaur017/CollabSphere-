import * as React from "react"
import { Outlet, useLocation } from "react-router"
import { Icons } from "@/components/shared/icons"
import { motion, AnimatePresence } from "framer-motion"
import { CollaborationGraph } from "@/components/shared/CollaborationGraph"
import { AnimatedFeatureChip } from "@/components/shared/AnimatedFeatureChip"
import { useParallax } from "@/hooks/useParallax"
import { pageTransitionVariants } from "@/lib/motion"

export function AuthLayout() {
  const parallax = useParallax(15)
  const location = useLocation()

  return (
    <div className="dark flex min-h-screen w-full bg-[#0A0A10] text-foreground selection:bg-primary/30">
      {/* Left Side: Immersive Hero */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0A0A10] border-r border-white/5 p-12 text-zinc-50 lg:flex">
        
        {/* Layer 1: Enhanced Deep Mesh Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div 
            className="absolute -left-[20%] -top-[20%] h-[80%] w-[80%] rounded-full bg-purple-600/20 blur-[120px]" 
            animate={{ 
              x: [0, 100, 0], 
              y: [0, 50, 0], 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.6, 0.3] 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-[0%] right-[0%] h-[70%] w-[70%] rounded-full bg-indigo-600/20 blur-[120px]" 
            animate={{ 
              x: [0, -80, 0], 
              y: [0, -60, 0], 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              opacity: [0.2, 0.5, 0.2] 
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div 
            className="absolute top-[40%] left-[20%] h-[50%] w-[50%] rounded-full bg-blue-500/10 blur-[100px]" 
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, 180, 0],
              opacity: [0.1, 0.4, 0.1] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        {/* Layer 2: Signature Collaboration Graph (Parallax + Slow Float) */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-40 text-purple-400"
          style={{ x: parallax.x, y: parallax.y }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <CollaborationGraph />
        </motion.div>

        {/* Layer 4: Content (Staggered Intro) */}
        <div className="relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white shadow-[0_0_40px_rgba(255,255,255,0.1)] backdrop-blur-md border border-white/10 transition-transform hover:scale-105 duration-300">
              <Icons.logo className="h-6 w-6" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">CollabSphere</span>
          </motion.div>
        </div>

        <div className="relative z-20 flex flex-col gap-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
            className="space-y-6 max-w-xl"
          >
            <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-white/95 text-balance">
              Ideas become projects.<br />
              <span className="text-indigo-300">Projects become achievements.</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed font-medium">
              The real-time operating system for ambitious student teams. Build, learn, and ship together.
            </p>
          </motion.div>
          
          <motion.div 
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.1, delayChildren: 0.6 } }
            }}
            className="flex flex-wrap gap-4"
          >
            <AnimatedFeatureChip icon="circle" label="Real-time Collaboration" colorClass="text-emerald-400 bg-emerald-500/20" parallaxX={parallax.x} parallaxY={parallax.y} parallaxFactor={0.5} />
            <AnimatedFeatureChip icon="folder" label="Live Workspaces" colorClass="text-indigo-400 bg-indigo-500/20" parallaxX={parallax.x} parallaxY={parallax.y} parallaxFactor={0.3} />
            <AnimatedFeatureChip icon="calendar" label="Team Planner" colorClass="text-amber-400 bg-amber-500/20" parallaxX={parallax.x} parallaxY={parallax.y} parallaxFactor={0.7} />
          </motion.div>
        </div>
      </div>

      {/* Right Side: Premium Auth Forms */}
      <div className="flex w-full flex-col items-center justify-center bg-[#0A0A10] px-6 lg:w-1/2 relative overflow-hidden">
        
        {/* Right Side Background Ambiance */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-[100px]" 
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex items-center justify-center gap-3 lg:hidden"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-white shadow-lg backdrop-blur-md">
              <Icons.logo className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">CollabSphere</span>
          </motion.div>
          
          {/* Form Crossfade Wrapper inside a Glass Container */}
          <motion.div 
            className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
             
             <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative z-10"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
