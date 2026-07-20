"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, User, LogOut, Settings, Volume2, VolumeX, Contrast, Sun, Moon } from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";
import CommandPalette from "./CommandPalette";

const MOCK_NOTIFICATIONS = [
  { id: 1, title: "Gate 4 Bottleneck", desc: "Density peak detected at North Gate. Queue wait time: 14 mins.", time: "2m ago", type: "warning" },
  { id: 2, title: "Medical Dispatch", desc: "Responder Team B dispatched to Seating Block 204.", time: "8m ago", type: "danger" },
  { id: 3, title: "EV Charging Surge", desc: "Parking Block C charging stations at 95% capacity.", time: "15m ago", type: "info" },
  { id: 4, title: "Match operations", desc: "Weather forecast clear for next 2 hours. Wind speed 4km/h.", time: "30m ago", type: "success" },
];

export default function Header() {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [monochrome, setMonochrome] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");

  const toggleMonochrome = () => {
    const next = !monochrome;
    setMonochrome(next);
    if (next) {
      document.documentElement.classList.add("monochrome");
    } else {
      document.documentElement.classList.remove("monochrome");
    }
  };

  const toggleTheme = () => {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Monitor Cmd+K to open search palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Format breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [{ name: "Landing", href: "/" }];
    
    return segments.map((seg, i) => {
      const href = "/" + segments.slice(0, i + 1).join("/");
      const name = seg
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { name, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="relative flex items-center justify-between h-20 px-8 border-b border-white/5 bg-transparent z-30 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500 font-medium hover:text-white transition-colors cursor-pointer">ArenaMind</span>
        {breadcrumbs.map((crumb, idx) => (
          <div key={crumb.href} className="flex items-center gap-2">
            <span className="text-gray-600 font-light">/</span>
            <span className={`font-semibold tracking-wide ${idx === breadcrumbs.length - 1 ? "text-[#00E5FF] font-bold" : "text-gray-300"}`}>
              {crumb.name}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Cmd+K Search trigger */}
        <button
          onClick={() => setIsCommandOpen(true)}
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
        >
          <Search className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          <span className="text-xs font-medium">Search Control Panel...</span>
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold text-gray-400 border border-white/10 uppercase">
            ⌘K
          </div>
        </button>

        {/* Audio click simulation toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
          title={soundEnabled ? "Mute Operational Sounds" : "Enable Operational Sounds"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00E5FF]" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Monochrome (Black & White) toggle */}
        <button
          onClick={toggleMonochrome}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
          title={monochrome ? "Switch to Color Mode" : "Switch to Black & White Theme"}
        >
          <Contrast className={`w-4 h-4 ${monochrome ? "text-[#00E5FF] rotate-180" : ""} transition-transform duration-300`} />
        </button>

        {/* Light/Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
          title={themeMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {themeMode === "dark" ? (
            <Sun className="w-4 h-4 text-[#00E5FF] transition-all" />
          ) : (
            <Moon className="w-4 h-4 text-gray-400 transition-all" />
          )}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444] animate-ping" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#EF4444] shadow-[0_0_5px_#EF4444]" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="absolute right-0 mt-3 w-80 rounded-2xl glass-panel border border-white/10 p-4 shadow-2xl z-20"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Live AI Alert Stream</span>
                    <span className="text-[10px] bg-[#EF4444]/20 text-[#EF4444] px-1.5 py-0.5 rounded font-black tracking-wide">
                      4 PENDING
                    </span>
                  </div>

                  <div className="space-y-3 max-h-75 overflow-y-auto pr-1">
                    {MOCK_NOTIFICATIONS.map((notif) => (
                      <div
                          key={notif.id}
                          className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/2 border border-white/5 hover:bg-white/4 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{notif.title}</span>
                            <span className="text-[9px] text-gray-500">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-normal">{notif.desc}</p>
                        </div>
                    ))}
                  </div>

                  <button className="w-full mt-4 py-2 text-center text-xs font-semibold text-[#00E5FF] hover:underline bg-[#00E5FF]/10 rounded-lg transition-all border border-[#00E5FF]/20">
                    Acknowledge All Alerts
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-[#7C3AED] to-[#3B82F6] flex items-center justify-center text-xs font-extrabold text-white">
              JD
            </div>
            <span className="text-xs font-semibold text-gray-300 pr-1 max-md:hidden">John Doe</span>
          </button>

          <AnimatePresence>
            {showProfile && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="absolute right-0 mt-3 w-56 rounded-2xl glass-panel border border-white/10 p-2 shadow-2xl z-20"
                >
                  <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">j.doe@arenamind.ai</p>
                  </div>

                  <button className="flex items-center gap-3 w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>User Profile</span>
                  </button>

                  <button className="flex items-center gap-3 w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>Control Settings</span>
                  </button>

                  <div className="h-px bg-white/5 my-1.5" />

                  <button className="flex items-center gap-3 w-full px-3 py-2 text-left text-xs text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer">
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Exit System</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cmd+K command palette modal */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </header>
  );
}
