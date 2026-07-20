"use client";

import { useEffect, useState } from "react";
import { m as motion } from "framer-motion";
import {
  Users,
  Car,
  CloudSun,
  Shield,
  Activity,
  Flame,
  DollarSign,
  TrendingUp,
  Cpu,
  CornerDownRight,
  Sparkles,
  Zap,
  Navigation,
  Clock
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import confetti from "canvas-confetti";

// Real-time chart data mock
const MOCK_GRAPH_DATA = [
  { time: "18:00", density: 10, revenue: 12 },
  { time: "18:30", density: 25, revenue: 24 },
  { time: "19:00", density: 45, revenue: 48 },
  { time: "19:30", density: 78, revenue: 84 },
  { time: "20:00", density: 85, revenue: 112 },
  { time: "20:30", density: 92, revenue: 145 },
  { time: "21:00", density: 95, revenue: 180 },
];

export default function DashboardClient() {
  const [dispatched, setDispatched] = useState(false);

  // Live ticking clock & metrics simulation extracted to prevent re-renders
  const handleAuthorize = () => {
    setDispatched(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#00E5FF", "#3B82F6", "#7C3AED"],
    });
  };

  return (
    <div className="space-y-8 select-none">
      {/* HUD Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl glass-panel border border-[#00E5FF]/20 shadow-[0_0_20px_rgba(0,229,255,0.05)]">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/30">
            <Cpu className="w-6 h-6 text-[#00E5FF] animate-pulse" />
          </div>
          <div>
            <h1 className="font-heading font-black text-2xl tracking-tight text-white">NASA OPERATIONS CENTER</h1>
            <p className="text-xs text-[#00E5FF] font-mono tracking-widest uppercase">
              Arena Brain active // RESOLVING LIVE TELEMETRY
            </p>
          </div>
        </div>

        {/* Live Match State */}
        <LiveMatchHeader />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column: AI Decision Hub (Replaces AI Recommendation Card) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-[#7C3AED]/30 bg-linear-to-b from-[#7C3AED]/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C3AED]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#00E5FF]" />
              <span className="text-xs font-black uppercase tracking-wider text-[#00E5FF]">AI Copilot Suggestion</span>
            </div>

            <h3 className="font-heading font-bold text-lg text-white mb-2 leading-tight">North Gate Queue Congestion</h3>
            <p className="text-xs text-gray-400 leading-normal mb-4 font-light">
              Wait times at North Gate 4 have reached <span className="text-[#EF4444] font-bold">14 minutes</span>. Models predict arrival surge in 10 minutes.
            </p>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="px-2.5 py-1 rounded bg-white/5 text-[10px] text-gray-400 font-mono font-bold">
                CONFIDENCE: 98%
              </div>
              <div className="px-2.5 py-1 rounded bg-[#22C55E]/10 text-[10px] text-[#22C55E] font-mono font-bold">
                SOLVES: 4m WAIT
              </div>
            </div>

            {dispatched ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full py-3 text-center text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl"
              >
                Dispatched successfully! Redirecting fans...
              </motion.div>
            ) : (
              <button
                onClick={handleAuthorize}
                className="w-full py-3 text-center text-xs font-bold tracking-widest uppercase text-black bg-[#00E5FF] hover:bg-[#00E5FF]/90 rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] cursor-pointer"
              >
                Authorize Crowd Diversion
              </button>
            )}
          </div>

          {/* Timeline of events */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-gray-400 mb-2">Live Match Timeline</h3>
            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
              
              <div className="flex gap-4 relative pl-6">
                <div className="absolute left-1 w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] top-1.5" />
                <div>
                  <span className="block text-[10px] font-mono text-[#00E5FF]">62' MIN // EVENT</span>
                  <span className="block text-xs font-semibold text-white">GOAL! Real Madrid 1 - 0 Barcelona</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">Crowd audio decibels surged to 110dB.</p>
                </div>
              </div>

              <div className="flex gap-4 relative pl-6">
                <div className="absolute left-1 w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#F59E0B] top-1.5" />
                <div>
                  <span className="block text-[10px] font-mono text-amber-500">55' MIN // MEDICAL</span>
                  <span className="block text-xs font-semibold text-white">First Aid Dispatched to Section 204</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">Incident ID: #MD-9012. Response time: 2m 14s.</p>
                </div>
              </div>

              <div className="flex gap-4 relative pl-6">
                <div className="absolute left-1 w-2.5 h-2.5 rounded-full bg-gray-600 top-1.5" />
                <div>
                  <span className="block text-[10px] font-mono text-gray-500">45' MIN // SCHED</span>
                  <span className="block text-xs font-semibold text-white">Second Half Kickoff</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">Operations sync successfully completed.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Center Grid Content: Telemetry Dashboard Widgets */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Widgets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Live Attendance */}
            <AttendanceWidget />

            {/* Crowd Density */}
            <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Crowd Density</span>
                <span className="block text-2xl font-black text-white mt-1">High (82%)</span>
                <span className="text-[10px] text-amber-500 mt-1 flex items-center gap-1 font-semibold">
                  <Flame className="w-3.5 h-3.5" /> Gate 4 congestion peaking
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] border border-[#22C55E]/20">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Parking Occupancy */}
            <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Parking lots</span>
                <span className="block text-2xl font-black text-white mt-1">79% full</span>
                <span className="text-[10px] text-gray-400 mt-1 font-mono">
                  1,840 SLOTS OPEN
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] border border-[#F59E0B]/20">
                <Car className="w-5 h-5" />
              </div>
            </div>

            {/* Energy Grid Status */}
            <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Energy Matrix</span>
                <span className="block text-2xl font-black text-white mt-1">4.2 MW / h</span>
                <span className="text-[10px] text-[#00E5FF] mt-1 flex items-center gap-1 font-semibold">
                  <Zap className="w-3.5 h-3.5" /> 42% Solar Sustained
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] border border-[#00E5FF]/20">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            {/* Weather Radar */}
            <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Local Weather</span>
                <span className="block text-2xl font-black text-white mt-1">24.5 °C</span>
                <span className="text-[10px] text-[#22C55E] mt-1 font-semibold">
                  Clear Skies // Dry Pitch
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-500/10 flex items-center justify-center text-gray-400 border border-white/10">
                <CloudSun className="w-5 h-5" />
              </div>
            </div>

            {/* Security Alerts */}
            <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Security Index</span>
                <span className="block text-2xl font-black text-white mt-1">Lvl 1 (Safe)</span>
                <span className="text-[10px] text-[#22C55E] mt-1 font-semibold">
                  No active breaches
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
                <Shield className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Animated Recharts Analytics Card */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-heading font-black text-lg text-white">OPERATIONAL TRENDS</h3>
                <p className="text-xs text-gray-400">Live comparison of crowd flow and snack sales revenue</p>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
                  <span className="text-gray-400 font-medium">Density Curve (%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                  <span className="text-gray-400 font-medium">Sales Revenue (k$)</span>
                </div>
              </div>
            </div>

            <div className="h-70 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_GRAPH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Area type="monotone" dataKey="density" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#colorDensity)" />
                  <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats Grid bottom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Medical Teams status */}
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-white">Medical Dispatch Status</h4>
                <p className="text-xs text-gray-400 mt-1 leading-normal">
                  Team A (North) and Team C (South) are on standby. Team B (West) dispatched at 20:47 to Seat Block 204. Incident resolving.
                </p>
              </div>
            </div>

            {/* Concession Stand revenue */}
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-white">Live Concessions Revenue</h4>
                <p className="text-xs text-gray-400 mt-1 leading-normal">
                  Total food/beverage retail has surpassed $248k, tracking 14% higher than model forecasts due to longer half-time queues.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

function LiveMatchHeader() {
  const [currentTime, setCurrentTime] = useState("");
  const [matchMinutes, setMatchMinutes] = useState(64);

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const clockTimer = setInterval(updateTime, 1000);

    const matchTimer = setInterval(() => {
      setMatchMinutes((prev) => (prev < 90 ? prev + 1 : 90));
    }, 15000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(matchTimer);
    };
  }, []);

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 font-mono text-sm text-gray-300">
        <Clock className="w-4 h-4 text-gray-500" />
        <span>UTC {currentTime}</span>
      </div>

      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 font-mono text-sm text-white">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        <span className="font-bold">MATCH LIVE: {matchMinutes}' MIN</span>
      </div>
    </div>
  );
}

function AttendanceWidget() {
  const [attendance, setAttendance] = useState(74210);

  useEffect(() => {
    const attendanceTimer = setInterval(() => {
      setAttendance((prev) => Math.min(prev + Math.floor(Math.random() * 20), 80000));
    }, 3000);
    return () => clearInterval(attendanceTimer);
  }, []);

  return (
    <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between">
      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Attendance</span>
        <span className="block text-2xl font-black text-white mt-1">{attendance.toLocaleString()}</span>
        <span className="text-[10px] text-[#22C55E] mt-1 flex items-center gap-1 font-semibold">
          <TrendingUp className="w-3.5 h-3.5" /> 92.7% CAPACITY
        </span>
      </div>
      <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] border border-[#3B82F6]/20">
        <Users className="w-5 h-5" />
      </div>
    </div>
  );
}
