"use client";

import { useState } from "react";
import {
  Store,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import confetti from "canvas-confetti";

const MOCK_ZONE_REVENUE = [
  { zone: "North Grill", food: 45, drink: 32 },
  { zone: "East Brews", food: 22, drink: 68 },
  { zone: "South Tacos", food: 54, drink: 28 },
  { zone: "West Pizza", food: 38, drink: 30 },
];

const MOCK_DEMAND_FORECAST = [
  { time: "18:00", demand: 15 },
  { time: "18:30", demand: 35 },
  { time: "19:00", demand: 85 }, // kickoff
  { time: "19:30", demand: 40 },
  { time: "20:00", demand: 120 }, // half-time peak
  { time: "20:30", demand: 45 },
  { time: "21:00", demand: 90 }, // post-match peak
];

const INITIAL_STOCKS = [
  { name: "North Grill #1", item: "Hot Dog Buns", stock: 12, prediction: "Stock depletion in 15 mins", type: "critical" },
  { name: "West Pizza #3", item: "Cheese Blend", stock: 18, prediction: "Stock depletion in 25 mins", type: "warning" },
  { name: "East Brews #2", item: "Keg Barrels", stock: 85, prediction: "Sufficient supply", type: "optimal" },
];

export default function VendorIntelligencePage() {
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [reallocated, setReallocated] = useState(false);

  const handleReallocate = () => {
    setReallocated(true);
    const updated = stocks.map((st) => {
      if (st.type === "critical") {
        return { ...st, stock: 90, prediction: "Restocked from reserve depot", type: "optimal" };
      }
      return st;
    });
    setStocks(updated);
    confetti({
      particleCount: 50,
      spread: 40,
      colors: ["#22C55E", "#00E5FF"],
    });
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl glass-panel border border-[#22C55E]/20 shadow-[0_0_20px_rgba(34,197,94,0.05)]">
        <div>
          <h1 className="font-heading font-black text-2xl tracking-tight text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-[#22C55E]" /> CONCESSION & RETAIL FORECASTER
          </h1>
          <p className="text-xs text-[#22C55E] font-mono tracking-widest uppercase">
            Resolving vendor sales rates // dynamic demand optimization online
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Total food sales</span>
          <span className="block text-2xl font-black text-white mt-1">$248,210</span>
          <span className="text-[10px] text-[#22C55E] mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs target
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Average transaction size</span>
          <span className="block text-2xl font-black text-white mt-1">$18.50</span>
          <span className="text-[10px] text-gray-400 mt-1">
            2.4 items per cart
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Stock alert nodes</span>
          <span className="block text-2xl font-black text-white mt-1">1 Critical</span>
          <span className="text-[10px] text-red-400 mt-1 flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" /> North Grill buns low
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-[#7C3AED]/20 bg-linear-to-b from-[#7C3AED]/5 to-transparent">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#00E5FF] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" /> AI Inventory advise
          </span>
          <span className="block text-2xl font-black text-white mt-1">Allocated</span>
          <span className="text-[10px] text-[#00E5FF] mt-1 font-semibold">
            Reserve depot route mapped
          </span>
        </div>

      </div>

      {/* Recharts graphs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Sales by Zone */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5">
          <h3 className="font-heading font-black text-sm uppercase tracking-widest text-white mb-6">
            Concession Revenue by Zone (k$)
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ZONE_REVENUE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="zone" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
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
                <Bar dataKey="food" fill="#00E5FF" radius={[6, 6, 0, 0]} name="Food sales" />
                <Bar dataKey="drink" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Beverage sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand forecast over time */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5">
          <h3 className="font-heading font-black text-sm uppercase tracking-widest text-white mb-6">
            Peak Demand Projection Curve (Guests/m)
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DEMAND_FORECAST} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemandPeak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
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
                <Area type="monotone" dataKey="demand" stroke="#22C55E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDemandPeak)" name="Demand factor" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Stock tracking grid */}
      <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/5">
          <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-white">
            Inventory Dispatch & Optimization
          </h3>
          
          {reallocated ? (
            <span className="text-xs font-semibold text-[#22C55E] flex items-center gap-1">
              ✓ Stock re-allocated. Supply levels optimal.
            </span>
          ) : (
            <button
              onClick={handleReallocate}
              className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-black bg-[#22C55E] hover:bg-[#22C55E]/90 rounded-xl transition-all cursor-pointer"
            >
              Optimize Stock Levels <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stocks.map((st) => (
            <div key={st.name} className="p-4 rounded-xl bg-white/1 border border-white/5 flex flex-col justify-between h-[155px]">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono text-gray-500">{st.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    st.type === "critical"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                      : st.type === "warning"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-green-500/20 text-[#22C55E] border border-green-500/30"
                  }`}>
                    {st.type}
                  </span>
                </div>
                
                <h4 className="font-heading font-bold text-sm text-white">{st.item}</h4>
                <p className="text-[11px] text-gray-400 mt-2 font-light">{st.prediction}</p>
              </div>

              {/* Progress Level bar */}
              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-[9px] font-mono text-gray-500">
                  <span>Supply level</span>
                  <span className="text-white font-bold">{st.stock}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      st.type === "critical" ? "bg-red-500" : st.type === "warning" ? "bg-amber-500" : "bg-[#22C55E]"
                    }`}
                    style={{ width: `${st.stock}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
