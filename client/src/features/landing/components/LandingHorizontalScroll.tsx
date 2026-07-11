import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"

const panels = [
  {
    title: "Sync Instantly",
    description: "Every keystroke, cursor movement, and state change propagates in milliseconds over WebSocket.",
    color: "from-blue-500/20 to-purple-500/20",
    border: "border-blue-500/30"
  },
  {
    title: "Never Overwrite",
    description: "Operational Transformation guarantees conflict-free live editing across documents and whiteboards.",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30"
  },
  {
    title: "Always Connected",
    description: "Presence indicators keep your team visually unified, no matter where they are.",
    color: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30"
  },
  {
    title: "Review History",
    description: "Go back in time. The timeline stores every change, allowing complete accountability.",
    color: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-500/30"
  }
]

export function LandingHorizontalScroll() {
  const targetRef = React.useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  })

  // We have 4 panels. We want to translate x from 0% to -75% (or based on width)
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"])

  return (
    <section ref={targetRef} className="relative h-[300vh] w-full">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-8 px-6 md:px-24">
          <div className="w-screen max-w-sm shrink-0 flex flex-col justify-center pr-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Real-Time Engine</h2>
            <p className="text-lg text-white/50">Built on Node.js and Socket.IO, CollabSphere handles thousands of concurrent events without breaking a sweat.</p>
          </div>
          
          {panels.map((panel, index) => (
            <div 
              key={index} 
              className={`w-[80vw] max-w-[600px] h-[60vh] shrink-0 rounded-3xl border ${panel.border} bg-gradient-to-br ${panel.color} backdrop-blur-md p-10 flex flex-col justify-center shadow-2xl relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-black/40 mix-blend-overlay pointer-events-none" />
              <h3 className="text-3xl font-bold text-white mb-4 relative z-10 group-hover:scale-105 transition-transform origin-left">{panel.title}</h3>
              <p className="text-xl text-white/70 relative z-10 max-w-md">{panel.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
