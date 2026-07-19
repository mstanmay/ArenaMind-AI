"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { m as motion } from "framer-motion";
import { animate, utils, createDraggable, spring } from 'animejs';
import { GlowButton } from "@/components/unlumen-ui/glow";
import { MagneticButton } from "@/components/unlumen-ui/primitives/magnetic-button";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Trophy,
  Users,
  Car,
  ChevronDown,
  Sun,
  Moon
} from "lucide-react";

export default function LandingClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({ safety: 90, delay: 0, crowd: 0, revenue: 0 });
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      const timer = setTimeout(() => {
        setThemeMode(isDark ? "dark" : "light");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // 3D-like Stadium Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 450);

    const centerX = width / 2;
    const centerY = height / 2;

    let angle = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = 450;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.005;

      // Draw Stadium outline in isometric perspective
      ctx.strokeStyle = "rgba(0, 229, 255, 0.15)";
      ctx.lineWidth = 1;
      
      const rx = 220; // x-radius
      const ry = 90;  // y-radius

      // Multiple rings to form the stadium bowl
      for (let h = 0; h < 60; h += 15) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + h - 20, rx + h * 0.8, ry + h * 0.4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.1 + h * 0.003})`;
        ctx.stroke();
      }

      // Seating lines (rays)
      ctx.strokeStyle = "rgba(124, 58, 237, 0.08)";
      for (let i = 0; i < 36; i++) {
        const theta = (i * Math.PI) / 18;
        const x1 = centerX + Math.cos(theta) * 120;
        const y1 = centerY + Math.sin(theta) * 50 - 20;
        const x2 = centerX + Math.cos(theta) * 270;
        const y2 = centerY + Math.sin(theta) * 110 - 20;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw the central pitch (glowing green/blue)
      ctx.fillStyle = "rgba(0, 229, 255, 0.03)";
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 20, 110, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pitch lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 20, 50, 20, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX - 110, centerY - 20);
      ctx.lineTo(centerX + 110, centerY - 20);
      ctx.stroke();

      // Sweeping light beams (futuristic searchlights)
      const sweepX1 = centerX + Math.cos(angle) * 180;
      const sweepY1 = centerY + Math.sin(angle) * 70 - 20;
      
      const sweepX2 = centerX + Math.cos(angle + Math.PI) * 180;
      const sweepY2 = centerY + Math.sin(angle + Math.PI) * 70 - 20;

      // Draw Light Beams
      const drawLightBeam = (x: number, y: number, color: string) => {
        const grad = ctx.createRadialGradient(x, y - 100, 10, x, y, 120);
        grad.addColorStop(0, color);
        grad.addColorStop(0.3, color.replace("1)", "0.2)"));
        grad.addColorStop(1, "rgba(0,0,0,0)");
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 50, y - 220);
        ctx.lineTo(x + 50, y - 220);
        ctx.closePath();
        ctx.fill();
      };

      drawLightBeam(sweepX1, sweepY1, "rgba(0, 229, 255, 0.75)");
      drawLightBeam(sweepX2, sweepY2, "rgba(124, 58, 237, 0.65)");

      // Crowd Particles (tiny glowing specs in the stands)
      for (let i = 0; i < 60; i++) {
        const t = angle * 0.2 + i * 2.3;
        const radX = rx + (i % 3) * 15;
        const radY = ry + (i % 3) * 7;
        const px = centerX + Math.cos(t) * radX;
        const py = centerY + Math.sin(t) * radY - 20 + (i % 2) * 5;
        
        ctx.fillStyle = i % 2 === 0 ? "rgba(0, 229, 255, 0.6)" : "rgba(124, 58, 237, 0.6)";
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add a HUD target element overlaying center pitch
      ctx.strokeStyle = "rgba(0, 229, 255, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 20, 25, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX - 35, centerY - 20);
      ctx.lineTo(centerX - 20, centerY - 20);
      ctx.moveTo(centerX + 20, centerY - 20);
      ctx.lineTo(centerX + 35, centerY - 20);
      ctx.moveTo(centerX, centerY - 55);
      ctx.lineTo(centerX, centerY - 40);
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, centerY + 15);
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    // Only run animation when canvas is in view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (!animationId) render();
        } else {
          cancelAnimationFrame(animationId);
          animationId = 0;
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, []);

  // Stats count up simulation
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

  // Anime.js Interactive Logo Rotation & Physics Bounce Loop
  useEffect(() => {
    let bounceAnim: any = null;
    let draggableInst: any = null;
    let buttonHandler: any = null;

    const initAnime = () => {
      const [ $logo ] = utils.$('.logo.js');
      const [ $button ] = utils.$('button');
      if (!$logo || !$button) return;

      let rotations = 0;

      // Created a bounce animation loop
      bounceAnim = animate('.logo.js', {
        scale: [
          { to: 1.25, ease: 'inOut(3)', duration: 200 },
          { to: 1, ease: spring({ bounce: .7 }) }
        ],
        loop: true,
        loopDelay: 250,
      });

      // Make the logo draggable around its center
      draggableInst = createDraggable('.logo.js', {
        container: [0, 0, 0, 0],
        releaseEase: spring({ bounce: .7 })
      });

      // Animate logo rotation on click
      buttonHandler = () => {
        rotations++;
        ($button as HTMLElement).innerText = `rotations: ${rotations}`;
        animate($logo, {
          rotate: rotations * 360,
          ease: 'out(4)',
          duration: 1500,
        });
      };

      $button.addEventListener('click', buttonHandler);
    };

    const timer = setTimeout(initAnime, 100);
    
    return () => {
      clearTimeout(timer);
      if (bounceAnim && typeof bounceAnim.pause === 'function') bounceAnim.pause();
      
      const [ $button ] = utils.$('button');
      if ($button && buttonHandler) {
        $button.removeEventListener('click', buttonHandler);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#080B14] overflow-x-hidden text-gray-200">
      {/* Background Orbs */}
      <div className="fixed inset-0 -z-50 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[700px] w-[700px] rounded-full bg-[#3B82F6]/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[800px] w-[800px] rounded-full bg-[#7C3AED]/10 blur-[180px] pointer-events-none" />
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      </div>

      {/* Floating Header */}
      <header className="relative flex items-center justify-between max-w-7xl mx-auto h-24 px-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <div className="logo js absolute inset-0 flex items-center justify-center rounded-xl bg-linear-to-tr from-[#3B82F6] to-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer z-10 overflow-hidden">
              <Image src="/logo.png" width={40} height={40} className="object-cover" alt="ArenaMind Logo" priority />
            </div>
          </div>
          <span className="font-heading font-extrabold tracking-tight text-gray-100 text-xl">
            ArenaMind<span className="text-[#00E5FF] font-semibold">AI</span>
          </span>
          <button className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-gray-400 cursor-pointer">
            rotations: 0
          </button>
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
          
          {/* Light/Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
            title={themeMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {themeMode === "dark" ? (
              <Sun className="w-4 h-4 text-[#00E5FF] transition-all" />
            ) : (
              <Moon className="w-4 h-4 text-gray-400 transition-all" />
            )}
          </button>

          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black bg-[#00E5FF] hover:bg-[#00E5FF]/90 rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] cursor-pointer"
          >
            Launch Command Center <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-8 pt-12 pb-24 flex flex-col items-center text-center z-10">
        {/* Futuristic Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#00E5FF] tracking-wider uppercase mb-8 shadow-[0_0_15px_rgba(0,229,255,0.05)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-spin-slow" /> Smart Stadium Operational Intelligence
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-heading font-black text-6xl md:text-7xl lg:text-8xl tracking-tight text-white max-w-5xl leading-tight"
        >
          The AI Brain Behind <br />
          <span className="bg-linear-to-r from-[#00E5FF] via-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent">
            Every Smart Stadium
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-3xl mt-8 leading-relaxed font-light"
        >
          Enterprise AI platform orchestrating real-time crowd dynamics, digital twin simulations, tournament operations, emergency dispatch, parking flow, and concession sales.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center mt-10"
        >
          <GlowButton
            asChild
            mode="rotate"
            blur="strong"
            duration={6}
            glowScale={1.1}
            colors={["#00E5FF", "#3B82F6", "#7C3AED", "#00E5FF"]}
          >
            <Link
              href="/login"
              className="flex items-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-widest text-black bg-[#00E5FF] rounded-xl transition-all cursor-pointer"
            >
              Launch Command Center <ArrowRight className="w-4 h-4" />
            </Link>
          </GlowButton>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 flex flex-col items-center gap-2 animate-bounce opacity-40">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">SCROLL DOWN</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* 3D Stadium Vector Graphic HUD Mockup */}
      <section className="relative w-full max-w-6xl mx-auto px-8 pb-32 z-10" id="twin">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full rounded-2xl glass-panel border border-white/10 p-6 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)]"
        >
          {/* Top Panel HUD headers */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest uppercase">Twin Simulator Live</span>
            </div>
            <span className="font-mono text-gray-500 tracking-wider">RESOLVING 120 NODES // SYSTEM_HEALTH: 99.8%</span>
          </div>

          <div className="relative w-full flex flex-col items-center bg-[#080B14]/40 rounded-xl border border-white/5 py-8 gap-6">
            <canvas ref={canvasRef} className="max-w-full" />
            
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
        </motion.div>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <span className="block font-heading font-black text-5xl md:text-6xl text-white mb-2">
                {stats.safety}%
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-[#00E5FF]">Safety Index</span>
            </div>

            <div className="text-center">
              <span className="block font-heading font-black text-5xl md:text-6xl text-white mb-2">
                -{stats.delay}%
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-[#22C55E]">Gate Queue Delay</span>
            </div>

            <div className="text-center">
              <span className="block font-heading font-black text-5xl md:text-6xl text-white mb-2">
                {stats.crowd}M+
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-[#7C3AED]">Guests Coordinated</span>
            </div>

            <div className="text-center">
              <span className="block font-heading font-black text-5xl md:text-6xl text-white mb-2">
                {stats.revenue}k+
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-[#F59E0B]">AI Vendor Decisions</span>
            </div>
          </div>

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
