"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthProvider, { useAuth } from "@/components/AuthProvider";
import dynamic from "next/dynamic";
import { m as motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

const AmbientBackground = dynamic(() => import("@/components/AmbientBackground"), { ssr: false });

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isLoading, token } = useAuth();
  const pathname = usePathname();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[#080B14]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // AuthProvider handles redirect to /login if no token
  if (!token) return null;

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#080B14]">
      {/* Ambient background particles & glowing mesh */}
      <AmbientBackground />

      {/* Main navigation sidebar */}
      <Sidebar />

      {/* Main operational panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Breadcrumb Header */}
        <Header />

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto px-8 py-8 relative">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
