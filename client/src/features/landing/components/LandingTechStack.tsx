import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Icons } from "@/components/shared/icons"

const stackItems = [
  { name: "React", icon: "projects", color: "text-blue-400" },
  { name: "TypeScript", icon: "fileText", color: "text-blue-500" },
  { name: "Tailwind", icon: "pencil", color: "text-teal-400" },
  { name: "Socket.IO", icon: "clock", color: "text-white" },
  { name: "Node.js", icon: "server", color: "text-green-500" },
  { name: "MongoDB", icon: "database", color: "text-emerald-500" }
]

export function LandingTechStack() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [200, -200])

  return (
    <section id="stack" ref={containerRef} className="relative w-full py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Developer Grade Quality.</h2>
          <p className="text-lg text-white/50 mb-8 max-w-lg">Engineered with a modern tech stack to ensure millisecond-latency communication and robust type-safety across the entire pipeline.</p>
          
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {stackItems.map((item, index) => {
              const Icon = Icons[item.icon as keyof typeof Icons] || Icons.circle;
              return (
                <motion.div 
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm font-medium text-white/80">{item.name}</span>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="flex-1 relative h-[500px] w-full perspective-[1000px] hidden md:block">
          {/* 3D Stack Visualization */}
          <motion.div 
            style={{ y: y2 }}
            className="absolute top-[20%] left-[20%] w-[60%] aspect-video bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] transform rotate-x-[30deg] rotate-y-[-20deg] flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
            <span className="text-4xl font-black text-white/10 tracking-widest">FRONTEND</span>
          </motion.div>

          <motion.div 
            style={{ y: y1 }}
            className="absolute top-[40%] left-[20%] w-[60%] aspect-video bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] transform rotate-x-[30deg] rotate-y-[-20deg] flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
            <span className="text-4xl font-black text-white/10 tracking-widest">BACKEND</span>
          </motion.div>
          
          {/* Socket Connection Beams */}
          <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-[40%] left-[50%] w-px h-[20%] bg-white shadow-[0_0_10px_#fff]"
          />
        </div>
      </div>
    </section>
  )
}
