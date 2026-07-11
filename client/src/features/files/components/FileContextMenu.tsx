import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";

interface ContextMenuItem {
  icon: any;
  label: string;
  onClick: () => void;
  color?: string;
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
}

export function FileContextMenu({ x, y, isOpen, onClose, items }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Simple boundary collision detection
  const safeX = Math.min(x, window.innerWidth - 220);
  const safeY = Math.min(y, window.innerHeight - (items.length * 40));

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{ left: safeX, top: safeY }}
            className="absolute w-52 bg-[#16161c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1 pointer-events-auto"
          >
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-white/5 transition-colors ${
                    item.color || "text-white/80 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4 opacity-70" />
                  {item.label}
                </button>
                {item.divider && <div className="h-px w-full bg-white/5 my-1" />}
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
