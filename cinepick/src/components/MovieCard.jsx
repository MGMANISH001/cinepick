// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useRef } from "react";
import { Icon } from "./Icon";
import { MoviePoster } from "./MoviePoster";
import { cn } from "../lib/utils";
import anime from "animejs";

// ============================================================
// CINEPICK — movie card (default grid variant + compact row variant)
// Hover lift + poster zoom are driven by anime.js.
// ============================================================

function MovieCard({
  movie,
  liked,
  onOpen,
  onToggleLike,
  className,
  footerExtra,
  matchPercent, // optional — shown as a chip (used in "Your Picks")
  variant = "default", // compact = for horizontal rows
}) {
  const cardRef = useRef(null);
  const posterRef = useRef(null);

  // On touch screens a tap fires a "sticky" mouseenter; skip the hover lift
  // there so cards don't jump or stay raised after tapping.
  function canHover() {
    return window.matchMedia?.("(hover: hover)").matches ?? true;
  }

  function handleEnter() {
    if (!cardRef.current || !canHover()) return;
    anime({ targets: cardRef.current, translateY: -6, duration: 280, easing: "easeOutCubic" });
    if (posterRef.current) {
      anime({ targets: posterRef.current, scale: 1.06, duration: 400, easing: "easeOutCubic" });
    }
  }

  function handleLeave() {
    if (!cardRef.current) return;
    anime({ targets: cardRef.current, translateY: 0, duration: 280, easing: "easeOutCubic" });
    if (posterRef.current) {
      anime({ targets: posterRef.current, scale: 1, duration: 400, easing: "easeOutCubic" });
    }
  }

  function handleLike(e) {
    e.stopPropagation();
    onToggleLike(movie.id);
  }

  function handleKeyDown(e) {
    // Treat Enter / Space as a click on the card (bookmark button still routes to itself).
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(movie);
    }
  }

  return (
    <div
      ref={cardRef}
      data-card=""
      data-row-item={variant === "compact" ? "" : undefined}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(movie)}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 text-left shadow-lg shadow-black/40 backdrop-blur",
        "transition-colors hover:border-white/25 hover:bg-zinc-900/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400",
        // Compact variant sized to fit ~5 cards per row on desktop.
        // (w-36=144 mobile → 2 cards · w-44=176 sm → 3 · w-52=208 md → 3-4 · w-56=224 lg → 5)
        variant === "compact" && "w-36 shrink-0 snap-start sm:w-44 md:w-52 lg:w-56",
        className
      )}
      aria-label={`${movie.title}, ${movie.year}. ${movie.genres.join(", ")}. Rated ${movie.rating} out of 10. Open details.`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <div ref={posterRef} className="h-full w-full">
          <MoviePoster movie={movie} />
        </div>

        {/* Rating chip */}
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-amber-300 backdrop-blur">
          <Icon name="Star" className="h-3 w-3 fill-amber-300" />
          {movie.rating.toFixed(1)}
        </div>

        {/* Match-percent chip (used in recommendations) */}
        {typeof matchPercent === "number" && (
          <div className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-bold text-white shadow sm:text-[11px]">
            {matchPercent}% match
          </div>
        )}

        {/* Bookmark button */}
        <button
          onClick={handleLike}
          aria-label={liked ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
          aria-pressed={liked}
          className={cn(
            "absolute bottom-2 right-2 z-10 grid h-10 w-10 place-items-center sm:h-9 sm:w-9 rounded-full border border-white/10 backdrop-blur transition-colors",
            liked
              ? "bg-rose-500 text-white"
              : "bg-black/60 text-white/70 hover:bg-black/80 hover:text-white"
          )}
        >
          <Icon name={liked ? "BookmarkCheck" : "Bookmark"} className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="line-clamp-1 min-w-0 text-sm font-bold text-white">{movie.title}</h3>
          <span className="shrink-0 text-[11px] text-zinc-400">{movie.year}</span>
        </div>
        <p className="line-clamp-1 text-[11px] uppercase tracking-wide text-zinc-400">
          {movie.genres.slice(0, 3).join(" · ")}
        </p>
        <p className="line-clamp-2 text-xs text-zinc-400">{movie.tagline}</p>
        {footerExtra && <div className="mt-1">{footerExtra}</div>}
      </div>
    </div>
  );
}

export { MovieCard };
