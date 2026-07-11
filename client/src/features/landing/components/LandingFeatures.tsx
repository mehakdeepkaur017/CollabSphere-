import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { MotionIcon } from "@/components/shared/MotionIcon"
import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

const features = [
  {
    id: "f1",
    title: "No more disconnected tools.",
    description: "Stop jumping between WhatsApp, Google Docs, and Trello. CollabSphere brings your communication, tasks, and ideation into a single window.",
    icon: "projects"
  },
  {
    id: "f2",
    title: "Always know who's doing what.",
    description: "The realtime activity feed and live presence cursors ensure you never overlap work or wonder if your partner is active.",
    icon: "clock"
  },
  {
    id: "f3",
    title: "Designed for universities.",
    description: "Built with the academic semester in mind. Group projects have never been this structured and transparent.",
    icon: "calendar"
  }
]

export function LandingFeatures() {
  const [activeFeature, setActiveFeature] = React.useState(features[0].id)

  return (
    <section className="relative w-full max-w-7xl mx-auto py-32 px-6">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="flex-1 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8">Why CollabSphere?</h2>
          
          <div className="space-y-4">
            {features.map((feature) => {
              const isActive = activeFeature === feature.id;
              return (
                <div 
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={cn(
                    "relative p-6 rounded-2xl cursor-pointer transition-colors duration-300",
                    isActive ? "bg-white/10" : "hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeFeatureBg" 
                      className="absolute inset-0 rounded-2xl bg-white/10 border border-white/10"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <div className="relative z-10 flex gap-4">
                    <div className={cn(
                      "mt-1 w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors duration-300",
                      isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 text-white/50"
                    )}>
                      <MotionIcon icon={feature.icon as any} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={cn("text-xl font-semibold mb-2 transition-colors", isActive ? "text-white" : "text-white/60")}>{feature.title}</h3>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-white/70 leading-relaxed overflow-hidden"
                          >
                            {feature.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex-1 w-full flex items-center justify-center">
          <Card className="relative w-full aspect-square max-w-md rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeFeature}
                 initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                 animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                 exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                 transition={{ duration: 0.4 }}
                 className="absolute inset-0 flex items-center justify-center text-primary/20"
               >
                 <MotionIcon icon={features.find(f => f.id === activeFeature)?.icon as any} className="w-48 h-48 opacity-20" />
               </motion.div>
             </AnimatePresence>
          </Card>
        </div>
      </div>
    </section>
  )
}
