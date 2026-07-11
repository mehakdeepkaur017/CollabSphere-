import * as React from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { Icons } from "@/components/shared/icons"

export function LandingShowcase() {
  const containerRef = React.useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const cursorControls = useAnimation();
  const clickRingControls = useAnimation();
  const notifControls = useAnimation();
  const progressControls = useAnimation();
  const [typedText, setTypedText] = React.useState("");

  React.useEffect(() => {
    if (!isInView) return;
    
    let isMounted = true;
    
    const sequence = async () => {
      while (isMounted) {
        // Reset state
        setTypedText("");
        await Promise.all([
          cursorControls.set({ x: 350, y: 350, opacity: 0 }),
          clickRingControls.set({ scale: 0, opacity: 0 }),
          notifControls.set({ y: -20, opacity: 0, scale: 0.9 }),
          progressControls.set({ width: "30%" })
        ]);

        // 1. Cursor enters and moves to input field
        await cursorControls.start({ x: 180, y: 140, opacity: 1, transition: { duration: 1.2, ease: "easeInOut" } });
        
        // 2. Click effect
        await clickRingControls.start({ scale: [0, 1.5], opacity: [0.8, 0], transition: { duration: 0.4 } });
        
        // 3. Type text
        const textToType = "Add payment gateway API";
        for (let i = 0; i <= textToType.length; i++) {
          if (!isMounted) return;
          setTypedText(textToType.substring(0, i));
          await new Promise(r => setTimeout(r, 60)); // typing speed
        }
        
        // 4. Cursor moves to "Complete" button
        await cursorControls.start({ x: 260, y: 220, transition: { duration: 0.8, ease: "easeInOut", delay: 0.2 } });
        await clickRingControls.start({ scale: [0, 1.5], opacity: [0.8, 0], transition: { duration: 0.4 } });
        
        // 5. Progress bar fills
        await progressControls.start({ width: "100%", transition: { duration: 1, ease: "backOut" } });
        
        // 6. Notification pops in
        await notifControls.start({ y: 0, opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5, duration: 0.6 } });
        
        // Wait before looping
        await new Promise(r => setTimeout(r, 4000));
      }
    };
    
    sequence();
    
    return () => { isMounted = false };
  }, [isInView, cursorControls, clickRingControls, notifControls, progressControls]);

  return (
    <section id="collaboration" className="relative w-full max-w-7xl mx-auto py-32 px-6 overflow-hidden">
      <div className="text-center mb-24 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Experience True Collaboration.</h2>
        <p className="text-lg text-white/50 max-w-2xl mx-auto">Watch as tasks update in real-time, presence cursors fly across the screen, and progress bars fill instantly. No refreshing required.</p>
      </div>

      <div ref={containerRef} className="relative h-[600px] w-full max-w-5xl mx-auto flex items-center justify-center perspective-1000">
        {/* Central Hub Glow */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-64 h-64 bg-primary/30 rounded-full blur-[80px]"
        />

        {/* The Scene Wrapper (Tilted) */}
        <motion.div 
          initial={{ rotateX: 20, rotateY: -10, opacity: 0, y: 100 }}
          animate={{ rotateX: 0, rotateY: 0, opacity: 1, y: 0 }}
          transition={{ duration: 1.5, type: "spring", bounce: 0.3 }}
          className="relative w-[800px] h-[500px] bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] flex p-8 gap-8 overflow-hidden transform-gpu"
        >
          {/* Sidebar */}
          <div className="w-48 h-full border-r border-white/10 flex flex-col gap-4 pr-6">
            <div className="h-4 w-24 bg-white/20 rounded mb-4" />
            <div className="h-8 w-full bg-white/5 rounded-lg border border-white/5" />
            <div className="h-8 w-[80%] bg-white/5 rounded-lg border border-white/5" />
            <div className="h-8 w-[90%] bg-primary/20 text-primary border border-primary/30 rounded-lg p-2 text-xs flex items-center">Active Sprint</div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6 relative">
            <div className="flex justify-between items-center">
              <div className="h-6 w-48 bg-white/20 rounded" />
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-background bg-blue-500 z-10" />
                <div className="w-8 h-8 rounded-full border-2 border-background bg-purple-500 z-0" />
              </div>
            </div>

            {/* Progress Bar Area */}
            <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/60">Sprint Progress</span>
                <span className="text-sm text-white/80">Updating...</span>
              </div>
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                <motion.div animate={progressControls} className="h-full bg-primary" />
              </div>
            </div>

            {/* Task Input Area */}
            <div className="w-full h-32 bg-white/5 rounded-2xl border border-white/10 p-4 relative flex flex-col justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded border border-white/30" />
                 <span className="text-white/80 font-mono text-sm">
                   {typedText}
                   <motion.span 
                     animate={{ opacity: [1, 0] }}
                     transition={{ repeat: Infinity, duration: 0.8 }}
                     className="inline-block w-2 h-4 bg-primary ml-1 align-middle"
                   />
                 </span>
               </div>
               
               <div className="self-end px-4 py-2 bg-white text-black rounded-lg text-sm font-medium">
                 Complete Task
               </div>
            </div>

            {/* Notification Chip (Absolute) */}
            <motion.div 
              animate={notifControls}
              className="absolute bottom-4 right-4 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl"
            >
              <Icons.check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white font-medium">Task Completed</span>
            </motion.div>

            {/* Living Cursor (Absolute) */}
            <motion.div 
              animate={cursorControls}
              className="absolute z-50 pointer-events-none drop-shadow-2xl"
            >
              <Icons.arrowUp className="w-6 h-6 text-primary rotate-[-25deg] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
              <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full ml-3 font-semibold shadow-lg">Mehak</span>
              
              {/* Click Ring */}
              <motion.div 
                animate={clickRingControls}
                className="absolute top-0 left-0 w-8 h-8 -ml-1 -mt-1 border-2 border-primary rounded-full pointer-events-none"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
