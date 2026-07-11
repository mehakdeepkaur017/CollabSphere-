import * as React from "react"
import { motion, useSpring } from "framer-motion"

export function CursorGlow() {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = React.useState(false)

  React.useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      
      // If hovering over something clickable, we can intensify the glow
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, [role="button"]')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    }

    window.addEventListener("mousemove", updateMousePosition)
    return () => window.removeEventListener("mousemove", updateMousePosition)
  }, [])

  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 }
  const x = useSpring(mousePosition.x, springConfig)
  const y = useSpring(mousePosition.y, springConfig)

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-50 mix-blend-screen hidden lg:block"
      style={{
        x,
        y,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <motion.div 
        animate={{ 
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.3 : 0.15
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_70%)] blur-[40px]"
      />
    </motion.div>
  )
}
