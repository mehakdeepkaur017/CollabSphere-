import * as React from "react"
import { motion } from "framer-motion"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/Button"

export function PinnedResourcesCard() {
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(16,185,129,0.2)" }}
      className="group flex flex-col rounded-3xl border border-white/5 bg-black/40 backdrop-blur-xl p-6 transition-all hover:border-emerald-500/30"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
            <Icons.star className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Pinned Resources</h2>
        </div>
        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
          <Icons.plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-h-[160px] items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/40 mb-3">
          <Icons.star className="h-5 w-5" />
        </div>
        <p className="text-sm text-white/50 mb-4 max-w-[250px]">
          Pin important projects, whiteboards, or files here for quick access.
        </p>
        <Button className="bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 rounded-full px-6">
          Pin Resource
        </Button>
      </div>
    </motion.div>
  )
}
