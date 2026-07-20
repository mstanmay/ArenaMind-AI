"use client";

import { useState } from "react";
import { m as motion } from "framer-motion";
import {
  Users,
  Timer,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ArrowDownRight,
  TrendingDown,
  Sparkles
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import confetti from "canvas-confetti";

const MOCK_FLOW_DATA = [
  { time: "18:00", inflow: 120, outflow: 80 },
  { time: "18:30", inflow: 340, outflow: 140 },
  { time: "19:00", inflow: 880, outflow: 320 },
  { time: "19:30", inflow: 1450, outflow: 520 },
  { time: "20:00", inflow: 980, outflow: 890 },
  { time: "20:30", inflow: 310, outflow: 820 },
  { time: "21:00", inflow: 140, outflow: 450 },
];

const INITIAL_GATES = [
  { name: "North Gate 4", queueTime: 14, rate: 440, staff: 8, status: "Critical Peak", color: "border-red-500/30 text-red-400" },
  { name: "South Gate 3", queueTime: 4, rate: 210, staff: 10, status: "Optimal", color: "border-green-500/30 text-green-400" },
  { name: "West Gate 1", queueTime: 2, rate: 120, staff: 6, status: "Underutilized", color: "border-blue-500/30 text-blue-400" },
  { name: "East Gate 2", queueTime: 1, rate: 90, staff: 6, status: "Underutilized", color: "border-blue-500/30 text-blue-400" },
];

export default function CrowdIntelligencePage() {
  const [gates, setGates] = useState(INITIAL_GATES);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleDispatchStaff = (index: number) => {
    const updated = [...gates];
    if (updated[index].queueTime > 2) {
      updated[index].queueTime = Math.max(updated[index].queueTime - 4, 2);
      updated[index].staff += 2;
      if (updated[index].queueTime <= 4) {
        updated[index].status = "Optimal";
        updated[index].color = "border-green-500/30 text-green-400";
      } else if (updated[index].queueTime <= 9) {
        updated[index].status = "Warning";
        updated[index].color = "border-amber-500/30 text-amber-400";
      }
      setGates(updated);
      confetti({
        particleCount: 40,
        spread: 30,
        colors: ["#22C55E", "#00E5FF"],
      });
    }
  };

  const handleSimulateRefresh = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const updated = gates.map((gate) => {
        const change = Math.floor(Math.random() * 3) - 1;
        const newQueue = Math.max(gate.queueTime + change, 1);
        let status = "Optimal";
        let color = "border-green-500/30 text-green-400";

        if (newQueue > 10) {
          status = "Critical Peak";
          color = "border-red-500/30 text-red-400";
        } else if (newQueue > 5) {
          status = "Warning";
          color = "border-amber-500/30 text-amber-400";
        } else if (newQueue <= 2) {
          status = "Underutilized";
          color = "border-blue-500/30 text-blue-400";
        }

        return { ...gate, queueTime: newQueue, status, color };
      });
      setGates(updated);
      setIsSimulating(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl glass-panel border border-[#22C55E]/20 shadow-[0_0_20px_rgba(34,197,94,0.05)]">
        <div>
          <h1 className="font-heading font-black text-2xl tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#22C55E]" /> CROWD DYNAMICS INTELLIGENCE
          </h1>
          <p className="text-xs text-[#22C55E] font-mono tracking-widest uppercase">
            Resolving ingress flow vectors // predictive dissipation maps active
          </p>
        </div>

        <button
          onClick={handleSimulateRefresh}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-[#22C55E] hover:bg-[#22C55E]/90 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
          {isSimulating ? "SIMULATING..." : "RUN FLOW MODEL"}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Average wait time</span>
          <span className="block text-2xl font-black text-white mt-1">5.25 mins</span>
          <span className="text-[10px] text-[#22C55E] mt-1 flex items-center gap-1 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" /> -12% vs last match
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Peak inflow rate</span>
          <span className="block text-2xl font-black text-white mt-1">1,450 guests / min</span>
          <span className="text-[10px] text-[#22C55E] mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> Recorded at 19:30
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Active bottleneck nodes</span>
          <span className="block text-2xl font-black text-white mt-1">1 critical</span>
          <span className="text-[10px] text-red-400 mt-1 flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" /> North Gate 4 peaking
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-[#7C3AED]/20 bg-linear-to-b from-[#7C3AED]/5 to-transparent">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#00E5FF] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#00E5FF] animate-pulse" /> AI Flow mitigation
          </span>
          <span className="block text-2xl font-black text-white mt-1">Activated</span>
          <span className="text-[10px] text-[#00E5FF] mt-1 font-semibold">
            East Gate diversion recommended
          </span>
        </div>

      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Inflow vs Outflow */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5">
          <h3 className="font-heading font-black text-sm uppercase tracking-widest text-white mb-6">
            Inflow vs Dissipation Rate (Guests/min)
          </h3>
          <div className="h-70 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_FLOW_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
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
                <Area type="monotone" dataKey="inflow" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorInflow)" name="Inflow Rate" />
                <Area type="monotone" dataKey="outflow" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorOutflow)" name="Outflow Rate" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gate wait times chart */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5">
          <h3 className="font-heading font-black text-sm uppercase tracking-widest text-white mb-6">
            Sensor Queue Wait Times (Minutes)
          </h3>
          <div className="h-70 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gates} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
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
                <Bar dataKey="queueTime" fill="#00E5FF" radius={[8, 8, 0, 0]} maxBarSize={45} name="Wait Time (m)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Interactive Gate table control */}
      <div className="p-6 rounded-2xl glass-panel border border-white/5">
        <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-white mb-4">
          Gate Operations Console
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="pb-3">Gate Terminal</th>
                <th className="pb-3">Status Badge</th>
                <th className="pb-3 text-right">Wait Time</th>
                <th className="pb-3 text-right">Flow Influx Rate</th>
                <th className="pb-3 text-right">Assigned Staff</th>
                <th className="pb-3 text-center">Action Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {gates.map((gate, index) => (
                <tr key={gate.name} className="hover:bg-white/1 transition-all">
                  <td className="py-4 font-semibold text-white">{gate.name}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold ${gate.color}`}>
                      {gate.status}
                    </span>
                  </td>
                  <td className="py-4 text-right font-mono text-white font-bold">{gate.queueTime} mins</td>
                  <td className="py-4 text-right font-mono text-gray-400">{gate.rate} guests/m</td>
                  <td className="py-4 text-right font-mono text-gray-400">{gate.staff} marshals</td>
                  <td className="py-4 text-center">
                    <button
                      onClick={() => handleDispatchStaff(index)}
                      disabled={gate.queueTime <= 2}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-[#22C55E]/10 hover:border-[#22C55E]/20 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Deploy +2 Staff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
