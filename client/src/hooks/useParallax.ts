import { useEffect, useState } from "react"
import { useSpring } from "framer-motion"

export function useParallax(distance: number = 10) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      // Normalize mouse position between -1 and 1
      const x = (e.clientX / innerWidth) * 2 - 1
      const y = (e.clientY / innerHeight) * 2 - 1
      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Create spring-based motion values for smooth tracking
  const springConfig = { damping: 40, stiffness: 200, mass: 1 }
  const x = useSpring(0, springConfig)
  const y = useSpring(0, springConfig)

  // Update the springs when mouse position changes
  useEffect(() => {
    x.set(mousePosition.x * distance)
    y.set(mousePosition.y * distance)
  }, [mousePosition, distance, x, y])

  return { x, y }
}
