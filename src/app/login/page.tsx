"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col items-center justify-center text-gray-400 font-mono">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-lg border border-t-transparent border-[#00E5FF] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-[#00E5FF]">Redirecting to Command Center...</p>
      </div>
    </div>
  );
}
