// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useState, useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { MoviePoster } from "./MoviePoster";
import { ParticleBackground } from "./ParticleBackground";
import { cn } from "../lib/utils";
import anime from "animejs";

// ============================================================
// CINEPICK — auto-rotating hero carousel (Hotstar-style)
// 7 featured films, advances every 4s, pauses on hover/focus,
// Ken Burns slow-zoom backdrop, staggered block entrances.
// ============================================================

const AUTO_ADVANCE_MS = 4000;
const SWIPE_MIN_PX = 50;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function HeroCarousel({ slides, onPlay, onMoreInfo, onJumpToQuiz }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const touchStart = useRef(null);

  const current = slides[index] ?? slides[0];

  function go(to) {
    if (slides.length === 0) return;
    const next = (to + slides.length) % slides.length;
    if (next === index) return;
    setIndex(next);
  }

  function next() {
    go(index + 1);
  }

  function prev() {
    go(index - 1);
  }

  // Auto-advance unless paused or only one slide.
  useEffect(() => {
    if (paused || slides.length <= 1 || prefersReducedMotion()) return;
    const t = setTimeout(() => next(), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [index, paused, slides.length]);

  // Staggered fade-up on the active slide's [data-hero-block] elements.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const blocks = root.querySelectorAll("[data-hero-block]");
    // Reset to invisible so the stagger runs on every slide change.
    anime.set(blocks, { opacity: 0, translateY: 30 });
    anime({
      targets: Array.from(blocks),
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 700,
      delay: anime.stagger(100, { start: 200 }),
      easing: "easeOutCubic",
    });
  }, [index]);

  // Cross-fade the backdrop image on slide change.
  useEffect(() => {
    const node = backdropRef.current;
    if (!node) return;
    anime.set(node, { opacity: 0 });
    anime({
      targets: node,
      opacity: [0, 1],
      duration: 900,
      easing: "easeOutCubic",
    });
  }, [index]);

  // Swipe left/right on touch screens to change slide. Only a mostly
  // horizontal gesture counts, so vertical page scrolling is untouched.
  function onTouchStart(e) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    setPaused(true);
  }
  function onTouchEnd(e) {
    const start = touchStart.current;
    touchStart.current = null;
    setPaused(false);
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) next();
    else prev();
  }

  if (!current) return null;

  return (
    <header
      ref={rootRef}
      className="relative isolate overflow-hidden bg-black text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => {
        touchStart.current = null;
        setPaused(false);
      }}
    >
      {/* Blurred poster backdrop (darkened + Ken Burns slow zoom) */}
      <div ref={backdropRef} aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="kenburns-layer absolute inset-0 scale-110">
          {current.posterUrl ? (
            <img
              src={current.posterUrl}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: "blur(28px) saturate(120%) brightness(0.55)" }}
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${current.posterGradient[0]}, ${current.posterGradient[1]} 80%)`,
                filter: "blur(40px) saturate(120%)",
                opacity: 0.55,
              }}
            />
          )}
        </div>
      </div>

      {/* Dark overlay for legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 45%, transparent 75%), linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 35%)",
        }}
      />
      <ParticleBackground />

      {/* Hero content */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-4 pb-16 pt-20 sm:px-8 sm:pb-28 sm:pt-16 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div className="flex flex-col gap-5">
          <div
            data-hero-block=""
            className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-rose-200 backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
            </span>
            Featured · Slide {index + 1} of {slides.length}
          </div>

          {/* Title. FIXED-height block, bottom-aligned text: the metadata
              row below sits at the same Y on every slide, no matter how the
              title wraps (1 line for "Inception", 4 for the LOTR films).
              Extra-long titles (>32 chars) drop a size step to stay within
              the reserved block. */}
          <div
            data-hero-block=""
            className="flex h-[7.2rem] max-w-3xl flex-col justify-end sm:h-[12.85rem] md:h-[17.1rem]"
          >
            <h1
              className={cn(
                "break-words font-display uppercase !leading-[0.95] tracking-[0.01em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]",
                // Phone sizes are deliberately small so the longest single
                // word ("Interstellar") fits a 320px screen without breaking.
                current.title.length > 32
                  ? "text-3xl sm:text-6xl md:text-7xl"
                  : "text-[2.5rem] sm:text-7xl md:text-8xl"
              )}
            >
              {current.title}
            </h1>
          </div>

          {/* Metadata row */}
          <div
            data-hero-block=""
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-200"
          >
            <span className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Icon name="Star" className="h-4 w-4 fill-amber-300" />
              {current.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="Calendar" className="h-4 w-4 text-zinc-400" />
              {current.year}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="Clock" className="h-4 w-4 text-zinc-400" />
              {current.duration} min
            </span>
            <span
              className="hidden h-1 w-1 rounded-full bg-zinc-600 sm:inline-block"
              aria-hidden="true"
            />
            <span className="text-zinc-300">{current.genres.join(" · ")}</span>
          </div>

          {/* Tagline + plot excerpt */}
          <div data-hero-block="" className="max-w-2xl">
            <p className="text-base font-medium italic text-zinc-200 sm:text-lg">
              &ldquo;{current.tagline}&rdquo;
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-zinc-300 sm:text-base">
              {current.plot}
            </p>
          </div>

          {/* CTAs */}
          <div data-hero-block="" className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onPlay(current)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black shadow-xl sm:px-7 transition-transform hover:scale-[1.03] sm:text-base"
            >
              <Icon name="Play" className="h-4 w-4 fill-black" />
              Play
            </button>
            <button
              onClick={() => onMoreInfo(current)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur sm:px-7 transition-colors hover:bg-white/20 sm:text-base"
            >
              <Icon name="Info" className="h-4 w-4" />
              More Info
            </button>
            <button
              onClick={onJumpToQuiz}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-rose-500/30 transition-transform hover:scale-[1.03] sm:text-base"
            >
              Take Mood Quiz
            </button>
          </div>

          {/* Dot indicators */}
          <div data-hero-block="" className="mt-2 flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}: ${s.title}`}
                aria-current={i === index}
                className={cn(
                  "relative h-1.5 rounded-full transition-all after:absolute after:-inset-x-1 after:-inset-y-3 after:content-['']",
                  i === index ? "w-8 bg-rose-500" : "w-3 bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        </div>

        {/* Featured poster thumbnail (right side, desktop only).
            fit="cover" + fixed 2/3 frame => every slide's artwork renders
            at the exact same size, like slide 1 (no letterbox shrinking).
            key={current.id} resets the load spinner state per slide. */}
        <div className="pointer-events-none relative hidden md:block">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/15 blur-3xl"
          />
          <div className="relative mx-auto w-52 overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.95)] ring-1 ring-black/40 lg:w-60">
            <div className="aspect-[2/3]">
              <MoviePoster key={current.id} movie={current} fit="cover" eager />
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next chevrons (overlay) */}
      <button
        onClick={prev}
        aria-label="Previous featured film"
        className="absolute left-1 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/80 sm:left-4 sm:grid"
      >
        <Icon name="ChevronLeft" className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next featured film"
        className="absolute right-1 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/80 sm:right-4 sm:grid"
      >
        <Icon name="ChevronRight" className="h-5 w-5" />
      </button>

      {/* Bottom fade into the next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-black"
        aria-hidden="true"
      />
    </header>
  );
}

export { HeroCarousel };
