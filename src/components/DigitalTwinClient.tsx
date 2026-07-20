"use client";

import { useState, useEffect, useRef } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  MapPin,
  Shield,
  Activity,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Tv,
  Info,
  RotateCcw
} from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Mock metadata for interactive nodes with 3D coordinates
const MOCK_MAP_NODES = {
  security: [
    { id: "cam1", x3d: -7, y3d: 1.8, z3d: -5.5, label: "CAM-01: North Tunnel", status: "Active Feed", risk: "Low" },
    { id: "cam2", x3d: 7, y3d: 1.8, z3d: -5.5, label: "CAM-02: East Concourse", status: "Active Feed", risk: "Low" },
    { id: "cam3", x3d: -7, y3d: 1.8, z3d: 5.5, label: "CAM-03: West Staircase", status: "Active Feed", risk: "Low" },
    { id: "cam4", x3d: 7, y3d: 1.8, z3d: 5.5, label: "CAM-04: South Gate", status: "Active Feed", risk: "Medium (Density peak)" },
  ],
  medical: [
    { id: "med1", x3d: 0, y3d: 1.0, z3d: -6.0, label: "Medical Hub Alpha", staff: "4 Responders", status: "Standby" },
    { id: "med2", x3d: 0, y3d: 1.0, z3d: 6.0, label: "Medical Hub Beta", staff: "3 Responders", status: "1 Dispatch Active" },
  ],
  entrances: [
    { id: "gate1", x3d: -8.5, y3d: 0.2, z3d: -7.5, label: "Gate 1 (West)", queue: "2 mins", count: "1,240 entering/hr" },
    { id: "gate2", x3d: 8.5, y3d: 0.2, z3d: -7.5, label: "Gate 2 (East)", queue: "1 min", count: "890 entering/hr" },
    { id: "gate3", x3d: -8.5, y3d: 0.2, z3d: 7.5, label: "Gate 3 (South)", queue: "4 mins", count: "2,100 entering/hr" },
    { id: "gate4", x3d: 8.5, y3d: 0.2, z3d: 7.5, label: "Gate 4 (North)", queue: "14 mins", count: "4,400 entering/hr" },
  ]
};

const getStandColor = (name: string, isHeatmapActive: boolean): number => {
  if (!isHeatmapActive) return 0x00E5FF; // Cyber cyan
  if (name === "North Stand") return 0xEF4444; // High density red
  if (name === "East Wing") return 0xF59E0B; // Medium density orange
  return 0x22C55E; // Low density green
};

