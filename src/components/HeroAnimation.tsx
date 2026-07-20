"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 450);

    let angle = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = 450;
    };
    window.addEventListener("resize", handleResize);

    let lastTime = 0;
    const fps = 24; // Lower frame rate for decorative rendering (24 FPS is plenty)
    const interval = 1000 / fps;
    let isVisible = false;
    let isTabActive = true;

    const render = (time: number) => {
      if (!isVisible || !isTabActive) {
        animationId = 0;
        return;
      }

      animationId = requestAnimationFrame(render);

      const delta = time - lastTime;
      if (delta < interval) return;

      lastTime = time - (delta % interval);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);
      angle += 0.005 * (delta / 16.67);

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

      const drawLightBeam = (x: number, y: number, color: string) => {
        const grad = ctx.createRadialGradient(x, y - 100, 10, x, y, 120);
        grad.addColorStop(0, color);
        grad.addColorStop(0.3, color.replace("1)", "0.2)").replace("0.75", "0.2").replace("0.65", "0.2"));
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

      // Add a HUD target element overlaying central pitch
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
    };

    const startAnimation = () => {
      if (!animationId && isVisible && isTabActive) {
        lastTime = performance.now();
        animationId = requestAnimationFrame(render);
      }
    };

    const stopAnimation = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = 0;
      }
    };

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
      if (isTabActive) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
      stopAnimation();
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="w-full h-[450px] flex items-center justify-center bg-black/10 border border-white/5 rounded-xl font-mono text-xs text-gray-500 uppercase tracking-widest">
        Loading Simulator Mesh...
      </div>
    );
  }

  return <canvas ref={canvasRef} className="max-w-full" />;
}
