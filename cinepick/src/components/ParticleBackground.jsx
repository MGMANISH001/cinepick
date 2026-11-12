// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useEffect, useRef } from "react";

// ============================================================
// CINEPICK — floating particle field (canvas + requestAnimationFrame)
// Purely decorative; pointer-events-none so it never blocks clicks.
// ============================================================

function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];

    function resize() {
      const parent = canvas.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    function seed() {
      const count = Math.min(60, Math.floor((width * height) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: 0.15 + Math.random() * 0.5,
        hue: Math.random() < 0.5 ? 0 : 270, // red or purple
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle =
          p.hue === 0
            ? `rgba(248, 113, 113, ${p.alpha})`
            : `rgba(192, 132, 252, ${p.alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function start() {
      if (reduceMotion || raf) return;
      raf = requestAnimationFrame(draw);
    }
    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    seed();
    if (reduceMotion) {
      // One static frame instead of a running loop.
      draw();
      stop();
    } else {
      draw();
    }

    // Mobile browsers fire "resize" whenever the address bar shows/hides
    // while scrolling. Reseed only when the width really changed; a
    // height-only change just resizes the canvas so the dots don't jump.
    let lastWidth = width;
    const onResize = () => {
      const w = canvas.parentElement?.clientWidth ?? window.innerWidth;
      const h = canvas.parentElement?.clientHeight ?? window.innerHeight;
      if (w === lastWidth && h === height) return;
      const widthChanged = w !== lastWidth;
      lastWidth = w;
      resize();
      if (widthChanged) seed();
    };
    window.addEventListener("resize", onResize);

    // Don't burn battery animating in a background tab.
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
    />
  );
}

export { ParticleBackground };
