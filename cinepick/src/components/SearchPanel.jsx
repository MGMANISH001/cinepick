import { useState, useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { MovieCard } from "./MovieCard";
import { searchTitlesByPrefix } from "../lib/recommender";
import { MOVIES } from "../data/movies";

// ============================================================
// CINEPICK — Full-screen search panel
// Opens when "Search" is clicked in the sidebar.
// Shows trending recommendations when empty, live results when typing.
// Click a card → opens the movie modal + closes this panel.
// ============================================================

function SearchPanel({ open, onClose, onPickMovie, liked, onToggleLike }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // Focus the input when the panel opens; reset query when it closes.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
    // Reset when closing so re-opening starts fresh
    setQuery("");
  }, [open]);

  // Lock body scroll + Escape to close.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const trimmed = query.trim();
  const results = trimmed ? searchTitlesByPrefix(trimmed, 20) : [];
  const trending = [...MOVIES].sort((a, b) => b.rating - a.rating).slice(0, 10);

  function handlePick(movie) {
    onPickMovie(movie);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black md:left-64">
      {/* Sticky search header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <Icon name="Search" className="h-5 w-5 shrink-0 text-zinc-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies by title…"
            aria-label="Search movies"
            className="flex-1 bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none sm:text-lg"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Icon name="X" className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {trimmed ? (
          /* ---- Search results ---- */
          <div>
            <p className="mb-4 text-sm text-zinc-400">
              {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
              <span className="font-semibold text-white">"{trimmed}"</span>
            </p>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {results.map((m) => (
                  <MovieCard
                    key={m.id}
                    movie={m}
                    liked={liked(m.id)}
                    onOpen={handlePick}
                    onToggleLike={onToggleLike}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-zinc-400">
                  No movies found for "{trimmed}".
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Try searching by title — e.g. "Inception", "Matrix", "Godfather".
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ---- Trending recommendations when search is empty ---- */
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Icon name="Flame" className="h-5 w-5 text-rose-400" />
              Trending Searches
            </h2>
            <p className="mb-5 text-sm text-zinc-400">
              Most-watched films in the CINEPICK library.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {trending.map((m) => (
                <MovieCard
                  key={m.id}
                  movie={m}
                  liked={liked(m.id)}
                  onOpen={handlePick}
                  onToggleLike={onToggleLike}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { SearchPanel };
