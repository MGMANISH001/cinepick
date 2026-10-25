// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useState, useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { cn } from "../lib/utils";
import anime from "animejs";

// ============================================================
// CINEPICK — horizontal scrollable content row
// Chevron scroll buttons (anime.js-powered smooth scroll), staggered
// fade-in of items on first mount, hidden scrollbars.
// ============================================================

function ContentRow({ title, subtitle, badge, children, className }) {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [hovering, setHovering] = useState(false);

  function updateArrows() {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  function scrollBy(delta) {
    const el = scrollRef.current;
    if (!el) return;
    anime({
      targets: el,
      scrollLeft: el.scrollLeft + delta,
      duration: 500,
      easing: "easeOutCubic",
    });
  }

  // Staggered fade-in for row items on first mount.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const items = el.querySelectorAll("[data-row-item]");
    if (!items.length) return;
    anime({
      targets: Array.from(items),
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 600,
      delay: anime.stagger(50, { start: 60 }),
      easing: "easeOutCubic",
    });
  }, []);

  return (
    <section className={cn("relative", className)}>
      <div className="mb-3 flex items-end justify-between gap-4 px-4 sm:px-8">
        <div>
          <div className="flex items-center gap-2">
            {badge}
            <h2 className="text-lg font-black tracking-tight text-white sm:text-2xl">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-400 sm:text-sm">{subtitle}</p>
          )}
        </div>
      </div>

      <div
        className="group relative"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Left chevron */}
        <button
          onClick={() => scrollBy(-Math.min(scrollRef.current?.clientWidth ?? 600, 700))}
          aria-label="Scroll left"
          className={cn(
            "absolute left-1 top-0 z-20 grid h-full w-10 place-items-center bg-gradient-to-r from-black/80 to-transparent text-white transition-opacity sm:left-2",
            canLeft && hovering ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <Icon name="ChevronLeft" className="h-7 w-7" />
        </button>

        {/* Scroll viewport */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-3 sm:px-8"
        >
          {children}
        </div>

        {/* Right chevron */}
        <button
          onClick={() => scrollBy(Math.min(scrollRef.current?.clientWidth ?? 600, 700))}
          aria-label="Scroll right"
          className={cn(
            "absolute right-1 top-0 z-20 grid h-full w-10 place-items-center bg-gradient-to-l from-black/80 to-transparent text-white transition-opacity sm:right-2",
            canRight && hovering ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <Icon name="ChevronRight" className="h-7 w-7" />
        </button>
      </div>
    </section>
  );
}

export { ContentRow };
