import * as React from "react"
import { motion, useAnimation } from "framer-motion"

interface MotionIconProps extends React.SVGProps<SVGSVGElement> {
  icon: "folder" | "calendar" | "pencil" | "bell" | "dashboard" | "project" | "profile" | "settings";
  className?: string;
}

export function MotionIcon({ icon, className, ...props }: MotionIconProps) {
  const controls = useAnimation();
  
  const handleHover = () => {
    controls.start("hover");
  };
  
  const handleMouseLeave = () => {
    controls.start("rest");
  };

  const getIcon = () => {
    switch (icon) {
      case "folder":
        return (
          <>
            <motion.path 
              d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" 
              variants={{
                rest: { pathLength: 1, strokeWidth: 2 },
                hover: { pathLength: [0, 1], strokeWidth: 2.5, transition: { duration: 0.8, ease: "easeOut" } }
              }}
            />
            <motion.line 
              x1="9" y1="14" x2="15" y2="14" 
              variants={{
                rest: { opacity: 1, scaleX: 1 },
                hover: { opacity: [0, 1], scaleX: [0, 1], transition: { delay: 0.3 } }
              }}
            />
          </>
        );
      case "calendar":
        return (
          <>
            <motion.rect 
              x="3" y="4" width="18" height="18" rx="2" ry="2" 
              variants={{
                rest: { y: 0, rotate: 0 },
                hover: { y: -2, rotate: [-2, 2, 0], transition: { type: "spring", bounce: 0.5 } }
              }}
            />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <motion.path 
              d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" 
              variants={{
                rest: { opacity: 1 },
                hover: { opacity: [0, 1], transition: { staggerChildren: 0.1 } }
              }}
            />
          </>
        );
      case "pencil":
        return (
          <>
            <motion.path 
              d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" 
              variants={{
                rest: { rotate: 0, originX: "50%", originY: "50%" },
                hover: { rotate: [-10, 10, -5, 5, 0], transition: { duration: 0.6 } }
              }}
            />
          </>
        );
      case "bell":
        return (
          <>
            <motion.path 
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" 
              variants={{
                rest: { rotate: 0, originX: "50%", originY: "20%" },
                hover: { rotate: [0, 20, -20, 10, -10, 0], transition: { duration: 0.6 } }
              }}
            />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </>
        );
      case "dashboard":
        return (
          <>
            <motion.rect x="3" y="3" width="7" height="9" rx="1" variants={{ rest: { scale: 1 }, hover: { scale: 0.9 } }} />
            <motion.rect x="14" y="3" width="7" height="5" rx="1" variants={{ rest: { scale: 1 }, hover: { scale: 1.1 } }} />
            <motion.rect x="14" y="12" width="7" height="9" rx="1" variants={{ rest: { scale: 1 }, hover: { scale: 0.9 } }} />
            <motion.rect x="3" y="16" width="7" height="5" rx="1" variants={{ rest: { scale: 1 }, hover: { scale: 1.1 } }} />
          </>
        );
      default:
        // Default to a circle if icon not found
        return <circle cx="12" cy="12" r="10" />;
    }
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={handleHover}
      onMouseLeave={handleMouseLeave}
      initial="rest"
      animate={controls as any}
      {...(props as any)}
    >
      {getIcon()}
    </motion.svg>
  );
}
