"use client";

import { useState } from "react";
import { m as motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import {
  TrendingUp,
  Cpu,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Activity
} from "lucide-react";
import confetti from "canvas-confetti";

// Mock data structures
const MOCK_DAILY_TRENDS = [
  { day: "Mon", crowd: 4000, revenue: 2400 },
  { day: "Tue", crowd: 3000, revenue: 1398 },
  { day: "Wed", crowd: 2000, revenue: 9800 },
  { day: "Thu", crowd: 2780, revenue: 3908 },
  { day: "Fri", crowd: 1890, revenue: 4800 },
  { day: "Sat", crowd: 8390, revenue: 13800 }, // Match Day
  { day: "Sun", crowd: 3490, revenue: 4300 },
];

const MOCK_GATE_DIST = [
  { name: "North Gate", value: 4500, color: "#00E5FF" },
  { name: "East Gate", value: 2200, color: "#7C3AED" },
  { name: "West Gate", value: 1800, color: "#3B82F6" },
  { name: "South Gate", value: 1500, color: "#22C55E" },
];

const MOCK_ENERGY_PREDICT = [
  { hr: "12:00", solar: 1.2, grid: 2.2 },
  { hr: "14:00", solar: 2.5, grid: 2.0 },
  { hr: "16:00", solar: 3.1, grid: 1.8 },
  { hr: "18:00", solar: 1.8, grid: 2.9 },
  { hr: "20:00", solar: 0.1, grid: 4.2 }, // Kickoff peak
  { hr: "22:00", solar: 0.0, grid: 3.8 },
];

export default function AnalyticsClient() {
  const [timeframe, setTimeframe] = useState("Last 7 Days");
  const [capacitySlider, setCapacitySlider] = useState(65); // in thousands
  
  // Calculate dynamic scaling values based on slider
  const simulatedQueue = Math.max(Math.round((capacitySlider - 40) * 0.4), 1);
  const simulatedRevenue = Math.round(capacitySlider * 3.1 * 10) / 10;

  const handleRecalculate = () => {
    confetti({
      particleCount: 40,
      spread: 30,
      colors: ["#00E5FF", "#3B82F6"],
    });
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Top Banner with filters */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl glass-panel border border-[#00E5FF]/20 shadow-[0_0_20px_rgba(0,229,255,0.05)]">
        <div>
          <h1 className="font-heading font-black text-2xl tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#00E5FF]" /> PREDICTIVE ANALYTICS ENGINE
          </h1>
          <p className="text-xs text-[#00E5FF] font-mono tracking-widest uppercase">
            Resolving operational datasets // regression models active
          </p>
        </div>

        <div className="flex gap-2">
          {["Last 24 Hours", "Last 7 Days", "Last 30 Days"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                timeframe === tf ? "bg-[#00E5FF] text-black" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Simulation Slider Card */}
      <div className="p-6 rounded-2xl glass-panel border border-[#7C3AED]/30 bg-linear-to-r from-[#7C3AED]/5 via-transparent to-transparent grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        
        {/* Slider Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#00E5FF]">AI Telemetry Sandbox</span>
          </div>
          <h3 className="font-heading font-bold text-lg text-white">Simulate Attendance Load</h3>
          <p className="text-xs text-gray-400 font-light leading-normal">
            Drag the slider to test stadium capacity impacts on queue delays and snack revenues.
          </p>
          
          <div className="pt-2 flex items-center gap-4">
            <input
              type="range"
              min="20"
              max="80"
              value={capacitySlider}
              onChange={(e) => setCapacitySlider(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
            />
            <span className="font-mono text-sm font-bold text-white whitespace-nowrap">{capacitySlider}k / 80k</span>
          </div>
        </div>

        {/* Mapped Outputs */}
        <div className="grid grid-cols-2 gap-4 lg:border-l lg:border-white/5 lg:pl-8">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Simulated Delay</span>
            <span className="text-xl font-black text-white">{simulatedQueue} mins</span>
            <span className="text-[9px] text-gray-500 block mt-1">Average gate queue</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Concessions Rev</span>
            <span className="text-xl font-black text-white">${simulatedRevenue}k</span>
            <span className="text-[9px] text-[#22C55E] font-bold block mt-1">+14% vs model</span>
          </div>
        </div>

        {/* Call to action */}
        <div className="flex justify-end lg:pl-8">
          <button
            onClick={handleRecalculate}
            className="flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider text-black bg-[#00E5FF] hover:bg-[#00E5FF]/90 rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] cursor-pointer"
          >
            Apply Models <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Recharts graph grids */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Daily Trends Area */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5">
          <h3 className="font-heading font-black text-sm uppercase tracking-widest text-white mb-6">
            Crowd Attendance & Revenue Daily curve
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DAILY_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCrowd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
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
                <Area type="monotone" dataKey="crowd" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorCrowd)" name="Attendance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gate distribution Donut */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          <div className="md:col-span-3">
            <h3 className="font-heading font-black text-sm uppercase tracking-widest text-white mb-4">
              Gate Influx Distribution
            </h3>
            <div className="space-y-2">
              {MOCK_GATE_DIST.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-xs p-1.5 rounded bg-white/1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-400 font-medium">{item.name}</span>
                  </div>
                  <span className="font-mono text-white font-bold">{Math.round((item.value / 10000) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_GATE_DIST}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {MOCK_GATE_DIST.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Grid Load */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 xl:col-span-2">
          <h3 className="font-heading font-black text-sm uppercase tracking-widest text-white mb-6">
            Energy Load Forecast Matrix (MW / hr)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_ENERGY_PREDICT} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="hr" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
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
                <Line type="monotone" dataKey="solar" stroke="#00E5FF" strokeWidth={2.5} name="Solar output" />
                <Line type="monotone" dataKey="grid" stroke="#7C3AED" strokeWidth={2.5} name="Grid consumption" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
