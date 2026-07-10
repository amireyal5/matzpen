"use client";

import { useEffect, useRef } from "react";

interface InteractiveParticlesProps {
  theme?: "light" | "dark";
}

export default function InteractiveParticles({ theme = "light" }: InteractiveParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleMouseLeave);

    // Create particles
    const particleCount = Math.min(60, Math.floor((width * height) / 25000));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseAlpha: number;
      alpha: number;
      color: string;
      pulseSpeed: number;
      pulseAngle: number;
    }> = [];

    const isDark = theme === "dark";

    const getColors = () => {
      return isDark
        ? [
            "rgba(99, 102, 241, ",  // Indigo
            "rgba(6, 182, 212, ",   // Cyan
            "rgba(139, 92, 246, ",  // Purple
            "rgba(14, 165, 233, "   // Sky Blue
          ]
        : [
            "rgba(79, 70, 229, ",   // Indigo (darker)
            "rgba(8, 145, 178, ",   // Cyan (darker)
            "rgba(109, 40, 217, ",  // Purple (darker)
            "rgba(2, 132, 199, "    // Sky Blue (darker)
          ];
    };

    const colorPalette = getColors();

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 3 + 1.5,
        baseAlpha: Math.random() * 0.25 + 0.1,
        alpha: 0,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseAngle: Math.random() * Math.PI * 2,
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections first
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          const maxDist = 130;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.08 * (isDark ? 0.8 : 0.4);
            ctx.strokeStyle = isDark ? `rgba(99, 102, 241, ${alpha})` : `rgba(79, 70, 229, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interaction with mouse pointer
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.hypot(dx, dy);
          const activeRadius = 180;

          if (dist < activeRadius) {
            // Gentle attraction
            const force = (activeRadius - dist) / activeRadius;
            p.x += (dx / dist) * force * 0.5;
            p.y += (dy / dist) * force * 0.5;
          }
        }

        // Pulse alpha
        p.pulseAngle += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.08;

        // Draw particle
        ctx.fillStyle = `${p.color}${Math.max(0.01, p.alpha)})`;
        ctx.shadowBlur = isDark ? p.radius * 2 : 0;
        ctx.shadowColor = isDark ? "rgba(99, 102, 241, 0.2)" : "transparent";

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-1000"
      style={{ mixBlendMode: theme === "dark" ? "screen" : "multiply" }}
    />
  );
}
