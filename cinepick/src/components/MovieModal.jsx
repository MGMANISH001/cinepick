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
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={movie.title}
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950/95 text-white shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visually hidden title for screen readers */}
        <h2 className="sr-only">
          {movie.title}. {movie.tagline} Rated {movie.rating} out of 10.
        </h2>

        <div className="relative grid gap-0 md:grid-cols-[40%_60%]">
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close details"
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white/80 backdrop-blur transition-colors hover:bg-black/80 hover:text-white"
          >
            <Icon name="X" className="h-4 w-4" />
          </button>

          {/* Poster column */}
          <div data-modal-block className="relative aspect-[2/3] md:aspect-auto md:h-full">
            <MoviePoster key={movie.id} movie={movie} />
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
              <Icon name="Star" className="h-3.5 w-3.5 fill-amber-300" />
              {movie.rating.toFixed(1)} / 10
            </div>
          </div>

          {/* Details column */}
          <div className="flex flex-col gap-5 p-5 sm:p-7">
            <div data-modal-block>
              <p className="text-xs uppercase tracking-[0.25em] text-rose-400">
                {movie.year} · {movie.director}
              </p>
              <h3 className="mt-1 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                {movie.title}
              </h3>
              <p className="mt-2 text-sm italic text-zinc-400">{movie.tagline}</p>
            </div>

            {/* Meta chips */}
            <div data-modal-block className="flex flex-wrap gap-2">
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

            <div data-modal-block className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Icon name="Clock" className="h-3.5 w-3.5" /> {movie.duration} min
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="Film" className="h-3.5 w-3.5" /> {movie.year}
              </span>
            </div>

            <div data-modal-block>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Plot
              </h4>
              <p className="text-sm leading-relaxed text-zinc-200">{movie.plot}</p>
            </div>

            <div data-modal-block>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Cast
              </h4>
              <p className="text-sm text-zinc-200">{movie.cast.join(", ")}</p>
            </div>

            <div data-modal-block>
              <button
                onClick={() => onToggleLike(movie.id)}
                aria-pressed={liked}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
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
          <div className="border-t border-white/10 bg-black/40 p-5 sm:p-7" data-modal-block>
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
