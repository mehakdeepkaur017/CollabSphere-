import * as React from "react"
import { motion, useInView, type Variants } from "framer-motion"

interface StaggeredTextProps {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function StaggeredText({ text, className = "", delay = 0, once = true }: StaggeredTextProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once, margin: "-10%" });
  
  // Split the text into words
  const words = text.split(" ");
  
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay * i },
    }),
  };
  
  const child: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };
  
  return (
    <motion.h1
      ref={ref}
      style={{ display: "flex", flexWrap: "wrap", overflow: "hidden" }}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          style={{ marginRight: "0.25em", display: "inline-block" }}
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}
