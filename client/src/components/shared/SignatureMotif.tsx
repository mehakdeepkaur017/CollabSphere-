import * as React from "react"
import { motion } from "framer-motion"

interface SignatureMotifProps {
  className?: string
  animated?: boolean
}

export function SignatureMotif({ className = "", animated = true }: SignatureMotifProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none opacity-40 ${className}`}>
      {/* Elegant Dotted Grid */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="motif-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" className="fill-foreground/10" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#motif-grid)" />
      </svg>

      {/* Abstract Connected Nodes */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-overlay">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {animated ? (
            <>
              <motion.circle 
                cx="200" cy="200" r="150" 
                stroke="currentColor" strokeWidth="1" strokeDasharray="4 8"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
              />
              <motion.circle 
                cx="200" cy="200" r="100" 
                stroke="currentColor" strokeWidth="1"
                initial={{ rotate: 0 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
              />
              <motion.path 
                d="M100 200 L150 120 L280 180 L200 300 Z" 
                stroke="currentColor" strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
              />
              <motion.circle cx="100" cy="200" r="4" fill="currentColor" />
              <motion.circle cx="150" cy="120" r="4" fill="currentColor" />
              <motion.circle cx="280" cy="180" r="4" fill="currentColor" />
              <motion.circle cx="200" cy="300" r="4" fill="currentColor" />
            </>
          ) : (
            <>
              <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
              <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" />
              <path d="M100 200 L150 120 L280 180 L200 300 Z" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              <circle cx="100" cy="200" r="4" fill="currentColor" />
              <circle cx="150" cy="120" r="4" fill="currentColor" />
              <circle cx="280" cy="180" r="4" fill="currentColor" />
              <circle cx="200" cy="300" r="4" fill="currentColor" />
            </>
          )}
        </svg>
      </div>
      
      {/* Soft Vignette Fade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-background)_80%)]" />
    </div>
  )
}
