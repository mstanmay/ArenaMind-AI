"use client";

import { useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Zap,
  Star,
  Navigation,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import confetti from "canvas-confetti";

// Mock parking trend data
const MOCK_PARKING_TREND = [
  { time: "16:00", lotA: 20, lotB: 10, lotC: 5 },
  { time: "17:00", lotA: 55, lotB: 35, lotC: 15 },
  { time: "18:00", lotA: 85, lotB: 68, lotC: 45 },
  { time: "19:00", lotA: 98, lotB: 89, lotC: 78 },
  { time: "20:00", lotA: 99, lotB: 92, lotC: 84 },
  { time: "21:00", lotA: 94, lotB: 85, lotC: 80 },
];

const MOCK_VIP_LIST = [
  { plate: "TX-901-Z", vehicle: "Tesla Model S Plaid", owner: "Official delegation", block: "VIP-A", status: "Parked" },
  { plate: "CA-224-R", vehicle: "Audi e-tron GT", owner: "Press official", block: "VIP-B", status: "Parked" },
  { plate: "NY-502-K", vehicle: "Mercedes EQS", owner: "Team Director", block: "VIP-A", status: "Approaching" },
];

export default function ParkingIntelligencePage() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>("Block A");
  const [redirected, setRedirected] = useState(false);

  const handleRedirect = () => {
    setRedirected(true);
    confetti({
      particleCount: 50,
      spread: 40,
      colors: ["#F59E0B", "#00E5FF"],
    });
  };

  const getBlockDetails = () => {
    switch (selectedBlock) {
      case "Block A":
        return { name: "Block A (VIP & Press)", total: 500, filled: 490, ev: 40, status: "Critical (98%)", action: "Lock entry for VIP only" };
      case "Block B":
        return { name: "Block B (East Gate)", total: 1200, filled: 1060, ev: 60, status: "Near Peak (88%)", action: "Divert flow to Block C" };
      case "Block C":
        return { name: "Block C (West Gate)", total: 1800, filled: 1240, ev: 20, status: "Moderate (68%)", action: "Divert flow to Block C" };
      case "Block D":
        return { name: "Block D (Peripheral)", total: 2000, filled: 800, ev: 10, status: "Optimal (40%)", action: "Divert ingress lanes here" };
      default:
        return null;
    }
  };

  const details = getBlockDetails();

  return (
    <div className="space-y-8 select-none">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl glass-panel border border-[#F59E0B]/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
        <div>
          <h1 className="font-heading font-black text-2xl tracking-tight text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-[#F59E0B]" /> PARKING VECTOR CONTROL
          </h1>
          <p className="text-xs text-[#F59E0B] font-mono tracking-widest uppercase">
            Resolving space capacity telemetry // EV charging grid optimized
          </p>
        </div>
      </div>

      {/* Main Grid: Info Cards & SVGs */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column: Lot details & suggestion */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Availability Metrics */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-gray-400">Availability Matrix</h3>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-lg font-black text-white">490</span>
                <span className="text-[9px] text-[#F59E0B] font-bold">VIP ZONE</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-lg font-black text-white">120</span>
                <span className="text-[9px] text-[#00E5FF] font-bold">EV SLOTS</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-lg font-black text-white">1,840</span>
                <span className="text-[9px] text-[#22C55E] font-bold">VACANT</span>
              </div>
            </div>
          </div>

          {/* Navigation Recommendation */}
          <div className="p-6 rounded-2xl glass-panel border border-[#F59E0B]/30 bg-linear-to-b from-[#F59E0B]/5 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs font-black uppercase tracking-wider text-[#F59E0B]">AI Transit reroute</span>
            </div>
            
            <h4 className="font-heading font-bold text-sm text-white leading-tight">Divert East Ingress to Block D</h4>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed font-light">
              Lot B is at 88% capacity. Redirecting approaching general ticket-holders to Block D will reduce access highway delay by 6 minutes.
            </p>

            {redirected ? (
              <div className="mt-4 py-2.5 text-center text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg">
                Ingress signs modified. Lanes diverted.
              </div>
            ) : (
              <button
                onClick={handleRedirect}
                className="w-full mt-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-black bg-[#F59E0B] hover:bg-[#F59E0B]/90 rounded-lg transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
              >
                Execute Divert Strategy
              </button>
            )}
          </div>

          {/* EV Charging stand meters */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#00E5FF]" /> Active EV Chargers (Grid)
            </span>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">EV Station #01</span>
                <span className="font-mono text-[#00E5FF] font-bold">95% (Tesla Plaid)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-[#00E5FF] rounded-full" style={{ width: "95%" }} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">EV Station #02</span>
                <span className="font-mono text-[#00E5FF] font-bold">64% (Audi GT)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-[#00E5FF] rounded-full" style={{ width: "64%" }} />
              </div>
            </div>
          </div>

        </div>

        {/* Center/Right Content: Interactive Map & Charts */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Interactive Parking SVG Grid Map (3 cols) */}
            <div className="lg:col-span-3 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-sm uppercase tracking-widest text-white mb-6">
                  Interactive Lots map
                </h3>

                <div className="flex justify-center py-4 bg-[#080B14]/40 rounded-xl border border-white/5">
                  <svg viewBox="0 0 400 240" className="w-full max-w-sm">
                    {/* Parking lot blocks representation */}
                    <g className="cursor-pointer" onClick={() => setSelectedBlock("Block A")}>
                      <rect x="30" y="30" width="140" height="70" rx="8" fill={selectedBlock === "Block A" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.02)"} stroke={selectedBlock === "Block A" ? "#F59E0B" : "rgba(255,255,255,0.1)"} strokeWidth={selectedBlock === "Block A" ? 2 : 1} />
                      <text x="65" y="70" fill="white" className="text-xs font-bold font-heading">BLOCK A</text>
                      <circle cx="150" cy="50" r="4" fill="#EF4444" />
                    </g>

                    <g className="cursor-pointer" onClick={() => setSelectedBlock("Block B")}>
                      <rect x="210" y="30" width="140" height="70" rx="8" fill={selectedBlock === "Block B" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.02)"} stroke={selectedBlock === "Block B" ? "#F59E0B" : "rgba(255,255,255,0.1)"} strokeWidth={selectedBlock === "Block B" ? 2 : 1} />
                      <text x="245" y="70" fill="white" className="text-xs font-bold font-heading">BLOCK B</text>
                      <circle cx="330" cy="50" r="4" fill="#EF4444" />
                    </g>

                    <g className="cursor-pointer" onClick={() => setSelectedBlock("Block C")}>
                      <rect x="30" y="130" width="140" height="70" rx="8" fill={selectedBlock === "Block C" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.02)"} stroke={selectedBlock === "Block C" ? "#F59E0B" : "rgba(255,255,255,0.1)"} strokeWidth={selectedBlock === "Block C" ? 2 : 1} />
                      <text x="65" y="170" fill="white" className="text-xs font-bold font-heading">BLOCK C</text>
                      <circle cx="150" cy="150" r="4" fill="#22C55E" />
                    </g>

                    <g className="cursor-pointer" onClick={() => setSelectedBlock("Block D")}>
                      <rect x="210" y="130" width="140" height="70" rx="8" fill={selectedBlock === "Block D" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.02)"} stroke={selectedBlock === "Block D" ? "#F59E0B" : "rgba(255,255,255,0.1)"} strokeWidth={selectedBlock === "Block D" ? 2 : 1} />
                      <text x="245" y="170" fill="white" className="text-xs font-bold font-heading">BLOCK D</text>
                      <circle cx="330" cy="150" r="4" fill="#22C55E" />
                    </g>
                  </svg>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 font-mono mt-4">
                Click any zone layout blocks to inspect capacities and route actions.
              </span>
            </div>

            {/* Block Inspector (2 cols) */}
            <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-xs uppercase tracking-widest text-gray-500">
                  Block Inspector
                </h3>

                <AnimatePresence mode="wait">
                  {details ? (
                    <motion.div
                      key={details.name}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4 mt-4"
                    >
                      <h4 className="font-heading font-bold text-base text-white">{details.name}</h4>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-gray-400">Lot Status:</span>
                          <span className="font-mono text-white font-bold">{details.status}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-gray-400">Total Spaces:</span>
                          <span className="font-mono text-white font-bold">{details.total} slots</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-gray-400">Occupied:</span>
                          <span className="font-mono text-white font-bold">{details.filled} slots</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-gray-400">EV Chargers:</span>
                          <span className="font-mono text-white font-semibold">{details.ev} chargers</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {details && (
                <div className="pt-4 border-t border-white/5 text-xs text-[#F59E0B] font-semibold flex items-center gap-2">
                  <Star className="w-4 h-4 shrink-0 fill-current" />
                  <span>Recommendation: {details.action}</span>
                </div>
              )}
            </div>

          </div>

          {/* Occupancy Projection Curves */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5">
            <h3 className="font-heading font-black text-sm uppercase tracking-widest text-white mb-6">
              Lot Occupancy Projection Curve (%)
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_PARKING_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <Line type="monotone" dataKey="lotA" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4 }} name="Block A (VIP)" />
                  <Line type="monotone" dataKey="lotB" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} name="Block B (East)" />
                  <Line type="monotone" dataKey="lotC" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 4 }} name="Block C (West)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* VIP arrivals logs */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5">
            <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-white mb-4">
              VIP Vehicle Log Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="pb-3">License Plate</th>
                    <th className="pb-3">Vehicle Spec</th>
                    <th className="pb-3">Credential Holder</th>
                    <th className="pb-3">Lot Allocation</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_VIP_LIST.map((vip) => (
                    <tr key={vip.plate} className="hover:bg-white/1">
                      <td className="py-4 font-mono font-bold text-[#F59E0B]">{vip.plate}</td>
                      <td className="py-4 text-white font-medium">{vip.vehicle}</td>
                      <td className="py-4 text-gray-400">{vip.owner}</td>
                      <td className="py-4 font-mono text-gray-400">{vip.block}</td>
                      <td className="py-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          vip.status === "Parked"
                            ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20"
                            : "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20 animate-pulse"
                        }`}>
                          {vip.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
