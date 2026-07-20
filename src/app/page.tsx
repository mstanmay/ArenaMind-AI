import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Trophy,
  Users,
  Car,
  ChevronDown
} from "lucide-react";

import { GlowButton } from "@/components/unlumen-ui/glow";
import { MagneticButton } from "@/components/unlumen-ui/primitives/magnetic-button";
import ThemeToggle from "@/components/ThemeToggle";
import StatsCounter from "@/components/StatsCounter";
import HeroAnimation from "@/components/HeroAnimation";


export const metadata: Metadata = {
  title: "ArenaMind AI — Smart Stadium & Tournament Operations Command Center",
  description: "Next-generation enterprise AI platform for crowd intelligence, digital twins, tournament operations, and stadium analytics.",
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#080B14] overflow-x-hidden text-gray-200">
      {/* Background Orbs */}
      <div className="fixed inset-0 -z-50 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-175 w-175 rounded-full bg-[#3B82F6]/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-200 w-200 rounded-full bg-[#7C3AED]/10 blur-[180px] pointer-events-none" />
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      </div>

      {/* Floating Header */}
      <header className="relative flex items-center justify-between max-w-7xl mx-auto h-24 px-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-linear-to-tr from-[#3B82F6] to-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)] z-10 overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image src="/logo.png" width={40} height={40} className="object-cover" alt="ArenaMind Logo" priority />
            </div>
          </div>
          <span className="font-heading font-extrabold tracking-tight text-gray-100 text-xl">
            ArenaMind<span className="text-[#00E5FF] font-semibold">AI</span>
          </span>
        </div>

        <nav className="flex items-center gap-8 max-md:hidden">
          <MagneticButton
            variant="outline"
            className="border-none bg-transparent hover:bg-transparent px-0 h-auto text-sm text-gray-400 hover:text-white transition-colors font-normal tracking-normal cursor-pointer shadow-none"
            radius={60}
            strength={0.35}
          >
            <a href="#features">Core Brain</a>
          </MagneticButton>

          <MagneticButton
            variant="outline"
            className="border-none bg-transparent hover:bg-transparent px-0 h-auto text-sm text-gray-400 hover:text-white transition-colors font-normal tracking-normal cursor-pointer shadow-none"
            radius={60}
            strength={0.35}
          >
            <a href="#twin">Digital Twin</a>
          </MagneticButton>

          <MagneticButton
            variant="outline"
            className="border-none bg-transparent hover:bg-transparent px-0 h-auto text-sm text-gray-400 hover:text-white transition-colors font-normal tracking-normal cursor-pointer shadow-none"
            radius={60}
            strength={0.35}
          >
            <a href="#metrics">Impact</a>
          </MagneticButton>
          
          {/* Light/Dark mode toggle (Client Component) */}
          <ThemeToggle />

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black bg-[#00E5FF] hover:bg-[#00E5FF]/90 rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] cursor-pointer"
          >
            Launch Command Center <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-8 pt-12 pb-24 flex flex-col items-center text-center z-10">
        {/* Futuristic Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#00E5FF] tracking-wider uppercase mb-8 shadow-[0_0_15px_rgba(0,229,255,0.05)] animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" /> Smart Stadium Operational Intelligence
        </div>

        {/* Headline */}
        <h1 className="font-heading font-black text-6xl md:text-7xl lg:text-8xl tracking-tight text-white max-w-5xl leading-tight">
          The AI Brain Behind <br />
          <span className="bg-linear-to-r from-[#00E5FF] via-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent">
            Every Smart Stadium
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mt-8 leading-relaxed font-light">
          Enterprise AI platform orchestrating real-time crowd dynamics, digital twin simulations, tournament operations, emergency dispatch, parking flow, and concession sales.
        </p>

        {/* CTA Button */}
        <div className="flex flex-wrap gap-4 justify-center mt-10">
          <GlowButton
            asChild
            mode="rotate"
            blur="strong"
            duration={6}
            glowScale={1.1}
            colors={["#00E5FF", "#3B82F6", "#7C3AED", "#00E5FF"]}
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-widest text-black bg-[#00E5FF] rounded-xl transition-all cursor-pointer"
            >
              Launch Command Center <ArrowRight className="w-4 h-4" />
            </Link>
          </GlowButton>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 flex flex-col items-center gap-2 animate-bounce opacity-40">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">SCROLL DOWN</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* 3D Stadium Vector Graphic HUD Mockup */}
      <section className="relative w-full max-w-6xl mx-auto px-8 pb-32 z-10" id="twin">
        <div className="relative w-full rounded-2xl glass-panel border border-white/10 p-6 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)]">
          {/* Top Panel HUD headers */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest uppercase">Twin Simulator Live</span>
            </div>
            <span className="font-mono text-gray-500 tracking-wider">RESOLVING 120 NODES // SYSTEM_HEALTH: 99.8%</span>
          </div>

          <div className="relative w-full flex flex-col items-center bg-[#080B14]/40 rounded-xl border border-white/5 py-8 gap-6">
            {/* Optimized canvas drawing via dynamically imported component */}
            <HeroAnimation />
            
            {/* Interactive Simulator Controller */}
            <div className="flex flex-wrap items-center justify-center gap-4 border-t border-white/5 pt-6 w-full max-w-lg">
              <MagneticButton variant="default" size="sm" radius={80} strength={0.4}>
                Deploy Twin
              </MagneticButton>
              <MagneticButton variant="secondary" size="sm" radius={80} strength={0.4}>
                Preview Nodes
              </MagneticButton>
              <MagneticButton variant="outline" size="sm" radius={80} strength={0.4}>
                Cancel Build
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Logos sliding banner */}
      <section className="py-12 border-y border-white/5 bg-white/1">
        <div className="max-w-7xl mx-auto px-8 overflow-hidden">
          <p className="text-center text-[10px] uppercase font-black tracking-widest text-gray-500 mb-6">
            Trusted by World-Class Tournament Organizers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-30 select-none">
            {["FIFA", "OLYMPICS", "PREMIER LEAGUE", "NFL WORLDWIDE", "FORMULA 1", "UEFA CHAMPS"].map((brand) => (
              <span key={brand} className="font-heading font-black text-xl tracking-widest text-white whitespace-nowrap">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="max-w-7xl mx-auto px-8 py-32" id="features">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="font-heading font-black text-4xl tracking-tight text-white mb-4">
            NASA-Vibe Command Suite
          </h2>
          <p className="text-gray-400 font-light text-base">
            Enterprise solutions engineered for massive crowd coordination, visual mapping, security intelligence, and stadium operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Crowd */}
          <div className="col-span-1 md:col-span-2 glass-card p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center mb-6">
                <Users className="w-5 h-5 text-[#22C55E]" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-2">Crowd Flow Intelligence</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-light">
                Monitor live gate wait times, optimize venue entry vectors, and dynamically dispatch crowd marshals using real-time predictive heatmaps.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-xs text-[#22C55E]">
              <span className="font-mono uppercase tracking-widest font-bold">Queue Forecast Module Enabled</span>
              <span>12ms Latency</span>
            </div>
          </div>

          {/* Bento Card 2: Parking */}
          <div className="glass-card p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mb-6">
                <Car className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-2">Automated Parking Matrix</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-light">
                Optimize EV chargers, coordinate VIP routes, and guide guests dynamically to empty slots via interactive lot mapping.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-xs text-[#F59E0B]">
              <span className="font-mono uppercase tracking-widest font-bold">EV-STATIONS: ACTIVE</span>
            </div>
          </div>

          {/* Bento Card 3: Security */}
          <div className="glass-card p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center mb-6">
                <Shield className="w-5 h-5 text-[#EF4444]" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-2">Security Dispatch Center</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-light">
                Track perimeter security anomalies, coordinate local dispatch protocols, and manage threat levels from a central HUD console.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-xs text-[#EF4444]">
              <span className="font-mono uppercase tracking-widest font-bold">AI Perimeter Scan Active</span>
            </div>
          </div>

          {/* Bento Card 4: Tournament */}
          <div className="col-span-1 md:col-span-2 glass-card p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center mb-6">
                <Trophy className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-2">Tournament Ops Brain</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-light">
                Sync live schedules, manage official dressing room readiness, evaluate weather impacts, and coordinate vendor concession logistics.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-xs text-[#3B82F6]">
              <span className="font-mono uppercase tracking-widest font-bold">Bracket Match Sync Complete</span>
              <span>100% Synced</span>
            </div>
          </div>
        </div>

        {/* Core Brain Action Panel */}
        <div className="mt-12 p-8 rounded-2xl glass-panel border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <h4 className="font-heading font-extrabold text-lg text-white">System Deploy Diagnostics</h4>
            <p className="text-xs text-gray-400 font-light">Test neural routing nodes, latency matrices, and operational workflows.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <MagneticButton variant="default" size="sm" radius={80} strength={0.4}>
              Deploy Brain
            </MagneticButton>
            <MagneticButton variant="secondary" size="sm" radius={80} strength={0.4}>
              Preview Nodes
            </MagneticButton>
            <MagneticButton variant="outline" size="sm" radius={80} strength={0.4}>
              Cancel Test
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Statistics Counter Section */}
      <section className="border-t border-white/5 bg-[#0a0f1d] py-24" id="metrics">
        <div className="max-w-7xl mx-auto px-8">
          {/* Animated counting stats client component */}
          <StatsCounter />

          {/* Metrics Validation Panel */}
          <div className="mt-16 flex flex-col items-center gap-6 border-t border-white/5 pt-12">
            <span className="text-xs uppercase font-mono tracking-widest text-gray-500">Coordinate Verified Live Diagnostics</span>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton variant="default" size="sm" radius={80} strength={0.4}>
                Deploy Metrics
              </MagneticButton>
              <MagneticButton variant="secondary" size="sm" radius={80} strength={0.4}>
                Preview Reports
              </MagneticButton>
              <MagneticButton variant="outline" size="sm" radius={80} strength={0.4}>
                Cancel Output
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-tr from-[#3B82F6] to-[#00E5FF] overflow-hidden">
              <Image src="/logo.png" width={32} height={32} className="object-cover" alt="ArenaMind Logo" />
            </div>
            <span className="font-heading font-extrabold tracking-tight text-gray-100 text-base">
              ArenaMind<span className="text-[#00E5FF] font-semibold">AI</span>
            </span>
          </div>

          <p className="text-xs text-gray-500">
            © 2026 ArenaMind AI Systems Inc. Engineered for next-gen tournament environments.
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/dashboard" className="hover:text-[#00E5FF] transition-all">Launch Console</Link>
            <span>•</span>
            <span className="text-gray-600">Platform Security Standard Level 4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
