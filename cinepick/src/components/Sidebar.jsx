// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useState, useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { ProfileBadge } from "./ProfileBadge";
import { searchTitlesByPrefix } from "../lib/recommender";
import { cn } from "../lib/utils";
import anime from "animejs";

// ============================================================
// CINEPICK — Hotstar-style fixed left sidebar WITH hover-expand
//
// Like the JioHotstar app: the rail sits collapsed (icons only,
// w-20) so the content gets maximum room. Hovering the rail makes
// it glide open to w-64 and the labels fade/slide in; moving the
// mouse away glides it closed again. The expanded panel OVERLAYS
// the content (the page never reflows) — exactly like the video
// reference. On mobile it remains a slide-in drawer.
// ============================================================

// Label wrapper that collapses to zero width and fades out.
// max-width is interpolable, so the reveal animates smoothly
// without clipping the search suggestions dropdown.
function Reveal({ expanded, children, className = "" }) {
  return (
    <span
      className={cn(
        "overflow-hidden whitespace-nowrap transition-all duration-200 ease-out",
        expanded ? "max-w-[10rem] opacity-100 delay-100" : "max-w-0 opacity-0 duration-150",
        className
      )}
    >
      {children}
    </span>
  );
}

function Sidebar({
  onJumpHome,
  onJumpTrending,
  onJumpTop10,
  onJumpQuiz,
  onJumpBrowse,
  onJumpWatchlist,
  onJumpGenreRow,
  onPickFromSearch,
  onOpenProfileGate,
  hasWatchlist,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false); // desktop hover state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const navRef = useRef(null);

  const items = [
    { id: "home", label: "Home", icon: "Home", onSelect: onJumpHome },
    { id: "trending", label: "Trending Now", icon: "Flame", onSelect: onJumpTrending },
    { id: "top10", label: "Top 10", icon: "Trophy", onSelect: onJumpTop10 },
    { id: "foryou", label: "For You", icon: "Sparkles", onSelect: onJumpQuiz },
    { id: "scifi", label: "Sci-Fi", icon: "Rocket", onSelect: () => onJumpGenreRow("Sci-Fi") },
    { id: "drama", label: "Drama", icon: "Drama", onSelect: () => onJumpGenreRow("Drama") },
    { id: "thriller", label: "Thriller", icon: "Eye", onSelect: () => onJumpGenreRow("Thriller") },
    { id: "browse", label: "Browse All", icon: "LayoutGrid", onSelect: onJumpBrowse },
    ...(hasWatchlist
      ? [{ id: "mylist", label: "My List", icon: "Bookmark", onSelect: onJumpWatchlist }]
      : []),
  ];

  // Staggered fade-in for sidebar nav items (re-runs when My List appears).
  useEffect(() => {
    const node = navRef.current;
    if (!node) return;
    const targets = node.querySelectorAll("[data-nav-item]");
    if (!targets.length) return;
    anime({
      targets: Array.from(targets),
      opacity: [0, 1],
      translateX: [-16, 0],
      duration: 500,
      delay: anime.stagger(45, { start: 80 }),
      easing: "easeOutCubic",
    });
  }, [hasWatchlist]);

  // Stagger the logo + search block on mount too.
  useEffect(() => {
    const node = navRef.current;
    if (!node) return;
    const blocks = node.querySelectorAll("[data-sidebar-block]");
    if (!blocks.length) return;
    anime({
      targets: Array.from(blocks),
      opacity: [0, 1],
      translateY: [-12, 0],
      duration: 600,
      delay: anime.stagger(80, { start: 40 }),
      easing: "easeOutCubic",
    });
  }, []);

  // Focus the search input when it opens.
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const suggestions = searchQuery.trim() ? searchTitlesByPrefix(searchQuery, 6) : [];

  function handlePick(movie) {
    onPickFromSearch(movie);
    setSearchQuery("");
    setSearchOpen(false);
    setMobileOpen(false);
  }

  function handleNavSelect(item) {
    item.onSelect();
    setMobileOpen(false);
  }

  function openSearch() {
    setSearchOpen(true);
    setHoverExpanded(true); // touch devices: tapping the icon also opens the rail
  }

  // The rail is rendered twice (desktop fixed + mobile drawer) with an
  // `expanded` flag driving every reveal/width class.
  function renderRail({ expanded }) {
    return (
      <aside
        ref={navRef}
        className={cn(
          "flex h-full flex-col border-r border-white/10 bg-zinc-950/95 backdrop-blur-xl transition-[width] duration-300 ease-out",
          expanded ? "w-64 shadow-2xl shadow-black/60" : "w-20"
        )}
        aria-label="Main navigation"
        aria-expanded={expanded}
      >
        {/* Logo */}
        <div data-sidebar-block className="flex items-center px-4 py-5">
          <span className="grid w-12 shrink-0 place-items-center">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-fuchsia-500 shadow-lg shadow-rose-500/30">
              <Icon name="Film" className="h-5 w-5 text-white" />
            </span>
          </span>
          <Reveal expanded={expanded}>
            <span className="pl-1 text-lg font-black tracking-tight text-white">CINEPICK</span>
          </Reveal>
        </div>

        {/* Search */}
        <div data-sidebar-block className="px-4 pb-3">
          {expanded && searchOpen ? (
            <div className="relative">
              <Icon
                name="Search"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
              />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles…"
                aria-label="Search movies by title"
                className="w-full rounded-full border border-white/10 bg-zinc-900/80 py-2 pl-9 pr-9 text-sm text-white placeholder:text-zinc-500 focus:border-rose-400/40 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  aria-label="Close search"
                  className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <Icon name="X" className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Suggestions dropdown — anchored to the sidebar */}
              {searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl">
                  {suggestions.length > 0 ? (
                    <ul className="max-h-[24rem] overflow-y-auto">
                      {suggestions.map((m) => (
                        <li key={m.id}>
                          <button
                            onClick={() => handlePick(m)}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                          >
                            <div className="h-14 w-10 shrink-0 overflow-hidden rounded">
                              {m.posterUrl ? (
                                <img
                                  src={m.posterUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div
                                  className="h-full w-full"
                                  style={{
                                    background: `linear-gradient(135deg, ${m.posterGradient[0]}, ${m.posterGradient[1]})`,
                                  }}
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white">
                                {m.title}
                              </p>
                              <p className="truncate text-xs text-zinc-400">
                                {m.year} · {m.genres.slice(0, 2).join(", ")}
                              </p>
                            </div>
                            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-300">
                              <Icon name="Star" className="h-3 w-3 fill-amber-300" />
                              {m.rating.toFixed(1)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-zinc-400">
                      No titles match &ldquo;{searchQuery}&rdquo;.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openSearch}
              aria-label="Search titles"
              className={cn(
                "flex w-full items-center rounded-full border transition-colors",
                expanded
                  ? "border-white/10 bg-zinc-900/60 py-2.5 pr-3 hover:border-white/25"
                  : "border-transparent py-2.5 hover:bg-white/5"
              )}
            >
              <span className="grid w-12 shrink-0 place-items-center text-zinc-400 transition-colors hover:text-white">
                <Icon name="Search" className="h-4 w-4" />
              </span>
              <Reveal expanded={expanded}>
                <span className="text-sm text-zinc-400">Search titles…</span>
              </Reveal>
            </button>
          )}
        </div>

        {/* Nav items (scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          <p className="pb-2 pt-3 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            <Reveal expanded={expanded} className="block">
              Categories
            </Reveal>
          </p>
          {items.map((item) => (
            <button
              key={item.id}
              data-nav-item
              onClick={() => handleNavSelect(item)}
              className={cn(
                "group flex w-full items-center rounded-lg py-2.5 text-left text-sm font-medium text-zinc-300 transition-all hover:bg-white/5 hover:text-white",
                expanded ? "pr-2 hover:translate-x-1" : "pr-0"
              )}
            >
              <span className="grid w-12 shrink-0 place-items-center text-zinc-400 transition-colors group-hover:text-rose-400">
                <Icon name={item.icon} className="h-4 w-4" />
              </span>
              <Reveal expanded={expanded}>
                <span>{item.label}</span>
              </Reveal>
              {expanded && (
                <span className="h-1 w-1 rounded-full bg-rose-400 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </button>
          ))}

          {/* Discover block — only exists in the expanded panel */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              expanded ? "max-h-64 opacity-100 delay-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="my-3 h-px bg-white/5" aria-hidden="true" />
            <p className="pb-2 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              Discover
            </p>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <Icon name="Compass" className="h-4 w-4 text-rose-400" />
                <span className="font-semibold">Taste Engine</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                Take the Mood Quiz to get films matched to how you feel.
              </p>
              <button
                onClick={onJumpQuiz}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg shadow-rose-500/30"
              >
                <Icon name="Sparkles" className="h-3 w-3" /> Start Quiz
              </button>
            </div>
          </div>
        </nav>

        {/* Profile badge */}
        <div className="border-t border-white/10 px-4 py-3">
          <ProfileBadge compact={!expanded} onOpenAdd={onOpenProfileGate} onManage={onOpenProfileGate} />
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Desktop: fixed left rail — collapses to icons, expands on hover */}
      <div className="hidden md:block">
        <div
          className="fixed inset-y-0 left-0 z-40"
          onMouseEnter={() => setHoverExpanded(true)}
          onMouseLeave={() => {
            setHoverExpanded(false);
            setSearchOpen(false);
            setSearchQuery("");
          }}
        >
          {renderRail({ expanded: hoverExpanded })}
        </div>
      </div>

      {/* Mobile: floating hamburger + slide-in drawer (always expanded) */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="fixed left-3 top-3 z-50 grid h-10 w-10 place-items-center rounded-full bg-zinc-950/80 text-white backdrop-blur md:hidden"
      >
        <Icon name="Menu" className="h-5 w-5" />
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="animate-slide-in-left absolute inset-y-0 left-0">
            {renderRail({ expanded: true })}
          </div>
        </div>
      )}
    </>
  );
}

export { Sidebar };
