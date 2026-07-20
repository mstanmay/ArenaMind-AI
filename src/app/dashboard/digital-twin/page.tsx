"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const DigitalTwinClient = dynamic(() => import("@/components/DigitalTwinClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-125">
      <div className="relative flex flex-col items-center gap-4 text-[#7C3AED]">
        <div className="absolute inset-0 bg-[#7C3AED]/20 blur-xl rounded-full" />
        <Loader2 className="w-10 h-10 animate-spin relative z-10" />
        <p className="text-sm font-mono uppercase tracking-widest relative z-10">Initializing 3D Stadium Mesh...</p>
      </div>
    </div>
  ),
});

export default function DigitalTwinPage() {
  return <DigitalTwinClient />;
}
