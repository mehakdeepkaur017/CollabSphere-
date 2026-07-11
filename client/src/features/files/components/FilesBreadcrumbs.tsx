import React from "react";
import { Icons } from "@/components/shared/icons";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface FilesBreadcrumbsProps {
  path: BreadcrumbItem[];
  onNavigate: (id: string | undefined) => void;
}

export function FilesBreadcrumbs({ path, onNavigate }: FilesBreadcrumbsProps) {
  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => onNavigate(undefined)}
        className="px-2 py-1 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors"
      >
        Workspace
      </button>
      
      {path.map((item, index) => (
        <React.Fragment key={item.id}>
          <Icons.chevronRight className="w-4 h-4 text-white/20" />
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onNavigate(item.id)}
            className={`px-2 py-1 rounded-md transition-colors ${
              index === path.length - 1 
                ? "text-white bg-white/5" 
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {item.name}
          </motion.button>
        </React.Fragment>
      ))}
    </div>
  );
}
