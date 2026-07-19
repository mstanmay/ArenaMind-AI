"use client";

import { useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  HeartPulse,
  Navigation,
  Map,
  Users,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";

interface Responder {
  id: string;
  name: string;
  location: string;
  status: "Standby" | "Dispatched" | "Out of Service";
  action: string;
}

const INITIAL_RESPONDERS: Responder[] = [
  { id: "Team A", name: "Medical Crew Alpha", location: "North Station", status: "Standby", action: "Section 100 Egress" },
  { id: "Team B", name: "Trauma Crew Beta", location: "West Station", status: "Dispatched", action: "Section 204 Seat 14" },
  { id: "Team C", name: "Medical Crew Gamma", location: "South Station", status: "Standby", action: "General Standby" },
];

export default function EmergencyCenterPage() {
  const [responders, setResponders] = useState<Responder[]>(INITIAL_RESPONDERS);
  const [drillActive, setDrillActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"responders" | "routes">("responders");

  const handleDispatch = (teamId: string) => {
    const updated = responders.map((rep) => {
      if (rep.id === teamId) {
        const isDispatched = rep.status === "Dispatched";
        return {
          ...rep,
          status: isDispatched ? "Standby" : "Dispatched",
          action: isDispatched ? "General Standby" : "Section 104 Crowd Fall-in",
        } as Responder;
      }
      return rep;
    });
    setResponders(updated);
    confetti({
      particleCount: 30,
      spread: 20,
      colors: ["#EF4444", "#3B82F6"],
    });
  };

  const handleEvacDrill = () => {
    setDrillActive(!drillActive);
    if (!drillActive) {
      confetti({
        particleCount: 100,
        spread: 70,
        colors: ["#EF4444", "#F59E0B"],
      });
    }
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Top Warning Banner */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl glass-panel border border-red-500/20 bg-linear-to-r from-red-500/5 via-transparent to-transparent shadow-[0_0_20px_rgba(239,68,68,0.05)] animate-pulse">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/30 text-red-400">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-black text-2xl tracking-tight text-white">EMERGENCY COORDINATION SYSTEM</h1>
            <p className="text-xs text-red-400 font-mono tracking-widest uppercase">
              Incident dispatcher active // live GPS responder trackers
            </p>
          </div>
        </div>

        <button
          onClick={handleEvacDrill}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black rounded-xl transition-all cursor-pointer ${
            drillActive
              ? "bg-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              : "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-red-500/90"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {drillActive ? "CANCEL EVACUATION DRILL" : "TRIGGER EVACUATION DRILL"}
        </button>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left column: Incident log & Drills */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Active Incident status */}
          <div className="p-6 rounded-2xl glass-panel border border-red-500/20 bg-linear-to-b from-red-500/5 to-transparent space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 font-mono">INCIDENT REPORT</span>
              <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-black">HIGH PRIORITY</span>
            </div>
            
            <h3 className="font-heading font-bold text-base text-white">Section 204 Triage</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Guest reporting chest distress. Route map allocated. Team B dispatched.
            </p>

            <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Log Timestamp:</span>
                <span className="font-mono text-white">20:47:12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Response ETA:</span>
                <span className="font-mono text-[#00E5FF] font-bold">1m 15s</span>
              </div>
            </div>
          </div>

          {/* Drill status card */}
          <AnimatePresence>
            {drillActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 rounded-2xl glass-panel border border-red-500/30 bg-red-500/10 text-white space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <h4 className="font-heading font-bold text-xs uppercase tracking-widest">DRILL ACTIVE</h4>
                </div>
                <p className="text-[11px] leading-relaxed font-light text-red-200">
                  Diverting digital stadium boards to evacuation vectors. Re-routing gates to exit protocols. Standby emergency response units alerted.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Historical timeline logs */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-gray-400">Emergency Dispatch Log</h3>
            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
              
              <div className="relative pl-6">
                <div className="absolute left-1 w-2.5 h-2.5 rounded-full bg-red-500 top-1.5" />
                <span className="block text-[9px] font-mono text-red-400">20:48 // DISPATCH</span>
                <span className="block text-xs font-semibold text-white">Trauma Crew Beta dispatched</span>
              </div>

              <div className="relative pl-6">
                <div className="absolute left-1 w-2.5 h-2.5 rounded-full bg-[#00E5FF] top-1.5" />
                <span className="block text-[9px] font-mono text-[#00E5FF]">20:47 // INTAKE</span>
                <span className="block text-xs font-semibold text-white">Incident logged at Seat 204</span>
              </div>

            </div>
          </div>

        </div>

        {/* Center/Right: Maps & Responders */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Tabs header */}
          <div className="flex gap-4 border-b border-white/5 pb-2">
            <button
              onClick={() => setActiveTab("responders")}
              className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "responders" ? "text-[#00E5FF] border-b border-[#00E5FF]" : "text-gray-500 hover:text-white"
              }`}
            >
              Responder Crews
            </button>
            <button
              onClick={() => setActiveTab("routes")}
              className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "routes" ? "text-[#00E5FF] border-b border-[#00E5FF]" : "text-gray-500 hover:text-white"
              }`}
            >
              Evacuation Routes Vector
            </button>
          </div>

          {activeTab === "responders" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {responders.map((rep) => {
                const isDispatched = rep.status === "Dispatched";
                return (
                  <div key={rep.id} className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between h-[200px]">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-mono text-gray-500">{rep.location}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          isDispatched ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-[#22C55E]"
                        }`}>
                          {rep.status}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-base text-white">{rep.name}</h3>
                      <p className="text-xs text-gray-400 mt-1 leading-normal font-light">
                        Tasking: {rep.action}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDispatch(rep.id)}
                      className={`w-full py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        isDispatched
                          ? "bg-white/5 border border-white/5 text-gray-400 hover:text-white"
                          : "bg-red-500 text-black font-bold"
                      }`}
                    >
                      {isDispatched ? "Recall Standby" : "DISPATCH UNIT"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col items-center">
              <h3 className="font-heading font-black text-sm uppercase tracking-widest text-white mb-6 w-full text-left">
                Evacuation Exit Vector Schematic
              </h3>
              
              <div className="relative w-full max-w-lg bg-[#080B14]/40 border border-white/5 rounded-xl py-6 flex justify-center">
                <svg viewBox="0 0 400 240" className="w-full max-w-sm">
                  {/* Exit vectors schematic */}
                  <ellipse cx="200" cy="120" rx="150" ry="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                  
                  {/* Gate markers */}
                  <circle cx="200" cy="30" r="6" fill="#EF4444" />
                  <text x="185" y="20" fill="white" className="text-[8px] font-mono">GATE 1</text>
                  
                  <circle cx="350" cy="120" r="6" fill="#EF4444" />
                  <text x="315" y="110" fill="white" className="text-[8px] font-mono">GATE 2</text>

                  <circle cx="200" cy="210" r="6" fill="#EF4444" />
                  <text x="185" y="230" fill="white" className="text-[8px] font-mono">GATE 3</text>

                  <circle cx="50" cy="120" r="6" fill="#EF4444" />
                  <text x="55" y="110" fill="white" className="text-[8px] font-mono">GATE 4</text>

                  {/* Flow vectors lines */}
                  <path d="M 200 120 L 200 30" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray={drillActive ? "4,4" : "0"} className={drillActive ? "animate-pulse" : ""} />
                  <path d="M 200 120 L 350 120" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray={drillActive ? "4,4" : "0"} className={drillActive ? "animate-pulse" : ""} />
                  <path d="M 200 120 L 200 210" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray={drillActive ? "4,4" : "0"} className={drillActive ? "animate-pulse" : ""} />
                  <path d="M 200 120 L 50 120" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray={drillActive ? "4,4" : "0"} className={drillActive ? "animate-pulse" : ""} />
                </svg>
              </div>

              <span className="text-[10px] text-gray-500 font-mono mt-4">
                Vectors indicate automated route allocation logic calculated for quick crowd dissipation.
              </span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