export default function DigitalTwinClient() {
  const [activeLayers, setActiveLayers] = useState({
    heatmap: true,
    security: true,
    medical: false,
    entrances: false,
    flow: true,
  });

  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [cameraFeed, setCameraFeed] = useState<string | null>(null);

  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const standsMeshesRef = useRef<{ name: string; mesh: THREE.Mesh }[]>([]);
  const particlesGroupRef = useRef<THREE.Group | null>(null);
  
  const [screenCoords, setScreenCoords] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Sync heatmap coloring
  useEffect(() => {
    standsMeshesRef.current.forEach((item) => {
      const colorVal = getStandColor(item.name, activeLayers.heatmap);
      const mat = item.mesh.material as THREE.MeshBasicMaterial;
      mat.color.setHex(colorVal);
    });
  }, [activeLayers.heatmap]);

  // Sync flow group visibility
  useEffect(() => {
    if (particlesGroupRef.current) {
      particlesGroupRef.current.visible = activeLayers.flow;
    }
  }, [activeLayers.flow]);

  // Initialize Three.js 3D Stadium
  useEffect(() => {
    if (!mountRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    // SCENE
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080B14, 0.02);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 14, 18);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00E5FF, 1.8);
    dirLight1.position.set(10, 20, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7C3AED, 1.2);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
    controls.minDistance = 5;
    controls.maxDistance = 35;
    controls.target.set(0, 0.5, 0);
    controlsRef.current = controls;

    // PITCH (Holographic central playing field)
    const pitchGeo = new THREE.PlaneGeometry(10, 6.5);
    const pitchMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = Math.PI / 2;
    scene.add(pitch);

    // Central pitch outline circles and lines
    const circleGeo = new THREE.RingGeometry(1.2, 1.25, 32);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.25 });
    const centerCircle = new THREE.Mesh(circleGeo, circleMat);
    centerCircle.rotation.x = Math.PI / 2;
    centerCircle.position.y = 0.01;
    scene.add(centerCircle);

    // Outer boundary ellipse representing stadium track
    const boundaryCurve = new THREE.EllipseCurve(0, 0, 7.5, 5, 0, 2 * Math.PI, false, 0);
    const boundaryPoints = boundaryCurve.getPoints(64);
    const boundaryGeo = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
    const boundaryMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
    const boundaryLine = new THREE.Line(boundaryGeo, boundaryMat);
    boundaryLine.rotation.x = Math.PI / 2;
    scene.add(boundaryLine);

    // NESTED STADIUM BOWL SECTIONS (Separate arcs)
    const standsList: { name: string; mesh: THREE.Mesh }[] = [];
    const standArcData = [
      { name: "North Stand", thetaStart: Math.PI * 0.25, thetaLength: Math.PI * 0.5 },
      { name: "East Wing", thetaStart: Math.PI * 1.75, thetaLength: Math.PI * 0.5 },
      { name: "South Stand", thetaStart: Math.PI * 1.25, thetaLength: Math.PI * 0.5 },
      { name: "West Wing", thetaStart: Math.PI * 0.75, thetaLength: Math.PI * 0.5 }
    ];

    standArcData.forEach((stand) => {
      // Lower Tier
      const tier1Geo = new THREE.CylinderGeometry(5.8, 4.8, 0.8, 16, 2, true, stand.thetaStart, stand.thetaLength);
      const tier1Mat = new THREE.MeshBasicMaterial({
        color: getStandColor(stand.name, activeLayers.heatmap),
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      const t1Mesh = new THREE.Mesh(tier1Geo, tier1Mat);
      t1Mesh.position.y = 0.4;
      scene.add(t1Mesh);
      standsList.push({ name: stand.name, mesh: t1Mesh });

      // Mid Tier
      const tier2Geo = new THREE.CylinderGeometry(6.8, 5.8, 1.2, 16, 2, true, stand.thetaStart, stand.thetaLength);
      const tier2Mat = new THREE.MeshBasicMaterial({
        color: getStandColor(stand.name, activeLayers.heatmap),
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      const t2Mesh = new THREE.Mesh(tier2Geo, tier2Mat);
      t2Mesh.position.y = 1.35;
      scene.add(t2Mesh);
      standsList.push({ name: stand.name, mesh: t2Mesh });

      // Upper Tier
      const tier3Geo = new THREE.CylinderGeometry(8.0, 6.8, 1.6, 16, 2, true, stand.thetaStart, stand.thetaLength);
      const tier3Mat = new THREE.MeshBasicMaterial({
        color: getStandColor(stand.name, activeLayers.heatmap),
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });
      const t3Mesh = new THREE.Mesh(tier3Geo, tier3Mat);
      t3Mesh.position.y = 2.75;
      scene.add(t3Mesh);
      standsList.push({ name: stand.name, mesh: t3Mesh });
    });
    standsMeshesRef.current = standsList;

    // FUTURISTIC ROOF ARCHES
    const archCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-9.5, 0, -1),
      new THREE.Vector3(-5, 6, -1),
      new THREE.Vector3(5, 6, -1),
      new THREE.Vector3(9.5, 0, -1)
    ]);
    const archGeo1 = new THREE.TubeGeometry(archCurve1, 32, 0.08, 6, false);
    const archMat = new THREE.MeshBasicMaterial({ color: 0x3B82F6, wireframe: true, transparent: true, opacity: 0.25 });
    const arch1 = new THREE.Mesh(archGeo1, archMat);
    scene.add(arch1);

    const archCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-9.5, 0, 1),
      new THREE.Vector3(-5, 6, 1),
      new THREE.Vector3(5, 6, 1),
      new THREE.Vector3(9.5, 0, 1)
    ]);
    const archGeo2 = new THREE.TubeGeometry(archCurve2, 32, 0.08, 6, false);
    const arch2 = new THREE.Mesh(archGeo2, archMat);
    scene.add(arch2);

    // PEDESTRIAN FLOW VECTORS (Moving Particles)
    const curve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(8.5, 0.2, 7.5),   // Gate 4 area
      new THREE.Vector3(6.0, 1.2, 5.0),
      new THREE.Vector3(3.0, 2.2, 2.5),
      new THREE.Vector3(0.0, 2.8, 0.0)
    ]);
    const curve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8.5, 0.2, -7.5), // Gate 1 area
      new THREE.Vector3(-6.0, 1.2, -5.0),
      new THREE.Vector3(-3.0, 2.2, -2.5),
      new THREE.Vector3(0.0, 2.8, 0.0)
    ]);
    const flowCurves = [curve1, curve2];

    const particlesGroup = new THREE.Group();
    const particleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const particleList: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; progress: number; speed: number }[] = [];

    for (let i = 0; i < 25; i++) {
      const curve = flowCurves[i % flowCurves.length];
      const progress = Math.random();
      const speed = 0.003 + Math.random() * 0.003;
      const particleMat = new THREE.MeshBasicMaterial({
        color: 0x22C55E,
        transparent: true,
        opacity: 0.8
      });
      const pMesh = new THREE.Mesh(particleGeometry, particleMat);
      particlesGroup.add(pMesh);
      particleList.push({ mesh: pMesh, curve, progress, speed });
    }
    scene.add(particlesGroup);
    particlesGroupRef.current = particlesGroup;
    particlesGroup.visible = activeLayers.flow;

    // ANIMATION & PROJECTION LOOP
    let animationId: number;

    const updatePositions = () => {
      const w = container.clientWidth;
      const h = container.clientHeight || 500;

      const tempV = new THREE.Vector3();
      const updatedScreenCoords: Record<string, { x: number; y: number; visible: boolean }> = {};

      const allNodes = [
        ...MOCK_MAP_NODES.security,
        ...MOCK_MAP_NODES.medical,
        ...MOCK_MAP_NODES.entrances
      ];

      allNodes.forEach((node) => {
        tempV.set(node.x3d, node.y3d, node.z3d);
        tempV.project(camera);
        
        // Hide if behind the camera view frustum plane
        const visible = tempV.z <= 1;

        const x = (tempV.x * 0.5 + 0.5) * w;
        const y = (tempV.y * -0.5 + 0.5) * h;
        updatedScreenCoords[node.id] = { x, y, visible };
      });

      setScreenCoords(updatedScreenCoords);
    };

    controls.addEventListener("change", updatePositions);
    
    // Defer initial calculation slightly to let CSS layouts settle
    const initialTimer = setTimeout(updatePositions, 150);

    let isVisible = true;
    const handleVisibilityChange = () => {
      const nextVisible = document.visibilityState === "visible";
      if (nextVisible !== isVisible) {
        isVisible = nextVisible;
        if (isVisible) {
          if (!animationId) {
            animate();
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

    const animate = () => {
      if (!isVisible) {
        animationId = 0;
        return;
      }
      animationId = requestAnimationFrame(animate);

      controls.update();

      if (particlesGroup.visible) {
        particleList.forEach((p) => {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;
          const pos = p.curve.getPointAt(p.progress);
          p.mesh.position.copy(pos);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updatePositions();
    };

    window.addEventListener("resize", handleResize);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(initialTimer);
      controls.removeEventListener("change", updatePositions);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (mountRef.current && renderer.domElement.parentNode) {
        mountRef.current.removeChild(renderer.domElement);
      }

      // Exhaustively dispose all webgl resources in the scene graph
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });

      renderer.dispose();
    };
  }, []);

  const handleZoom = (type: "in" | "out" | "reset") => {
    if (!cameraRef.current || !controlsRef.current || !containerRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (type === "in") {
      camera.position.multiplyScalar(0.85);
    } else if (type === "out") {
      camera.position.multiplyScalar(1.15);
    } else if (type === "reset") {
      camera.position.set(0, 14, 18);
      controls.target.set(0, 0.5, 0);
    }
    controls.update();

    // Trigger position sync
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight || 500;
    const tempV = new THREE.Vector3();
    const updatedScreenCoords: Record<string, { x: number; y: number; visible: boolean }> = {};
    const allNodes = [
      ...MOCK_MAP_NODES.security,
      ...MOCK_MAP_NODES.medical,
      ...MOCK_MAP_NODES.entrances
    ];
    allNodes.forEach((node) => {
      tempV.set(node.x3d, node.y3d, node.z3d);
      tempV.project(camera);
      const visible = tempV.z <= 1;
      const x = (tempV.x * 0.5 + 0.5) * w;
      const y = (tempV.y * -0.5 + 0.5) * h;
      updatedScreenCoords[node.id] = { x, y, visible };
    });
    setScreenCoords(updatedScreenCoords);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 select-none">
      
      {/* Left Toolbar panel (1 col) */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* Layer Toggles */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-gray-500" /> Map Control Layers
          </h3>

          <div className="space-y-2">
            {[
              { id: "heatmap", label: "Crowd Seating Heatmap", icon: Users, color: "text-[#7C3AED]" },
              { id: "security", label: "CCTV Camera Nodes", icon: Shield, color: "text-[#EF4444]" },
              { id: "medical", label: "First-Aid Stations", icon: Activity, color: "text-red-400" },
              { id: "entrances", label: "Gate Queue Sensors", icon: MapPin, color: "text-[#00E5FF]" },
              { id: "flow", label: "Pedestrian Flow Vectors", icon: Maximize2, color: "text-[#22C55E]" },
            ].map((layer) => {
              const Icon = layer.icon;
              const isChecked = activeLayers[layer.id as keyof typeof activeLayers];
              return (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id as keyof typeof activeLayers)}
                  className={`flex items-center justify-between w-full p-3 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isChecked
                      ? "bg-[#161F2F]/80 border-[#00E5FF]/20 text-white"
                      : "bg-white/1 border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isChecked ? layer.color : "text-gray-500"}`} />
                    <span>{layer.label}</span>
                  </div>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? "border-[#00E5FF] bg-[#00E5FF]/10" : "border-gray-600"}`}>
                    {isChecked && <div className="w-1.5 h-1.5 rounded-sm bg-[#00E5FF]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Info HUD */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4 min-h-55">
          <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-gray-400">
            Node Telemetry Inspector
          </h3>

          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#00E5FF] uppercase font-mono">{selectedNode.id}</span>
                  <span className="text-[10px] bg-[#22C55E]/10 text-[#22C55E] px-1.5 py-0.5 rounded font-bold uppercase">
                    online
                  </span>
                </div>
                <h4 className="font-heading font-bold text-base text-white">{selectedNode.label}</h4>
                
                {/* Custom dynamic fields depending on node type */}
                <div className="space-y-1.5 text-xs text-gray-400 pt-2 border-t border-white/5">
                  {selectedNode.queue && (
                    <div className="flex justify-between">
                      <span>Wait Time:</span>
                      <span className="font-mono text-white font-semibold">{selectedNode.queue}</span>
                    </div>
                  )}
                  {selectedNode.count && (
                    <div className="flex justify-between">
                      <span>Entry Rate:</span>
                      <span className="font-mono text-white font-semibold">{selectedNode.count}</span>
                    </div>
                  )}
                  {selectedNode.risk && (
                    <div className="flex justify-between">
                      <span>Risk Level:</span>
                      <span className="font-mono text-white font-semibold">{selectedNode.risk}</span>
                    </div>
                  )}
                  {selectedNode.staff && (
                    <div className="flex justify-between">
                      <span>Assigned Staff:</span>
                      <span className="font-mono text-white font-semibold">{selectedNode.staff}</span>
                    </div>
                  )}
                  {selectedNode.status && (
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-mono text-white font-semibold">{selectedNode.status}</span>
                    </div>
                  )}
                </div>

                {selectedNode.id.startsWith("cam") && (
                  <button
                    onClick={() => setCameraFeed(selectedNode.label)}
                    className="w-full mt-3 py-2 text-center text-xs font-bold text-black bg-[#00E5FF] hover:bg-[#00E5FF]/90 rounded-lg transition-all"
                  >
                    Load Live CCTV Stream
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="text-xs text-gray-500 font-light flex items-center gap-2 py-4">
                <Info className="w-4 h-4 shrink-0" />
                <span>Hover or click any node on the stadium map to inspect telemetry logs.</span>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Main Map Viewer (3 cols) */}
      <div className="xl:col-span-3 flex flex-col h-full rounded-2xl glass-panel border border-white/5 overflow-hidden relative">
        
        {/* Controls Overlay */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <button
            onClick={() => handleZoom("in")}
            className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 text-white flex items-center justify-center backdrop-blur-md cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom("out")}
            className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 text-white flex items-center justify-center backdrop-blur-md cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom("reset")}
            className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 text-white flex items-center justify-center backdrop-blur-md cursor-pointer"
            title="Reset Camera"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Map Container holding ThreeJS Mount and Projected Overlays */}
        <div ref={containerRef} className="flex-1 min-h-125 bg-[#07090f] flex items-center justify-center relative overflow-hidden">
          
          {/* Three.js Canvas Mount */}
          <div ref={mountRef} className="absolute inset-0 w-full h-full" />

          {/* Interactive Screen Space Projected Overlay */}
          <div className="absolute inset-0 pointer-events-none w-full h-full">
            
            {/* Camera Nodes */}
            {activeLayers.security &&
              MOCK_MAP_NODES.security.map((node) => {
                const coords = screenCoords[node.id];
                if (!coords || !coords.visible) return null;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="absolute w-8 h-8 rounded-lg bg-black/75 border border-[#EF4444]/40 hover:border-[#EF4444] text-[#EF4444] flex items-center justify-center shadow-lg transition-all cursor-pointer group pointer-events-auto"
                    style={{
                      left: `${coords.x}px`,
                      top: `${coords.y}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                  </button>
                );
              })}

            {/* Medical Nodes */}
            {activeLayers.medical &&
              MOCK_MAP_NODES.medical.map((node) => {
                const coords = screenCoords[node.id];
                if (!coords || !coords.visible) return null;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="absolute w-8 h-8 rounded-lg bg-black/75 border border-red-500/40 hover:border-red-500 text-red-400 flex items-center justify-center shadow-lg transition-all cursor-pointer group pointer-events-auto"
                    style={{
                      left: `${coords.x}px`,
                      top: `${coords.y}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <Activity className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                );
              })}

            {/* Gate Nodes */}
            {activeLayers.entrances &&
              MOCK_MAP_NODES.entrances.map((node) => {
                const coords = screenCoords[node.id];
                if (!coords || !coords.visible) return null;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="absolute w-8 h-8 rounded-lg bg-black/75 border border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF] flex items-center justify-center shadow-lg transition-all cursor-pointer group pointer-events-auto"
                    style={{
                      left: `${coords.x}px`,
                      top: `${coords.y}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {node.queue === "14 mins" && (
                      <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    )}
                  </button>
                );
              })}

          </div>

        </div>

        {/* Map Bottom Legends */}
        <div className="px-6 py-4 border-t border-white/5 bg-white/1 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Congestion High (&gt;80%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-500">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Congestion Medium (50-80%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-400">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span>Congestion Low (&lt;50%)</span>
            </div>
          </div>
          <span className="font-mono text-gray-500">SYSTEM_RENDERER: THREEJS_3D_ACTIVE // DRAG_TO_ROTATE</span>
        </div>

        {/* Live CCTV Video Mock Pop-Up */}
        <AnimatePresence>
          {cameraFeed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-[#080B14]/90 backdrop-blur-md flex items-center justify-center p-6 z-20"
            >
              <div className="w-full max-w-lg rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-2xl">
                <div className="px-4 py-3 bg-white/2 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-white uppercase">{cameraFeed}</span>
                  </div>
                  <button
                    onClick={() => setCameraFeed(null)}
                    className="text-xs font-semibold text-gray-400 hover:text-white"
                  >
                    Close Feed
                  </button>
                </div>
                
                {/* Animated Camera scan line grid */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,6px_100%] pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00E5FF]/20 animate-shimmer" style={{ animationDuration: "3s" }} />
                  
                  <Tv className="w-12 h-12 text-gray-700 animate-pulse" />
                  
                  <span className="absolute bottom-4 left-4 text-[10px] font-mono text-gray-400">
                    RESOLVING TELEMETRY // fps: 30.00
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
