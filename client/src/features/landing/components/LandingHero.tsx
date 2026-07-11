import * as React from "react"
import { motion, useScroll, useTransform, useSpring, type Variants } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Icons } from "@/components/shared/icons"
import { useNavigate } from "react-router"

// Text stagger animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
}

export function LandingHero() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Mouse parallax
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const springX = useSpring(mousePosition.x * 20, { stiffness: 100, damping: 30 });
  const springY = useSpring(mousePosition.y * 20, { stiffness: 100, damping: 30 });
  const springXInverse = useSpring(mousePosition.x * -30, { stiffness: 100, damping: 30 });
  const springYInverse = useSpring(mousePosition.y * -30, { stiffness: 100, damping: 30 });

  return (
    <motion.section 
      style={{ opacity }}
      className="relative flex min-h-screen w-full items-center justify-center pt-24 px-6 md:px-12 overflow-hidden max-w-[1600px] mx-auto"
    >
      <div className="flex flex-col lg:flex-row items-center w-full gap-12 lg:gap-24 relative z-10">
        
        {/* Left Column: Content */}
        <div className="flex-1 flex flex-col items-start text-left max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary mb-8 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest">CollabSphere 2.0</span>
          </motion.div>

          <motion.h1 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-extrabold tracking-tighter text-white leading-[1.1] mb-8"
          >
            {["The", "Operating", "System", "for", "Student", "Collaboration."].map((word, i) => (
              <motion.span key={i} variants={wordVariants} className="inline-block mr-3 lg:mr-4 last:text-primary">
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg md:text-xl text-white/60 max-w-xl mb-12 leading-relaxed"
          >
            A premium, real-time workspace designed specifically for university students to manage projects, share ideas, and build together effortlessly.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="rounded-full px-8 h-14 text-base bg-white text-black hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] w-full sm:w-auto font-medium"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-full px-8 h-14 text-base border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 w-full sm:w-auto font-medium backdrop-blur-md transition-all"
            >
              Explore Platform <Icons.arrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        {/* Right Column: Abstract Kinetic UI Sculpture */}
        <div className="flex-1 w-full relative h-[500px] lg:h-[700px] hidden md:flex items-center justify-center pointer-events-none perspective-1000">
          
          <motion.div 
            style={{ x: springX, y: springY, rotateX: springYInverse, rotateY: springX }}
            className="relative w-full h-full flex items-center justify-center transform-gpu preserve-3d"
          >
            {/* ================= LAYER 1: BACKGROUND GLOW ================= */}
            <motion.div 
              style={{ x: springXInverse, y: springYInverse }}
              className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-20 opacity-70"
            />
            <div className="absolute w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] -z-20 translate-x-20 translate-y-20" />

            {/* ================= LAYER 2: CONNECTION NETWORK ================= */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <svg className="w-[120%] h-[120%] absolute overflow-visible" viewBox="0 0 800 800">
                <defs>
                  <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.1)" />
                    <stop offset="50%" stopColor="rgba(59,130,246,0.5)" />
                    <stop offset="100%" stopColor="rgba(139,92,246,0.1)" />
                  </linearGradient>
                  <linearGradient id="lineGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(16,185,129,0.1)" />
                    <stop offset="50%" stopColor="rgba(16,185,129,0.4)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.1)" />
                  </linearGradient>
                </defs>
                
                {/* Flowing Path 1 */}
                <path d="M 200 200 C 300 400, 500 200, 600 500" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                <motion.path 
                  d="M 200 200 C 300 400, 500 200, 600 500" 
                  fill="none" 
                  stroke="url(#lineGrad1)" 
                  strokeWidth="3" 
                  strokeDasharray="200 800"
                  animate={{ strokeDashoffset: [1000, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.5))" }}
                />

                {/* Flowing Path 2 */}
                <path d="M 650 250 C 450 150, 350 600, 150 550" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                <motion.path 
                  d="M 650 250 C 450 150, 350 600, 150 550" 
                  fill="none" 
                  stroke="url(#lineGrad2)" 
                  strokeWidth="3" 
                  strokeDasharray="150 850"
                  animate={{ strokeDashoffset: [0, 1000] }}
                  transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
                  style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.5))" }}
                />
              </svg>
            </div>

            {/* ================= LAYER 3: LARGE FLOATING PANELS ================= */}
            
            {/* Whiteboard Frame (Back left) */}
            <motion.div 
              animate={{ y: [-15, 15, -15], rotateZ: [-2, 1, -2] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[5%] w-[320px] h-[240px] bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-4 overflow-hidden"
              style={{ translateZ: -50 }}
            >
              {/* Inner Whiteboard Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <div className="relative w-full h-8 border-b border-white/5 flex items-center gap-2 px-2">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>
              {/* Abstract Drawings */}
              <svg className="w-full h-full absolute inset-0 p-8" viewBox="0 0 100 100">
                 <motion.path 
                   d="M 10 50 Q 50 10 90 50 T 90 90" 
                   fill="none" 
                   stroke="rgba(255,255,255,0.1)" 
                   strokeWidth="2"
                   animate={{ pathLength: [0.8, 1, 0.8] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                 />
              </svg>
            </motion.div>

            {/* Project Container (Front right) */}
            <motion.div 
              animate={{ y: [10, -10, 10], rotateZ: [1, -1, 1] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[10%] right-[0%] w-[380px] h-[280px] bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-6 flex flex-col gap-5"
              style={{ translateZ: 50 }}
            >
              {/* Skeleton Header */}
              <div className="flex justify-between items-center w-full">
                <div className="w-24 h-4 bg-white/20 rounded-full" />
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/80 border-2 border-background" />
                  <div className="w-8 h-8 rounded-full bg-purple-500/80 border-2 border-background" />
                  <div className="w-8 h-8 rounded-full bg-emerald-500/80 border-2 border-background" />
                </div>
              </div>
              
              {/* Skeleton Columns */}
              <div className="flex-1 flex gap-4 w-full">
                <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 p-3 flex flex-col gap-3">
                  <div className="w-12 h-2 bg-white/10 rounded-full mb-2" />
                  <div className="w-full h-16 bg-white/10 rounded-xl" />
                  <div className="w-full h-16 bg-white/10 rounded-xl" />
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 p-3 flex flex-col gap-3">
                  <div className="w-12 h-2 bg-white/10 rounded-full mb-2" />
                  <div className="w-full h-24 bg-primary/20 border border-primary/20 rounded-xl relative overflow-hidden">
                     <motion.div 
                       animate={{ x: ["-100%", "200%"] }}
                       transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                     />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ================= LAYER 4: MEDIUM WIDGETS ================= */}
            
            {/* Workspace Hub Node */}
            <motion.div 
              animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[40%] left-[30%] w-20 h-20 bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] rotate-12"
              style={{ translateZ: 80 }}
            >
              <div className="w-8 h-8 rounded bg-primary/50 flex items-center justify-center">
                 <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]" />
              </div>
            </motion.div>

            {/* Sticky Note (Yellow) */}
            <motion.div 
              animate={{ y: [-8, 8, -8], rotateZ: [-6, -2, -6] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] right-[30%] w-24 h-24 bg-yellow-500/20 backdrop-blur-lg border border-yellow-500/30 rounded-lg shadow-xl flex items-center justify-center"
              style={{ translateZ: 60 }}
            >
              <div className="w-12 h-1 bg-yellow-500/40 rounded-full" />
            </motion.div>

            {/* Progress Ring Widget */}
            <motion.div 
              animate={{ y: [5, -5, 5], rotateZ: [5, 10, 5] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[25%] left-[15%] w-32 h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl flex items-center justify-center"
              style={{ translateZ: 100 }}
            >
              <svg viewBox="0 0 100 100" className="w-24 h-24 transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <motion.circle 
                  cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="6"
                  strokeDasharray="251"
                  animate={{ strokeDashoffset: [251, 60, 251] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.5))" }}
                />
              </svg>
            </motion.div>

            {/* ================= LAYER 5: SMALL PARTICLES & MICRODETAILS ================= */}
            
            {/* Cursor Outline 1 */}
            <motion.div 
              animate={{ x: [0, 80, 20, 0], y: [0, 40, -30, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[30%] left-[20%] pointer-events-none drop-shadow-lg"
              style={{ translateZ: 120 }}
            >
              <Icons.arrowUp className="w-6 h-6 text-purple-400 rotate-[-25deg]" />
            </motion.div>

            {/* Cursor Outline 2 */}
            <motion.div 
              animate={{ x: [0, -60, -10, 0], y: [0, -50, 20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[40%] right-[25%] pointer-events-none drop-shadow-lg"
              style={{ translateZ: 140 }}
            >
              <Icons.arrowUp className="w-6 h-6 text-blue-400 rotate-[65deg]" />
            </motion.div>

            {/* Abstract Floating Badge */}
            <motion.div 
              animate={{ y: [-4, 4, -4], scale: [1, 1.1, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[45%] right-[15%] w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-xl"
              style={{ translateZ: 150 }}
            >
              <div className="w-3 h-3 rounded bg-white/80 rotate-45" />
            </motion.div>

            {/* Drifting Spark Particles */}
            <motion.div 
              animate={{ y: [0, -100], opacity: [0, 1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute top-[60%] left-[40%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"
              style={{ translateZ: 100 }}
            />
            <motion.div 
              animate={{ y: [0, -80], opacity: [0, 1, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 2 }}
              className="absolute top-[70%] right-[40%] w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981]"
              style={{ translateZ: 150 }}
            />

          </motion.div>
        </div>

      </div>
    </motion.section>
  )
}
