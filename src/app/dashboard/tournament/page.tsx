"use client";

import { useState } from "react";
import {
  Trophy,
  CloudSun,
  UserCheck,
  CheckCircle,
  Thermometer,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";

interface Match {
  id: string;
  home: string;
  away: string;
  time: string;
  stage: string;
  readiness: number;
}

const MOCK_MATCHES: Match[] = [
  { id: "M-101", home: "Real Madrid", away: "Barcelona", time: "LIVE (64')", stage: "Finals", readiness: 100 },
  { id: "M-102", home: "Manchester City", away: "Bayern Munich", time: "Tomorrow 20:00", stage: "Semi-Final A", readiness: 95 },
  { id: "M-103", home: "PSG", away: "Arsenal", time: "July 18, 20:00", stage: "Semi-Final B", readiness: 80 },
];

export default function TournamentOperationsPage() {
  const matches = MOCK_MATCHES;
  const [selectedMatch, setSelectedMatch] = useState<Match>(MOCK_MATCHES[0]);
  const [activeTeam, setActiveTeam] = useState<"home" | "away">("home");
  
  // Venue readiness checklist state
  const [checklist, setChecklist] = useState({
    pitchMarkings: true,
    varCalibration: true,
    scoreboards: true,
    lockerRooms: true,
    audioPA: true,
    floodlights: true,
  });

  const [acAdjusted, setAcAdjusted] = useState(false);

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate readiness percentage based on checklist
  const getReadinessPercentage = () => {
    const items = Object.values(checklist);
    const completed = items.filter(Boolean).length;
    return Math.round((completed / items.length) * 100);
  };

  const handleAdjustAC = () => {
    setAcAdjusted(true);
    confetti({
      particleCount: 50,
      spread: 40,
      colors: ["#3B82F6", "#00E5FF"],
    });
  };

  const readiness = getReadinessPercentage();

  return (
    <div className="space-y-8 select-none">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl glass-panel border border-[#3B82F6]/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]">
        <div>
          <h1 className="font-heading font-black text-2xl tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#3B82F6]" /> TOURNAMENT LOGISTICS BRAIN
          </h1>
          <p className="text-xs text-[#3B82F6] font-mono tracking-widest uppercase">
            Synchronizing team rosters // official pitch credentials verified
          </p>
        </div>
      </div>

      {/* Grid structure */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left column: Match schedules */}
        <div className="xl:col-span-1 space-y-6">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block mb-2">Match Schedule</span>
          
          {matches.map((match) => {
            const isSelected = match.id === selectedMatch.id;
            return (
              <div
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`p-5 rounded-2xl glass-panel border cursor-pointer transition-all ${
                  isSelected ? "border-[#3B82F6]" : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded font-mono">
                    {match.stage}
                  </span>
                  <span className="text-[10px] text-[#00E5FF] font-mono font-bold">{match.time}</span>
                </div>
                
                <h4 className="font-heading font-bold text-sm text-white">
                  {match.home} vs {match.away}
                </h4>

                <div className="flex items-center gap-1.5 mt-4 text-[10px] text-gray-500 font-mono">
                  <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" /> Readiness: {match.readiness}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Center/Right columns: Telemetry & Checklist */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Main Telemetry & Checklist Split */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Team Locker Telemetry (3 cols) */}
            <div className="lg:col-span-3 p-6 rounded-2xl glass-panel border border-white/5 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="font-heading font-black text-sm uppercase tracking-widest text-white">
                  Dressing Room Telemetry
                </h3>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTeam("home")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      activeTeam === "home" ? "bg-[#3B82F6] text-black" : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Real Madrid
                  </button>
                  <button
                    onClick={() => setActiveTeam("away")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      activeTeam === "away" ? "bg-[#3B82F6] text-black" : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Barcelona
                  </button>
                </div>
              </div>

              {/* Roster & Telemetry values */}
              <div className="grid grid-cols-2 gap-6">
                
                {/* Temp gauges */}
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block">Climate Metrics</span>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/1 border border-white/5">
                    <Thermometer className="w-5 h-5 text-[#00E5FF]" />
                    <div>
                      <span className="text-[10px] text-gray-400 block">Locker Temp</span>
                      <span className="font-mono text-sm font-bold text-white">
                        {activeTeam === "home" ? "21.4 °C" : acAdjusted ? "19.0 °C" : "21.0 °C"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/1 border border-white/5">
                    <Thermometer className="w-5 h-5 text-[#7C3AED]" />
                    <div>
                      <span className="text-[10px] text-gray-400 block">Humidity</span>
                      <span className="font-mono text-sm font-bold text-white">44.2 %</span>
                    </div>
                  </div>
                </div>

                {/* Team Status Check */}
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block">Readiness Logs</span>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Lockers Sealed:</span>
                      <span className="font-mono text-[#22C55E] font-bold">YES</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">VAR Headset Check:</span>
                      <span className="font-mono text-[#22C55E] font-bold">YES</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Roster Submitted:</span>
                      <span className="font-mono text-[#22C55E] font-bold">YES</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Dynamic AI AC alert */}
              {activeTeam === "away" && (
                <div className="p-4 rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-[#00E5FF] animate-pulse shrink-0" />
                    <p className="text-xs text-gray-300 font-light">
                      Barcelona requested AC target temperature reduced to <span className="text-[#00E5FF] font-bold">19°C</span>.
                    </p>
                  </div>
                  
                  {acAdjusted ? (
                    <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Climate Adjusted
                    </span>
                  ) : (
                    <button
                      onClick={handleAdjustAC}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-black bg-[#00E5FF] hover:bg-[#00E5FF]/90 transition-all cursor-pointer"
                    >
                      Approve Climate
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Venue Readiness Checklist (2 cols) */}
            <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-xs uppercase tracking-widest text-gray-500 mb-4">
                  Venue Readiness ({readiness}%)
                </h3>

                <div className="space-y-2">
                  {[
                    { id: "pitchMarkings", label: "Pitch Markings Checked" },
                    { id: "varCalibration", label: "VAR Cameras Calibrated" },
                    { id: "scoreboards", label: "Digital Scoreboards Ready" },
                    { id: "lockerRooms", label: "Locker Rooms Sealed" },
                    { id: "audioPA", label: "PA Sound Test Clear" },
                    { id: "floodlights", label: "Floodlights Grid Active" },
                  ].map((item) => {
                    const isChecked = checklist[item.id as keyof typeof checklist];
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleCheck(item.id as keyof typeof checklist)}
                        className={`flex items-center justify-between w-full p-2.5 rounded-xl border text-[11px] font-semibold tracking-wide transition-all cursor-pointer ${
                          isChecked
                            ? "bg-white/5 border-[#3B82F6]/20 text-white"
                            : "bg-white/1 border-white/5 text-gray-500 hover:text-white"
                        }`}
                      >
                        <span>{item.label}</span>
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isChecked ? "border-[#3B82F6] bg-[#3B82F6]/10" : "border-gray-600"}`}>
                          {isChecked && <div className="w-1.5 h-1.5 rounded bg-[#3B82F6]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom section: Weather impact & Officials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Weather station */}
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center shrink-0">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-white">Weather Impact Matrix</h4>
                <p className="text-xs text-gray-400 mt-1 leading-normal font-light">
                  Humidity: 44%, Wind: 6km/h (East). Precipitation probability 5% for next 3 hours. No roof deployment required. Pitch dry coefficient: optimal.
                </p>
              </div>
            </div>

            {/* Match Officials */}
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-500/10 border border-white/10 text-gray-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-white">Match Officials Inspector</h4>
                <p className="text-xs text-gray-400 mt-1 leading-normal font-light">
                  Head Referee: Marciniak (UEFA). Pitch walkthrough sign-off: <span className="text-[#22C55E] font-bold">COMPLETE</span>. VAR coordinator sync-check: <span className="text-[#22C55E] font-bold">PASSED</span>.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
