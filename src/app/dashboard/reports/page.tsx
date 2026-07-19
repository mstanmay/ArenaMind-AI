"use client";

import { useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  Database,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Cpu
} from "lucide-react";
import confetti from "canvas-confetti";

interface Report {
  id: string;
  name: string;
  type: "PDF" | "CSV" | "JSON";
  size: string;
  date: string;
  status: "Ready" | "Generating...";
}

const INITIAL_REPORTS: Report[] = [
  { id: "REP-901", name: "Egress Crowd Flow Audit", type: "PDF", size: "4.2 MB", date: "Today 20:30", status: "Ready" },
  { id: "REP-899", name: "Concessions Revenue & Stock Audit", type: "CSV", size: "1.8 MB", date: "Today 19:45", status: "Ready" },
  { id: "REP-895", name: "Perimeter Security & Incident Log", type: "PDF", size: "12.4 MB", date: "Today 18:00", status: "Ready" },
  { id: "REP-890", name: "Energy Grid Efficiency Report", type: "JSON", size: "840 KB", date: "Yesterday 23:00", status: "Ready" },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate generation
    setTimeout(() => {
      const newReport: Report = {
        id: `REP-${Math.floor(Math.random() * 100) + 910}`,
        name: "Telemetry Real-time Operations Log",
        type: "PDF",
        size: "3.1 MB",
        date: "Just now",
        status: "Ready"
      };

      setReports((prev) => [newReport, ...prev]);
      setIsGenerating(false);
      
      confetti({
        particleCount: 50,
        spread: 40,
        colors: ["#3B82F6", "#00E5FF"],
      });
    }, 2000);
  };

  const handleDownload = (name: string) => {
    confetti({
      particleCount: 20,
      spread: 20,
      origin: { y: 0.8 },
      colors: ["#00E5FF"],
    });
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl glass-panel border border-white/5">
        <div>
          <h1 className="font-heading font-black text-2xl tracking-tight text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-gray-400" /> COMPILATION & ARCHIVES CENTER
          </h1>
          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">
            resolving compliance reports // cryptographic auditing enabled
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-[#00E5FF] hover:bg-[#00E5FF]/90 rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating ? "COMPILING Telemetry..." : "GENERATE COMPLIANCE REPORT"}
        </button>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left column: AI Insight briefing */}
        <div className="xl:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-[#7C3AED]/30 bg-linear-to-b from-[#7C3AED]/5 to-transparent space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00E5FF] animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-[#00E5FF]">AI Executive Briefing</span>
            </div>

            <h3 className="font-heading font-bold text-sm text-white">Solar grid efficiency yield</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Solar power yield exceeded local grid requirements by 12% today, reducing total operations cost by $4,200.
            </p>

            <div className="pt-2 border-t border-white/5 text-[10px] text-gray-500 font-mono flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" /> +12.4% yield efficiency
            </div>
          </div>
        </div>

        {/* Center/Right column: Reports list */}
        <div className="xl:col-span-3 space-y-6">
          
          <div className="p-6 rounded-2xl glass-panel border border-white/5">
            <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-white mb-4">
              Downloadable Operational Audits
            </h3>

            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/1 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-0.5 rounded font-mono uppercase">
                        {report.type} // {report.size}
                      </span>
                      <h4 className="font-heading font-bold text-sm text-white mt-1">{report.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{report.id} // Compiled: {report.date}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(report.name)}
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] text-gray-400 transition-all border border-white/5 cursor-pointer"
                    title="Download Archive"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
