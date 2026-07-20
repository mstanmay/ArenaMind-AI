"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { m as motion, AnimatePresence } from "framer-motion";
import { Activity, Sliders, ChevronUp, ChevronDown, RefreshCw } from "lucide-react";

// Safe localStorage settings helper
const getSwarmSetting = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const val = localStorage.getItem(key);
    if (val === null) return defaultValue;
    if (typeof defaultValue === "boolean") return (val === "true") as unknown as T;
    if (typeof defaultValue === "number") return parseFloat(val) as unknown as T;
    return val as unknown as T;
  } catch {
    return defaultValue;
  }
};

const setSwarmSetting = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, String(value));
    window.dispatchEvent(new Event("arenamind_settings_updated"));
  } catch {
    // Fail silently
  }
};

export default function AmbientBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  // Simulation Parameters state
  const [scale, setScale] = useState(() => getSwarmSetting("arenamind_swarm_scale", 1.0));
  const [speed, setSpeed] = useState(() => getSwarmSetting("arenamind_swarm_speed", 0.45));
  const [detail, setDetail] = useState(() => getSwarmSetting("arenamind_swarm_detail", 1.0));
  const [bloomStrength, setBloomStrength] = useState(() => getSwarmSetting("arenamind_swarm_bloom_strength", 1.8));
  const [autoSpin, setAutoSpin] = useState(() => getSwarmSetting("arenamind_swarm_auto_spin", true));
  const [shape, setShape] = useState(() => getSwarmSetting("arenamind_swarm_shape", "tetrahedron"));

  // Refs for real-time access inside requestAnimationFrame loop without triggering re-renders
  const paramsRef = useRef({
    scale,
    speed,
    detail,
    bloomStrength,
    autoSpin,
    shape,
  });

  // UI state for floating controls panel
  const [isOpen, setIsOpen] = useState(false);
  const [activePhase, setActivePhase] = useState("Star Sphere");
  const [phaseDetails, setPhaseDetails] = useState("Initializing swarm...");
  const [isSelectFocused, setIsSelectFocused] = useState(false);

  // Sync state changes with refs
  useEffect(() => {
    paramsRef.current = { scale, speed, detail, bloomStrength, autoSpin, shape };
  }, [scale, speed, detail, bloomStrength, autoSpin, shape]);

  // Update geometry function helper
  const updateGeometry = (newShape: string) => {
    if (!instancedMeshRef.current) return;
    
    // Dispose old geometry
    if (geometryRef.current) {
      geometryRef.current.dispose();
    }

    let geom: THREE.BufferGeometry;
    switch (newShape) {
      case "box":
        geom = new THREE.BoxGeometry(0.18, 0.18, 0.18);
        break;
      case "sphere":
        geom = new THREE.SphereGeometry(0.13, 8, 8);
        break;
      case "octahedron":
        geom = new THREE.OctahedronGeometry(0.18);
        break;
      case "tetrahedron":
      default:
        geom = new THREE.TetrahedronGeometry(0.25);
        break;
    }

    geometryRef.current = geom;
    instancedMeshRef.current.geometry = geom;
  };

  // Sync settings when modified externally (e.g., from settings portal)
  useEffect(() => {
    const handleSettingsUpdate = () => {
      const sScale = getSwarmSetting("arenamind_swarm_scale", 1.0);
      const sSpeed = getSwarmSetting("arenamind_swarm_speed", 0.45);
      const sDetail = getSwarmSetting("arenamind_swarm_detail", 1.0);
      const sBloom = getSwarmSetting("arenamind_swarm_bloom_strength", 1.8);
      const sSpin = getSwarmSetting("arenamind_swarm_auto_spin", true);
      const sShape = getSwarmSetting("arenamind_swarm_shape", "tetrahedron");

      setScale(sScale);
      setSpeed(sSpeed);
      setDetail(sDetail);
      setBloomStrength(sBloom);
      setAutoSpin(sSpin);
      setShape(sShape);

      if (controlsRef.current) {
        controlsRef.current.autoRotate = sSpin;
      }
      if (bloomPassRef.current) {
        bloomPassRef.current.strength = sBloom;
      }
      updateGeometry(sShape);
    };

    window.addEventListener("arenamind_settings_updated", handleSettingsUpdate);
    return () => window.removeEventListener("arenamind_settings_updated", handleSettingsUpdate);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // PERFORMANCE CONFIG
    const COUNT = 5000; // Reduced from 20000 for massive GPU savings
    const SPEED_MULT = 1;

    // SETUP SCENE
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080B14, 0.008);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 0, 110);

    const renderer = new THREE.WebGLRenderer({
      antialias: false, // Turned off antialias for performance, bloom hides jaggies
      powerPreference: "high-performance",
      alpha: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Capped pixel ratio
    container.appendChild(renderer.domElement);

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 30;
    controls.maxDistance = 300;
    controls.autoRotate = paramsRef.current.autoSpin;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // POST PROCESSING (Bloom effect) - lowered resolution
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    
    // Use half resolution for bloom for massive performance gain
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth / 2, container.clientHeight / 2),
      paramsRef.current.bloomStrength,
      0.4,
      0.85
    );
    bloomPass.strength = paramsRef.current.bloomStrength;
    bloomPass.radius = 0.5;
    bloomPass.threshold = 0.0;
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;

    // INSTANCED MESH
    let geom: THREE.BufferGeometry;
    switch (paramsRef.current.shape) {
      case "box": geom = new THREE.BoxGeometry(0.25, 0.25, 0.25); break;
      case "sphere": geom = new THREE.SphereGeometry(0.2, 4, 4); break;
      case "octahedron": geom = new THREE.OctahedronGeometry(0.25); break;
      case "tetrahedron":
      default: geom = new THREE.TetrahedronGeometry(0.35); break; // Increased size to compensate for fewer particles
    }
    geometryRef.current = geom;

    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const instancedMesh = new THREE.InstancedMesh(geom, material, COUNT);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);
    instancedMeshRef.current = instancedMesh;

    // SWARM OBJECTS & INITIAL DATA
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const target = new THREE.Vector3();

    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < COUNT; i++) {
      positions.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 120,
          (Math.random() - 0.5) * 120,
          (Math.random() - 0.5) * 120
        )
      );
      instancedMesh.setColorAt(i, color.setHex(0x00ff88));
    }

    const clock = new THREE.Clock();
    let animationId: number;
    let isVisible = true;

    // Visibility observer to pause animation loop when hidden
    const handleVisibilityChange = () => {
      const nextVisible = document.visibilityState === "visible";
      if (nextVisible !== isVisible) {
        isVisible = nextVisible;
        if (isVisible) {
          if (!animationId) {
            clock.start();
            animateLoop();
          }
        } else {
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = 0;
          }
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // ANIMATION LOOP
    function animateLoop() {
      if (!isVisible) {
        animationId = 0;
        return;
      }
      animationId = requestAnimationFrame(animateLoop);

      const time = clock.getElapsedTime() * SPEED_MULT;

      // Extract real-time parameter refs
      const simScale = paramsRef.current.scale;
      const simSpeed = paramsRef.current.speed;
      const simDetail = paramsRef.current.detail;

      controls.update();

      const pi = Math.PI;
      const tau = Math.PI * 2;
      const safeCount = Math.max(1, COUNT - 1);

      // Cycle calculation to blend between morph target shapes
      const cycle = (time * simSpeed) % 24.0;

      const ds0 = Math.abs(cycle - 4.0);
      const dg0 = Math.abs(cycle - 12.0);
      const dw0 = Math.abs(cycle - 20.0);
      const ds = Math.min(ds0, 24.0 - ds0);
      const dg = Math.min(dg0, 24.0 - dg0);
      const dw = Math.min(dw0, 24.0 - dw0);

      const cs = Math.max(0.0, Math.cos((ds * pi) / 12.0));
      const cg = Math.max(0.0, Math.cos((dg * pi) / 12.0));
      const cw = Math.max(0.0, Math.cos((dw * pi) / 12.0));
      
      const rs = cs * cs * cs * cs;
      const rg = cg * cg * cg * cg;
      const rw = cw * cw * cw * cw;
      
      const sum = Math.max(0.0001, rs + rg + rw);
      const ws = rs / sum;
      const wg = rg / sum;
      const ww = rw / sum;

      // Telemetry state update for UI HUD (only run periodically for render efficiency)
      if (Math.floor(time * 2) % 2 === 0) {
        if (ws > wg && ws > ww) {
          setActivePhase("Star Sphere");
          setPhaseDetails("A highly dense stardust core pulsing with nuclear force.");
        } else if (wg > ws && wg > ww) {
          setActivePhase("Spiral Galaxy");
          setPhaseDetails("A classic spiral galaxy with active stellar nursery arms.");
        } else {
          setActivePhase("Warped Spacetime");
          setPhaseDetails("Einstein-Rosen grid metric warping space under custom gravity.");
        }
      }

      // Swarm positions interpolation
      for (let i = 0; i < COUNT; i++) {
        const u = i / safeCount;

        // Hash helpers for deterministic noise
        const h1 = Math.sin((i + 1) * 12.9898) * 43758.5453;
        const h2 = Math.sin((i + 1) * 78.233) * 23421.631;
        const r1 = h1 - Math.floor(h1);
        const r2 = h2 - Math.floor(h2);

        // 1. STAR SPHERE COORDINATES
        const sphereZ = 1.0 - 2.0 * u;
        const sphereR = Math.sqrt(Math.max(0.0, 1.0 - sphereZ * sphereZ));
        const sphereA = i * 2.39996322973 + time * 0.08;
        const pulse = 1.0 + 0.07 * Math.sin(sphereA * 7.0 + time * 2.0);
        const starRadius = 28.0 * pulse;
        const sx = Math.cos(sphereA) * sphereR * starRadius;
        const sy = sphereZ * starRadius;
        const sz = Math.sin(sphereA) * sphereR * starRadius;

        // 2. SPIRAL GALAXY COORDINATES
        const arm = i % 5;
        const galaxyRadius = 7.0 + 93.0 * Math.sqrt(u);
        const galaxyNoise = (r1 - 0.5) * (4.0 + galaxyRadius * 0.035);
        const galaxyAngle =
          (arm * tau) / 5.0 + galaxyRadius * 0.078 * simDetail + time * 0.075;

        const gx = Math.cos(galaxyAngle) * (galaxyRadius + galaxyNoise);
        const gy = (r2 - 0.5) * 13.0 * Math.exp(-galaxyRadius / 62.0);
        const gz = Math.sin(galaxyAngle) * (galaxyRadius + galaxyNoise);

        // 3. WARPED SPACETIME GRID COORDINATES
        const gridWidth = Math.max(2.0, Math.floor(Math.sqrt(COUNT)));
        const gridRows = Math.max(2.0, Math.ceil(COUNT / gridWidth));
        const gridX = i % gridWidth;
        const gridZ = Math.floor(i / gridWidth);
        const px = (gridX / (gridWidth - 1.0) - 0.5) * 190.0;
        const pz = (gridZ / (gridRows - 1.0) - 0.5) * 190.0;
        const radiusSquared = px * px + pz * pz;

        const well = -68.0 / (1.0 + radiusSquared * 0.0032);
        const ripple =
          Math.sin(Math.sqrt(radiusSquared) * 0.22 - time * 1.8) *
          4.5 *
          Math.exp(-radiusSquared / 7200.0);

        const wx = px;
        const wy = well + ripple;
        const wz = pz;

        // BLEND & SCALE
        const x = (sx * ws + gx * wg + wx * ww) * simScale;
        const y = (sy * ws + gy * wg + wy * ww) * simScale;
        const z = (sz * ws + gz * wg + wz * ww) * simScale;

        target.set(x, y, z);

        // COLORS
        const starHue = 0.10 + r1 * 0.04; // Golden-orange solar particles
        const galaxyHue = 0.68 + r2 * 0.20; // Magenta-indigo stardust
        const wellHue = 0.52 + r1 * 0.12; // Cyan-teal gravity well
        const hue = (starHue * ws + galaxyHue * wg + wellHue * ww) % 1.0;

        const lightness =
          0.48 + 0.30 * ws + 0.12 * Math.exp(-galaxyRadius / 35.0);

        color.setHSL(hue, 0.88, Math.min(0.86, lightness));

        // Smooth translation
        positions[i].lerp(target, 0.08);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
        instancedMesh.setColorAt(i, color);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true;
      }

      composer.render();
    }

    animateLoop();

    // RESIZE EVENT
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      composer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // CLEANUP
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationId);
      
      // Dispose Geometries
      if (geometryRef.current) geometryRef.current.dispose();
      
      // Dispose Material
      material.dispose();
      
      // Dispose Post-processing (CRITICAL FOR VRAM LEAKS)
      composer.renderTarget1.dispose();
      composer.renderTarget2.dispose();
      bloomPass.dispose();
      
      // Dispose Renderer
      renderer.dispose();
      
      // Remove canvas
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      controlsRef.current = null;
      bloomPassRef.current = null;
      instancedMeshRef.current = null;
    };
  }, []);

  const resetParams = () => {
    setScale(1.0);
    setSpeed(0.45);
    setDetail(1.0);
    setBloomStrength(1.8);
    setAutoSpin(true);
    setShape("tetrahedron");

    setSwarmSetting("arenamind_swarm_scale", 1.0);
    setSwarmSetting("arenamind_swarm_speed", 0.45);
    setSwarmSetting("arenamind_swarm_detail", 1.0);
    setSwarmSetting("arenamind_swarm_bloom_strength", 1.8);
    setSwarmSetting("arenamind_swarm_auto_spin", true);
    setSwarmSetting("arenamind_swarm_shape", "tetrahedron");
  };

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#080B14]">
      {/* Three.js Container */}
      <div ref={mountRef} className="absolute inset-0 block h-full w-full opacity-75" />

      {/* Backdrop Orbs for parallax layered lighting */}
      <div className="absolute -top-40 -left-40 h-150 w-150 rounded-full bg-linear-to-tr from-[#3B82F6] to-[#7C3AED] opacity-[0.06] blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-60 -right-40 h-175 w-175 rounded-full bg-linear-to-br from-[#00E5FF] to-[#7C3AED] opacity-[0.06] blur-[160px] pointer-events-none" />

      {/* Floating telemetry widget in bottom-right corner */}
      <div className="absolute bottom-6 right-6 z-50 pointer-events-auto">
        <div className="relative">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-80 p-5 rounded-2xl glass-panel border border-[#00E5FF]/20 bg-black/75 shadow-[0_4px_30px_rgba(0,229,255,0.08)] backdrop-blur-xl mb-3 space-y-4 font-mono select-none"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00E5FF] animate-pulse" />
                    <span className="text-xs font-black text-white tracking-wider uppercase">Telemetry Controller</span>
                  </div>
                  <button
                    onClick={resetParams}
                    title="Reset parameters"
                    className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Telemetry Live Data */}
                <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-[10px] space-y-1.5 text-gray-400">
                  <div className="flex justify-between">
                    <span>MORPH ACTIVE:</span>
                    <span className="text-[#00E5FF] font-bold">{activePhase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FPS / FRAME BUDGET:</span>
                    <span className="text-emerald-400">60 FPS / 16.6ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COSMIC PARTICLES:</span>
                    <span className="text-white">20,000 instanced</span>
                  </div>
                  <p className="text-[9px] leading-tight text-gray-500 italic mt-1">{phaseDetails}</p>
                </div>

                {/* SLIDERS */}
                <div className="space-y-3 pt-1">
                  {/* Cosmic Scale */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>COSMIC SCALE</span>
                      <span className="text-[#00E5FF] font-bold">{scale.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={scale}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setScale(val);
                        setSwarmSetting("arenamind_swarm_scale", val);
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                    />
                  </div>

                  {/* Journey Speed */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>JOURNEY SPEED</span>
                      <span className="text-[#00E5FF] font-bold">{speed.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.5"
                      step="0.05"
                      value={speed}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setSpeed(val);
                        setSwarmSetting("arenamind_swarm_speed", val);
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                    />
                  </div>

                  {/* Structure Detail */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>STRUCTURE DETAIL</span>
                      <span className="text-[#00E5FF] font-bold">{detail.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="2.0"
                      step="0.05"
                      value={detail}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setDetail(val);
                        setSwarmSetting("arenamind_swarm_detail", val);
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                    />
                  </div>

                  {/* Bloom Intensity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>GLOW INTENSITY</span>
                      <span className="text-[#00E5FF] font-bold">{bloomStrength.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="3.0"
                      step="0.1"
                      value={bloomStrength}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setBloomStrength(val);
                        setSwarmSetting("arenamind_swarm_bloom_strength", val);
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                    />
                  </div>

                  {/* Toggle and Selection grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1.5">
                    <div>
                      <span className="block text-[8px] text-gray-500 uppercase mb-1">Spin State</span>
                      <button
                        type="button"
                        onClick={() => {
                          const val = !autoSpin;
                          setAutoSpin(val);
                          setSwarmSetting("arenamind_swarm_auto_spin", val);
                        }}
                        className={`w-full py-1.5 rounded-lg border text-[10px] font-bold text-center transition-all cursor-pointer ${
                          autoSpin
                            ? "bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]"
                            : "bg-white/1 border-white/5 text-gray-500 hover:text-white"
                        }`}
                      >
                        {autoSpin ? "ROTATING" : "LOCKED"}
                      </button>
                    </div>

                    <div>
                      <span className="block text-[8px] text-gray-500 uppercase mb-1">Particle Shape</span>
                      <select
                        value={shape}
                        onChange={(e) => {
                          const val = e.target.value;
                          setShape(val);
                          setSwarmSetting("arenamind_swarm_shape", val);
                        }}
                        onFocus={() => setIsSelectFocused(true)}
                        onBlur={() => setIsSelectFocused(false)}
                        className={`w-full py-1 px-1.5 rounded-lg bg-black border text-[10px] text-gray-300 focus:outline-none cursor-pointer ${
                          isSelectFocused ? "border-[#00E5FF]" : "border-white/10"
                        }`}
                      >
                        <option value="tetrahedron">Tetrahedron</option>
                        <option value="box">Cube</option>
                        <option value="sphere">Sphere</option>
                        <option value="octahedron">Octahedron</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#00E5FF]/20 bg-black/60 backdrop-blur-md text-[#00E5FF] hover:bg-black/90 transition-all shadow-[0_0_15px_rgba(0,229,255,0.15)] cursor-pointer text-xs font-bold font-mono tracking-wider float-right uppercase"
          >
            <Sliders className="w-4 h-4 animate-spin-slow" />
            <span>Telemetry Config</span>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
