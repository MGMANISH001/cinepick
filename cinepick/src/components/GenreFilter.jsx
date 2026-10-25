// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { ALL_GENRES } from "../data/movies";
import { cn } from "../lib/utils";

// ============================================================
// CINEPICK — genre chip filter (Browse the whole library)
// ============================================================

function GenreFilter({ selected, onToggle, onClear }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onClear}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          selected.length === 0
            ? "border-rose-400 bg-rose-500/20 text-rose-200"
            : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/25 hover:text-white"
        )}
      >
        All
      </button>
      {ALL_GENRES.map((g) => {
        const active = selected.includes(g);
        return (
          <button
            key={g}
            onClick={() => onToggle(g)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-transparent bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/25 hover:text-white"
            )}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}

export { GenreFilter };
