import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function CollaborationGraph({ className }: { className?: string }) {
  // We define a series of nodes with relative positions (0 to 100 percentages)
  const nodes = [
    { id: 1, x: 20, y: 30, size: 8, label: "Core" },
    { id: 2, x: 60, y: 15, size: 6, label: "Client" },
    { id: 3, x: 80, y: 50, size: 10, label: "Database" },
    { id: 4, x: 40, y: 70, size: 5, label: "Cache" },
    { id: 5, x: 10, y: 80, size: 7, label: "API" },
    { id: 6, x: 50, y: 40, size: 4, label: "Edge" },
    { id: 7, x: 85, y: 85, size: 6, label: "Analytics" },
    { id: 8, x: 30, y: 10, size: 5, label: "Web" },
  ]

  // Connections between nodes
  const connections = [
    { source: 1, target: 2 },
    { source: 1, target: 6 },
    { source: 2, target: 3 },
    { source: 6, target: 4 },
    { source: 4, target: 5 },
    { source: 6, target: 3 },
    { source: 3, target: 7 },
    { source: 8, target: 1 },
    { source: 8, target: 2 },
    { source: 5, target: 1 },
  ]

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      <svg width="100%" height="100%" className="absolute inset-0">
        {/* Render connections */}
        {connections.map((conn, index) => {
          const source = nodes.find(n => n.id === conn.source)!
          const target = nodes.find(n => n.id === conn.target)!
          return (
            <motion.line
              key={`conn-${index}`}
              x1={`${source.x}%`}
              y1={`${source.y}%`}
              x2={`${target.x}%`}
              y2={`${target.y}%`}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeOpacity={0.2}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.2 }}
              transition={{
                duration: 2,
                delay: index * 0.2 + 0.5,
                ease: "easeInOut",
              }}
            />
          )
        })}

        {/* Render nodes */}
        {nodes.map((node, index) => (
          <g key={`node-${node.id}`}>
            {/* Pulsing ring */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size * 2.5}
              fill="currentColor"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.15, 0],
                scale: [1, 2.5, 1],
              }}
              transition={{
                duration: 4,
                delay: index * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Core node */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size}
              fill="currentColor"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: index * 0.1,
              }}
            />
          </g>
        ))}
      </svg>
      
      {/* Blueprint grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  )
}
