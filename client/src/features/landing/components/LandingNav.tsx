import * as React from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "home", label: "Home", href: "#top" },
  { id: "features", label: "Features", href: "#features" },
  { id: "about", label: "About", href: "#about" },
]

export function LandingNav() {
  const { scrollY } = useScroll();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const height = useTransform(scrollY, [0, 100], ["6rem", "4.5rem"]);
  const blur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(16px)"]);
  const backgroundColor = useTransform(scrollY, [0, 100], ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.7)"]);
  const borderColor = useTransform(scrollY, [0, 100], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"]);

  const [hoveredTab, setHoveredTab] = React.useState<string | null>(null);

  return (
    <motion.header
      style={{
        backdropFilter: blur,
        backgroundColor,
        borderColor,
        height,
      }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 transition-colors border-b"
    >
      <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <motion.div 
          whileHover={{ rotate: 90, scale: 1.1 }} 
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
        >
          <Icons.logo className="h-5 w-5" />
        </motion.div>
        <span className="text-xl font-bold tracking-tight text-white ml-2 opacity-90 group-hover:opacity-100 transition-opacity">CollabSphere</span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
        <AnimatePresence>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className="relative px-2 py-1 text-white/80 hover:text-white transition-colors"
            >
              {item.label}
              {hoveredTab === item.id && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute left-0 right-0 -bottom-1 h-0.5 bg-primary rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </a>
          ))}
        </AnimatePresence>
      </nav>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <Button 
            onClick={() => navigate('/app')}
            className="rounded-full px-6 bg-white text-black hover:bg-white/90 transition-all shadow-xl shadow-white/10"
          >
            Go to App
          </Button>
        ) : (
          <>
            <Button variant="ghost" className="text-white/80 hover:text-white hidden sm:inline-flex" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button 
              onClick={() => navigate('/register')}
              className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
            >
              Get Started
            </Button>
          </>
        )}
      </div>
    </motion.header>
  )
}
