// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useState, useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { ProfileBadge } from "./ProfileBadge";
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
                   onJumpQuiz,
                   onJumpBrowse,
                   onJumpWatchlist,
                   onOpenSearch,
                   onCloseSearch,
                   onOpenProfileGate,
                   hasWatchlist,
                 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const navRef = useRef(null);

  const items = [
    { id: "home", label: "Home", icon: "Home", onSelect: onJumpHome },
    { id: "search", label: "Search", icon: "Search", onSelect: onOpenSearch },
    { id: "movies", label: "Movies", icon: "Film", onSelect: onJumpBrowse },
    { id: "entertainment", label: "Entertainment", icon: "Flame", onSelect: onJumpTrending },
    { id: "anime", label: "Anime", icon: "Sparkles", onSelect: onJumpQuiz },
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

  // Mobile drawer: Escape closes it and the page behind it stops scrolling.
  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);


  function handleNavSelect(item) {
    item.onSelect();
    setMobileOpen(false);
    onCloseSearch?.();      // ← ADD THIS — closes the search panel
  }


  // The rail is rendered twice (desktop fixed + mobile drawer) with an
  // `expanded` flag driving every reveal/width class.
  function renderRail({ expanded }) {
    return (
      <aside
        ref={navRef}
        className={cn(
          "flex h-full flex-col border-r border-white/10 bg-zinc-950/95 backdrop-blur-xl transition-[width] duration-300 ease-out",
          expanded ? "w-64 max-w-[85vw] shadow-2xl shadow-black/60" : "w-20"
        )}
        aria-label="Main navigation"
        aria-expanded={expanded}
      >
        {/* Logo */}
        <div data-sidebar-block="" className="flex items-center px-4 py-5">
          <span className="grid w-12 shrink-0 place-items-center">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-fuchsia-500 shadow-lg shadow-rose-500/30">
              <Icon name="Film" className="h-5 w-5 text-white" />
            </span>
          </span>
          <Reveal expanded={expanded}>
            <span className="pl-1 text-lg font-black tracking-tight text-white">CINEPICK</span>
          </Reveal>
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
              data-nav-item=""
              onClick={() => handleNavSelect(item)}
              className={cn(
                "group flex w-full items-center rounded-lg py-3 text-left text-sm font-medium md:py-2.5 text-zinc-300 transition-all hover:bg-white/5 hover:text-white",
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
        className="fixed left-3 top-3 z-40 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-zinc-950/80 text-white shadow-lg shadow-black/40 backdrop-blur md:hidden"
        style={{
          marginTop: "env(safe-area-inset-top)",
          marginLeft: "env(safe-area-inset-left)",
        }}
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
          <div className="animate-slide-in-left absolute left-0 top-0 h-[100dvh] max-w-[85vw]">
            {renderRail({ expanded: true })}
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-2 top-3 grid h-10 w-10 place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              <Icon name="X" className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export { Sidebar };
