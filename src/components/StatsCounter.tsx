"use client";

import { useEffect, useState } from "react";

export default function StatsCounter() {
  const [stats, setStats] = useState({ safety: 90, delay: 0, crowd: 0, revenue: 0 });

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setStats({
        safety: Math.min(Math.floor((currentStep / steps) * 9.8) + 90, 99.8),
        delay: Math.min(Math.floor((currentStep / steps) * 35), 35),
        crowd: Math.min(Math.floor((currentStep / steps) * 4.2 * 10) / 10, 4.2),
        revenue: Math.min(Math.floor((currentStep / steps) * 80), 80),
      });

      if (currentStep >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      <div className="text-center">
        <span className="block font-heading font-black text-5xl md:text-6xl text-white mb-2 font-mono">
          {stats.safety.toFixed(1)}%
        </span>
        <span className="text-xs uppercase font-bold tracking-widest text-[#00E5FF]">Safety Index</span>
      </div>

      <div className="text-center">
        <span className="block font-heading font-black text-5xl md:text-6xl text-white mb-2 font-mono">
          -{stats.delay}%
        </span>
        <span className="text-xs uppercase font-bold tracking-widest text-[#22C55E]">Gate Queue Delay</span>
      </div>

      <div className="text-center">
        <span className="block font-heading font-black text-5xl md:text-6xl text-white mb-2 font-mono">
          {stats.crowd.toFixed(1)}M+
        </span>
        <span className="text-xs uppercase font-bold tracking-widest text-[#7C3AED]">Guests Coordinated</span>
      </div>

      <div className="text-center">
        <span className="block font-heading font-black text-5xl md:text-6xl text-white mb-2 font-mono">
          {stats.revenue}k+
        </span>
        <span className="text-xs uppercase font-bold tracking-widest text-[#F59E0B]">AI Vendor Decisions</span>
      </div>
    </div>
  );
}
