import type { Variants } from "framer-motion"

// --- SPRING PHYSICS ---
// Apple-like spring physics for natural, fluid motion.
export const springs = {
  // Soft, slightly slow spring for large layout changes or empty states
  soft: { type: "spring" as const, stiffness: 80, damping: 20, mass: 1 },
  // The default spring: fluid, responsive, no visible bounce, feels expensive
  default: { type: "spring" as const, stiffness: 200, damping: 24, mass: 0.8 },
  // Snappy: fast but smooth, for modals, popovers, dropdowns
  snappy: { type: "spring" as const, stiffness: 350, damping: 25, mass: 0.5 },
  // Gentle: For subtle entrances, toasts
  gentle: { type: "spring" as const, stiffness: 120, damping: 14, mass: 0.8 },
  // Fast: Micro-interactions like button clicks, hover states
  fast: { type: "spring" as const, stiffness: 450, damping: 30, mass: 0.4 },
  // Bouncy: For success states or emphasis
  bouncy: { type: "spring" as const, stiffness: 300, damping: 15, mass: 0.6 },
}

// --- EASE CURVES ---
// For when spring physics aren't appropriate (e.g. opacity fades)
export const easings = {
  easeOutQuart: [0.25, 1, 0.5, 1] as [number, number, number, number],
  easeInOutQuint: [0.83, 0, 0.17, 1] as [number, number, number, number],
  appleEase: [0.32, 0.72, 0, 1] as [number, number, number, number],
}

// --- VARIANTS ---

// Page Transitions: Elegant crossfade with subtle scale morph
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 8, filter: "blur(8px)" },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0, 
    filter: "blur(0px)",
    transition: { ...springs.default, staggerChildren: 0.04 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    y: -4, 
    filter: "blur(4px)",
    transition: { duration: 0.25, ease: easings.appleEase }
  },
}

// Stagger orchestrators
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
}

export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.96, filter: "blur(4px)" },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: springs.snappy
  },
}

// Modal / Dialog / Popover: Scale from 0.95 and fade
export const scaleFadeVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 12, filter: "blur(8px)" },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: springs.snappy 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 6,
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: easings.appleEase }
  },
}

// Drawers / Sidebars: Slide in fluidly
export const slideDrawerVariants: Variants = {
  initial: { x: "-100%", opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { ...springs.default, stiffness: 300, damping: 28 } 
  },
  exit: { 
    x: "-100%", 
    opacity: 0,
    transition: { duration: 0.25, ease: easings.appleEase }
  },
}

// Empty States: Gentle fade up with scale
export const fadeSlideUpVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: springs.gentle 
  },
}

// --- MICRO-INTERACTIONS ---

// Buttons
export const buttonTapScale = {
  rest: { scale: 1 },
  hover: { scale: 1.01, transition: springs.fast },
  tap: { scale: 0.96, transition: springs.fast }
}

// Cards
export const cardHoverScale = {
  initial: { opacity: 0, y: 12, scale: 0.96, filter: "blur(4px)" },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)",
    transition: springs.snappy
  },
  rest: { scale: 1, y: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)", filter: "brightness(1)", transition: springs.default },
  hover: { 
    scale: 1.015, 
    y: -4, 
    boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12), 0 12px 16px -8px rgba(0,0,0,0.08)",
    filter: "brightness(1.02)",
    transition: springs.default 
  },
  tap: { 
    scale: 0.985,
    y: 0,
    boxShadow: "0 8px 16px -6px rgba(0,0,0,0.08)",
    filter: "brightness(0.98)",
    transition: springs.fast 
  }
}
