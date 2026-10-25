// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useState, useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { MoviePoster } from "./MoviePoster";
import { cn } from "../lib/utils";
import anime from "animejs";

// ============================================================
// CINEPICK — Netflix-style "Top 10 Today" row
// Giant outlined rank numbers beside each poster card.
// ============================================================

function TopTenRow({ movies, onOpen, liked, onToggleLike }) {
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const items = el.querySelectorAll("[data-row-item]");
    anime({
      targets: Array.from(items),
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
      delay: anime.stagger(60, { start: 80 }),
      easing: "easeOutCubic",
    });
  }, []);

  return (
    <section className="relative">
      <div className="mb-3 flex items-center gap-2 px-4 sm:px-8">
        <span className="rounded-md bg-gradient-to-r from-rose-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
          Top 10
        </span>
        <h2 className="text-lg font-black tracking-tight text-white sm:text-2xl">
          Top 10 Today
        </h2>
      </div>

      <div
        className="group relative"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <button
          onClick={() => scrollBy(-700)}
          aria-label="Scroll left"
          className={cn(
            "absolute left-1 top-0 z-20 grid h-full w-10 place-items-center bg-gradient-to-r from-black/80 to-transparent text-white transition-opacity sm:left-2",
            canLeft && hovering ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <Icon name="ChevronLeft" className="h-7 w-7" />
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 sm:px-8"
        >
          {movies.slice(0, 10).map((m, i) => (
            <TopTenCard
              key={m.id}
              movie={m}
              rank={i + 1}
              liked={liked(m.id)}
              onOpen={onOpen}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>

        <button
          onClick={() => scrollBy(700)}
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

function TopTenCard({ movie, rank, liked, onOpen, onToggleLike }) {
  return (
    <div
      data-row-item
      className="relative flex shrink-0 items-end"
      style={{ width: "calc(100vw - 4rem)", maxWidth: "20rem" }}
    >
      {/* Giant rank number */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none font-black leading-none text-transparent"
        style={{
          fontSize: "9rem",
          WebkitTextStroke: "2px rgba(255,255,255,0.45)",
          marginRight: "-1.5rem",
        }}
      >
        {rank}
      </span>

      {/* Poster card */}
      <div className="relative w-32 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-lg sm:w-36">
        <button
          onClick={() => onOpen(movie)}
          className="group/poster block aspect-[2/3] w-full"
          aria-label={`${movie.title}, rank ${rank}`}
        >
          <MoviePoster movie={movie} />
        </button>
        <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur">
          <Icon name="Star" className="h-2.5 w-2.5 fill-amber-300" />
          {movie.rating.toFixed(1)}
        </div>
        <button
          onClick={() => onToggleLike(movie.id)}
          aria-label={liked ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
          aria-pressed={liked}
          className={cn(
            "absolute bottom-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full border border-white/10 backdrop-blur transition-colors",
            liked ? "bg-rose-500 text-white" : "bg-black/60 text-white/70 hover:bg-black/80"
          )}
        >
          <span className="text-xs">{liked ? "✓" : "+"}</span>
        </button>
      </div>
    </div>
  );
}

export { TopTenRow };
