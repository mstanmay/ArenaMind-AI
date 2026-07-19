"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  Map,
  Users,
  Car,
  Shield,
  Activity,
  Trophy,
  Store,
  LineChart,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export const MENU_ITEMS = [
  { name: "NASA Mission Control", path: "/dashboard", icon: LayoutDashboard, color: "text-[#3B82F6]" },
  { name: "AI Copilot", path: "/dashboard/copilot", icon: Bot, color: "text-[#00E5FF]", isAI: true },
  { name: "Digital Twin 3D", path: "/dashboard/digital-twin", icon: Map, color: "text-[#7C3AED]" },
  { name: "Crowd Intelligence", path: "/dashboard/crowd", icon: Users, color: "text-[#22C55E]" },
  { name: "Parking Intelligence", path: "/dashboard/parking", icon: Car, color: "text-[#F59E0B]" },
  { name: "Security Center", path: "/dashboard/security", icon: Shield, color: "text-[#EF4444]" },
  { name: "Emergency Center", path: "/dashboard/emergency", icon: Activity, color: "text-[#EF4444]" },
  { name: "Tournament Ops", path: "/dashboard/tournament", icon: Trophy, color: "text-[#3B82F6]" },
  { name: "Vendor Intelligence", path: "/dashboard/vendors", icon: Store, color: "text-[#22C55E]" },
  { name: "Deep Analytics", path: "/dashboard/analytics", icon: LineChart, color: "text-[#00E5FF]" },
  { name: "Reports Archive", path: "/dashboard/reports", icon: FileText, color: "text-gray-400" },
  { name: "Settings Config", path: "/dashboard/settings", icon: Settings, color: "text-gray-400" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`relative flex flex-col h-screen glass-panel border-r border-white/5 text-gray-300 select-none z-40 shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'w-[280px]' : 'w-[80px]'}`}
    >
      {/* Title logo section */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-tr from-[#3B82F6] to-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)] overflow-hidden">
            <Image src="/logo.png" width={40} height={40} className="object-cover" alt="ArenaMind Logo" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <span className="font-heading font-extrabold tracking-tight text-gray-100 text-lg leading-none">
                  ArenaMind<span className="text-[#00E5FF] font-semibold">AI</span>
                </span>
                <span className="text-[10px] text-gray-500 font-medium mt-1">COMMAND CENTER v1.0</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`relative flex items-center h-12 rounded-xl transition-all duration-200 group px-4 cursor-pointer ${
                  isActive
                    ? "bg-[#161F2F] text-white border-l-2 border-[#00E5FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                {/* Active glow backing */}
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                )}

                <div className="flex items-center gap-4">
                  <Icon className={`w-5 h-5 ${isActive ? item.color : "text-gray-400 group-hover:text-white"} transition-colors`} />
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className={`text-sm font-medium tracking-wide ${
                          isActive ? "text-white font-semibold" : "text-gray-400 group-hover:text-white"
                        }`}
                      >
                        {item.name}
                        {item.isAI && (
                          <span className="ml-2 text-[9px] bg-linear-to-r from-[#00E5FF] to-[#7C3AED] text-black px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                            AI
                          </span>
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tooltip for collapsed mode */}
                {!isExpanded && (
                  <div className="absolute left-20 scale-0 group-hover:scale-100 transition-all origin-left duration-200 bg-[#111827] border border-white/10 text-white text-xs font-semibold px-3 py-2 rounded-lg pointer-events-none shadow-xl whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse button bottom */}
      <div className="p-4 border-t border-white/5 flex justify-end">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
