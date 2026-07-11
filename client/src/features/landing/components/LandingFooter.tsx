import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Icons } from "@/components/shared/icons"
import { useNavigate } from "react-router"

export function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="relative w-full overflow-hidden bg-black pt-32 pb-12 border-t border-white/5">
      {/* Massive CTA Section */}
      <div className="relative max-w-5xl mx-auto px-6 mb-32 text-center">
        <div className="absolute inset-0 top-1/2 -translate-y-1/2 w-full h-[300px] bg-primary/20 blur-[150px] mix-blend-screen pointer-events-none" />
        
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-8"
        >
          Ready to build together?
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-white/50 max-w-2xl mx-auto mb-12"
        >
          Join thousands of students organizing their academic projects on the most advanced collaborative platform built for universities.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
        >
          <Button 
            size="lg" 
            onClick={() => navigate('/register')}
            className="rounded-full px-12 h-16 text-lg bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-[0_0_60px_rgba(255,255,255,0.4)] font-medium group"
          >
            Start your workspace
            <Icons.arrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>

      {/* Footer Links */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6">
        <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
            <Icons.logo className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">CollabSphere</span>
        </div>
        
        <div className="text-sm text-white/40">
          © {new Date().getFullYear()} CollabSphere. Built for academic excellence.
        </div>
        
        <div className="flex gap-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
            <Icons.projects className="w-4 h-4" /> {/* GitHub placeholder icon */}
          </a>
        </div>
      </div>
    </footer>
  )
}
