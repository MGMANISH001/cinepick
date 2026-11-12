// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { MoviePoster } from "./MoviePoster";
import { cn } from "../lib/utils";
import anime from "animejs";

// ============================================================
// CINEPICK — movie detail modal
// Custom lightweight dialog (replaces the Radix/shadcn Dialog from
// the original project): overlay click, Escape key, focus handling,
// body scroll lock, and anime.js staggered content entrance.
// ============================================================

function MovieModal({ movie, liked, onToggleLike, similar, onSelectSimilar, onOpenChange }) {
  const contentRef = useRef(null);

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!movie) return;

    function onKey(e) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [movie, onOpenChange]);

  // Animate the inner content when a movie opens.
  useEffect(() => {
    if (!movie) return;
    const t = setTimeout(() => {
      const node = contentRef.current;
      if (!node) return;
      const targets = node.querySelectorAll("[data-modal-block]");
      anime({
        targets: Array.from(targets),
        opacity: [0, 1],
        translateY: [18, 0],
        duration: 600,
        delay: anime.stagger(80, { start: 60 }),
        easing: "easeOutCubic",
      });
    }, 40);
    return () => clearTimeout(t);
  }, [movie]);

  if (!movie) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={movie.title}
        className="animate-sheet-up max-h-[92dvh] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-t-3xl border border-white/10 bg-zinc-950/95 text-white shadow-2xl backdrop-blur-xl sm:animate-none sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visually hidden title for screen readers */}
        <h2 className="sr-only">
          {movie.title}. {movie.tagline} Rated {movie.rating} out of 10.
        </h2>

        {/* Close button — wrapper is sticky so the button stays on screen
            while a tall sheet scrolls (h-0 so it takes no layout space). */}
        <div className="pointer-events-none sticky top-0 z-20 h-0">
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close details"
            className="pointer-events-auto absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-black/70 text-white/90 backdrop-blur transition-colors hover:bg-black/90 hover:text-white sm:h-9 sm:w-9"
          >
            <Icon name="X" className="h-5 w-5 sm:h-4 sm:w-4" />
          </button>
        </div>

        <div className="relative grid gap-0 md:grid-cols-[40%_60%]">
          {/* Poster column */}
          <div data-modal-block="" className="relative h-64 min-[420px]:h-80 md:h-full md:min-h-[28rem]">
            <MoviePoster key={movie.id} movie={movie} />
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
              <Icon name="Star" className="h-3.5 w-3.5 fill-amber-300" />
              {movie.rating.toFixed(1)} / 10
            </div>
          </div>

          {/* Details column */}
          <div className="flex min-w-0 flex-col gap-5 p-5 sm:p-7">
            <div data-modal-block="">
              <p className="text-xs uppercase tracking-[0.25em] text-rose-400">
                {movie.year} · {movie.director}
              </p>
              <h3 className="mt-1 break-words text-2xl font-black leading-tight tracking-tight min-[420px]:text-3xl sm:text-4xl">
                {movie.title}
              </h3>
              <p className="mt-2 text-sm italic text-zinc-400">{movie.tagline}</p>
            </div>

            {/* Meta chips */}
            <div data-modal-block="" className="flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-200"
                >
                  {g}
                </span>
              ))}
              {movie.moods.map((m) => (
                <span
                  key={m}
                  className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-medium text-fuchsia-200"
                >
                  {m}
                </span>
              ))}
            </div>

            <div data-modal-block="" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Icon name="Clock" className="h-3.5 w-3.5" /> {movie.duration} min
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="Film" className="h-3.5 w-3.5" /> {movie.year}
              </span>
            </div>

            <div data-modal-block="">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Plot
              </h4>
              <p className="text-sm leading-relaxed text-zinc-200">{movie.plot}</p>
            </div>

            <div data-modal-block="">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Cast
              </h4>
              <p className="text-sm text-zinc-200">{movie.cast.join(", ")}</p>
            </div>

            <div data-modal-block="">
              <button
                onClick={() => onToggleLike(movie.id)}
                aria-pressed={liked}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors sm:w-auto sm:py-2.5",
                  liked
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Icon name={liked ? "BookmarkCheck" : "Bookmark"} className="h-4 w-4" />
                {liked ? "Saved to Watchlist" : "Add to Watchlist"}
              </button>
            </div>
          </div>
        </div>

        {/* Similar movies */}
        {similar.length > 0 && (
          <div
            className="border-t border-white/10 bg-black/40 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-7"
            data-modal-block=""
          >
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              <Icon name="Sparkles" className="h-4 w-4 text-rose-400" />
              Because you like {movie.title}
            </h4>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {similar.map((s) => (
                <button
                  key={s.movie.id}
                  onClick={() => onSelectSimilar(s.movie)}
                  className="group flex flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-900/60 text-left transition-colors hover:border-rose-400/50 hover:bg-zinc-900"
                  aria-label={`Open ${s.movie.title}`}
                >
                  <div className="aspect-[2/3] w-full overflow-hidden">
                    <MoviePoster
                      movie={s.movie}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="line-clamp-1 px-2 py-1 text-[11px] font-medium text-white">
                    {s.movie.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { MovieModal };
