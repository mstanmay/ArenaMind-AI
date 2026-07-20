"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the heavy dashboard client with Recharts to split the bundle
const DashboardClient = dynamic(() => import("@/components/DashboardClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center min-h-125">
      <div className="flex flex-col items-center gap-4 text-[#00E5FF]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest">Loading Telemetry...</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return <DashboardClient />;
}
