"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Keyboard } from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";
import { MENU_ITEMS } from "./Sidebar";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on Esc, keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      const timer = setTimeout(() => setQuery(""), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filteredItems = MENU_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#080B14]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl glass-panel border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10"
          >
            {/* Search Input bar */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search center modules..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-base bg-transparent border-none focus:outline-none placeholder:text-gray-500"
                style={{ color: 'white' }}
              />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-gray-500 font-semibold uppercase">
                <Keyboard className="w-3 h-3" /> ESC
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Command Results */}
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className="flex items-center justify-between w-full px-4 py-3 text-left rounded-xl hover:bg-[#161F2F]/80 text-gray-300 hover:text-white transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-gray-400 group-hover:bg-[#00E5FF]/10 group-hover:text-[#00E5FF] transition-all">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 group-hover:text-gray-400 italic">Go to page</span>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No modules found matching &quot;{query}&quot;
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/5 bg-white/1 flex items-center justify-between text-[11px] text-gray-500">
              <span>Use mouse or keyboard to navigate</span>
              <span>ArenaMind AI Systems v1.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
