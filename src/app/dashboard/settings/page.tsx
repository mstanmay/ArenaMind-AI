"use client";

import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Eye,
  Sparkles,
  Save,
  CheckCircle,
  Sliders,
  RotateCw
} from "lucide-react";
import confetti from "canvas-confetti";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "j.doe@arenamind.ai",
    role: "Operational Commander",
  });

  const [notifications, setNotifications] = useState({
    crowdPeak: true,
    medicalDispatch: true,
    parkingThreshold: false,
    energyAlert: true,
  });

  const [theme, setTheme] = useState({
    ambientOrbs: true,
    particleMesh: true,
    borderGlows: true,
    soundClicks: true,
  });

  // 3D Swarm parameters
  const [swarmScale, setSwarmScale] = useState(1.0);
  const [swarmSpeed, setSwarmSpeed] = useState(0.45);
  const [swarmDetail, setSwarmDetail] = useState(1.0);
  const [swarmBloom, setSwarmBloom] = useState(1.8);
  const [swarmShape, setSwarmShape] = useState("tetrahedron");
  const [swarmSpin, setSwarmSpin] = useState(true);

  const [saved, setSaved] = useState(false);
  const [focusFields, setFocusFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => {
        setProfile({
          name: localStorage.getItem("arenamind_profile_name") || "John Doe",
          email: localStorage.getItem("arenamind_profile_email") || "j.doe@arenamind.ai",
          role: "Operational Commander",
        });
        
        setNotifications({
          crowdPeak: localStorage.getItem("arenamind_notif_crowd") !== "false",
          medicalDispatch: localStorage.getItem("arenamind_notif_medical") !== "false",
          parkingThreshold: localStorage.getItem("arenamind_notif_parking") === "true",
          energyAlert: localStorage.getItem("arenamind_notif_energy") !== "false",
        });

        setTheme({
          ambientOrbs: localStorage.getItem("arenamind_theme_orbs") !== "false",
          particleMesh: localStorage.getItem("arenamind_theme_mesh") !== "false",
          borderGlows: localStorage.getItem("arenamind_theme_borders") !== "false",
          soundClicks: localStorage.getItem("arenamind_theme_sound") !== "false",
        });

        setSwarmScale(parseFloat(localStorage.getItem("arenamind_swarm_scale") || "1.0"));
        setSwarmSpeed(parseFloat(localStorage.getItem("arenamind_swarm_speed") || "0.45"));
        setSwarmDetail(parseFloat(localStorage.getItem("arenamind_swarm_detail") || "1.0"));
        setSwarmBloom(parseFloat(localStorage.getItem("arenamind_swarm_bloom_strength") || "1.8"));
        setSwarmShape(localStorage.getItem("arenamind_swarm_shape") || "tetrahedron");
        setSwarmSpin(localStorage.getItem("arenamind_swarm_auto_spin") !== "false");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("arenamind_profile_name", profile.name);
      localStorage.setItem("arenamind_profile_email", profile.email);
      
      localStorage.setItem("arenamind_notif_crowd", String(notifications.crowdPeak));
      localStorage.setItem("arenamind_notif_medical", String(notifications.medicalDispatch));
      localStorage.setItem("arenamind_notif_parking", String(notifications.parkingThreshold));
      localStorage.setItem("arenamind_notif_energy", String(notifications.energyAlert));
      
      localStorage.setItem("arenamind_theme_orbs", String(theme.ambientOrbs));
      localStorage.setItem("arenamind_theme_mesh", String(theme.particleMesh));
      localStorage.setItem("arenamind_theme_borders", String(theme.borderGlows));
      localStorage.setItem("arenamind_theme_sound", String(theme.soundClicks));

      localStorage.setItem("arenamind_swarm_scale", String(swarmScale));
      localStorage.setItem("arenamind_swarm_speed", String(swarmSpeed));
      localStorage.setItem("arenamind_swarm_detail", String(swarmDetail));
      localStorage.setItem("arenamind_swarm_bloom_strength", String(swarmBloom));
      localStorage.setItem("arenamind_swarm_shape", swarmShape);
      localStorage.setItem("arenamind_swarm_auto_spin", String(swarmSpin));

      // Trigger event to notify AmbientBackground to update immediately
      window.dispatchEvent(new Event("arenamind_settings_updated"));
    }

    setSaved(true);
    confetti({
      particleCount: 50,
      spread: 40,
      colors: ["#00E5FF", "#3B82F6", "#7C3AED"],
    });
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetSwarm = () => {
    setSwarmScale(1.0);
    setSwarmSpeed(0.45);
    setSwarmDetail(1.0);
    setSwarmBloom(1.8);
    setSwarmShape("tetrahedron");
    setSwarmSpin(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl glass-panel border border-[#00E5FF]/20 shadow-[0_0_20px_rgba(0,229,255,0.05)]">
        <div>
          <h1 className="font-heading font-black text-2xl tracking-tight text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[#00E5FF] animate-pulse" /> SYSTEM CONFIGURATION PORTAL
          </h1>
          <p className="text-xs text-[#00E5FF] font-mono tracking-widest uppercase">
            modifying interface settings // local profile encryption active
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Profile Card */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" /> User Profile Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 font-bold uppercase mb-2">Full Display Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                onFocus={() => setFocusFields(prev => ({ ...prev, name: true }))}
                onBlur={() => setFocusFields(prev => ({ ...prev, name: false }))}
                className={`w-full h-11 px-4 rounded-xl bg-black/40 border text-sm text-white focus:outline-none transition-all ${
                  focusFields.name ? "border-[#00E5FF]" : "border-white/10"
                }`}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold uppercase mb-2">Registered Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                onFocus={() => setFocusFields(prev => ({ ...prev, email: true }))}
                onBlur={() => setFocusFields(prev => ({ ...prev, email: false }))}
                className={`w-full h-11 px-4 rounded-xl bg-black/40 border text-sm text-white focus:outline-none transition-all ${
                  focusFields.email ? "border-[#00E5FF]" : "border-white/10"
                }`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 font-bold uppercase mb-2">Assigned Command Role</label>
              <input
                type="text"
                value={profile.role}
                disabled
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Notifications toggles */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-500" /> System Notification Routing
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: "crowdPeak", label: "Crowd Influx Thresholds (>80% Capacity)", desc: "Triggers warning alert when gate delay SLAs are breached." },
              { id: "medicalDispatch", label: "Medical Teams Dispatch Alert", desc: "Real-time tracker of emergency response departures." },
              { id: "parkingThreshold", label: "Parking Lots Saturation Alarm", desc: "Notify when empty spots drop below 10% in main blocks." },
              { id: "energyAlert", label: "Power Grid Optimization Advice", desc: "Triggers recommendations on solar grid battery thresholds." },
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })}
                className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                  notifications[item.id as keyof typeof notifications]
                    ? "bg-[#161F2F]/80 border-[#00E5FF]/20 text-white"
                    : "bg-white/1 border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${notifications[item.id as keyof typeof notifications] ? "border-[#00E5FF] bg-[#00E5FF]/10" : "border-gray-600"}`}>
                  {notifications[item.id as keyof typeof notifications] && <div className="w-1.5 h-1.5 rounded-sm bg-[#00E5FF]" />}
                </div>
                <div>
                  <span className="block text-xs font-bold text-white">{item.label}</span>
                  <span className="block text-[10px] text-gray-500 mt-1 font-light leading-normal">{item.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3D Cosmic Swarm Visualizer Tuning Card */}
        <div className="p-6 rounded-2xl glass-panel border border-[#00E5FF]/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00E5FF]" /> 3D Cosmic Swarm Visualizer Tuning
            </h3>
            <button
              type="button"
              onClick={handleResetSwarm}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCw className="w-3 h-3" /> Reset Swarm Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cosmic Scale Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-300">Cosmic Scale</span>
                <span className="text-[#00E5FF] font-mono font-bold">{swarmScale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={swarmScale}
                onChange={(e) => setSwarmScale(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
              />
              <span className="block text-[10px] text-gray-500 font-light leading-normal">
                Modulates the dimensional boundaries of the particle cloud in space.
              </span>
            </div>

            {/* Journey Speed Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-300">Journey Speed</span>
                <span className="text-[#00E5FF] font-mono font-bold">{swarmSpeed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={swarmSpeed}
                onChange={(e) => setSwarmSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
              />
              <span className="block text-[10px] text-gray-500 font-light leading-normal">
                Alters the morphing rate and orbital rotation speed of the particles.
              </span>
            </div>

            {/* Structure Detail Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-300">Structure Detail</span>
                <span className="text-[#00E5FF] font-mono font-bold">{swarmDetail.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.05"
                value={swarmDetail}
                onChange={(e) => setSwarmDetail(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
              />
              <span className="block text-[10px] text-gray-500 font-light leading-normal">
                Tunes noise multipliers to create tighter, more intricate spiral galaxy arms.
              </span>
            </div>

            {/* Glow Intensity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-300">Bloom/Glow Intensity</span>
                <span className="text-[#00E5FF] font-mono font-bold">{swarmBloom.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.1"
                value={swarmBloom}
                onChange={(e) => setSwarmBloom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
              />
              <span className="block text-[10px] text-gray-500 font-light leading-normal">
                Modifies WebGL UnrealBloom strength for the neon post-processing glow.
              </span>
            </div>

            {/* Spin State Toggle */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-gray-300 mb-1">Swarm Auto-Rotation</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSwarmSpin(!swarmSpin)}
                  className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                    swarmSpin
                      ? "bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]"
                      : "bg-white/1 border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {swarmSpin ? "ENABLED (CONTINUOUS ORBIT)" : "DISABLED (STATIC ANGLE)"}
                </button>
              </div>
            </div>

            {/* Particle Shape Select */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-gray-300 mb-1">Swarm Particle Geometry</span>
              <select
                value={swarmShape}
                onChange={(e) => setSwarmShape(e.target.value)}
                onFocus={() => setFocusFields(prev => ({ ...prev, swarmShape: true }))}
                onBlur={() => setFocusFields(prev => ({ ...prev, swarmShape: false }))}
                className={`w-full h-11 px-4 rounded-xl bg-black/40 border text-sm text-white focus:outline-none transition-all cursor-pointer font-mono ${
                  focusFields.swarmShape ? "border-[#00E5FF]" : "border-white/10"
                }`}
              >
                <option value="tetrahedron">Tetrahedron (Standard)</option>
                <option value="box">Cube (Grid Element)</option>
                <option value="sphere">Sphere (Point Source)</option>
                <option value="octahedron">Octahedron (Diamond)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme customization */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" /> Interface Aesthetics (Glow & Motion)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: "ambientOrbs", label: "Floating Ambient Blur Orbs", desc: "Enables purple and blue backdrop glows." },
              { id: "particleMesh", label: "Canvas Dynamic Particle Mesh", desc: "Silky 60fps WebGL/2D background mesh active." },
              { id: "borderGlows", label: "Neon Border Pulse Glows", desc: "Adds subtle glowing indicators to critical modules." },
              { id: "soundClicks", label: "Interface Micro-haptic Sounds", desc: "Synthesizes click sound effect on menu actions." },
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setTheme({ ...theme, [item.id]: !theme[item.id as keyof typeof theme] })}
                className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                  theme[item.id as keyof typeof theme]
                    ? "bg-[#161F2F]/80 border-[#00E5FF]/20 text-white"
                    : "bg-white/1 border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${theme[item.id as keyof typeof theme] ? "border-[#00E5FF] bg-[#00E5FF]/10" : "border-gray-600"}`}>
                  {theme[item.id as keyof typeof theme] && <div className="w-1.5 h-1.5 rounded-sm bg-[#00E5FF]" />}
                </div>
                <div>
                  <span className="block text-xs font-bold text-white">{item.label}</span>
                  <span className="block text-[10px] text-gray-500 mt-1 font-light leading-normal">{item.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-[#00E5FF] animate-pulse" />
            <span className="text-xs text-gray-500 font-light">Settings are saved locally to application state.</span>
          </div>

          <div className="flex items-center gap-4">
            {saved && (
              <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Config saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider text-black bg-[#00E5FF] hover:bg-[#00E5FF]/90 rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] cursor-pointer animate-pulse-glow"
            >
              <Save className="w-4 h-4" /> Save Local Preferences
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
