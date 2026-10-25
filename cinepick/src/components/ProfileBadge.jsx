// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useState, useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { cn } from "../lib/utils";
import { profileInitials, useProfile } from "../store/store";

// ============================================================
// CINEPICK — profile dropdown badge (bottom of the sidebar)
// Switch profiles, jump to the gate to add one, or switch user.
// ============================================================

function ProfileBadge({ onOpenAdd, onManage, compact = false }) {
  const { profiles, activeProfile, setActive, signOut } = useProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!activeProfile) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Profile: ${activeProfile.name}`}
        className={cn(
          "group border border-white/10 bg-white/5 text-sm font-medium text-white transition-colors hover:bg-white/10",
          compact
            ? "grid h-10 w-12 place-items-center rounded-full"
            : "flex items-center gap-2 rounded-full py-1 pl-1 pr-3"
        )}
      >
        <AvatarChip profile={activeProfile} />
        {!compact && <span className="hidden sm:inline">{activeProfile.name}</span>}
        {!compact && (
          <Icon
            name="ChevronDown"
            className={cn("h-3.5 w-3.5 text-zinc-400 transition-transform", open && "rotate-180")}
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 top-auto z-50 mb-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl"
        >
          <div className="px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            Switch profile
          </div>
          <div className="max-h-72 overflow-y-auto px-2 pb-2">
            {profiles.map((p) => (
              <button
                key={p.id}
                role="menuitem"
                onClick={() => {
                  setActive(p.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                  p.id === activeProfile.id
                    ? "bg-white/10 text-white"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <AvatarChip profile={p} small />
                <span className="flex-1 truncate">{p.name}</span>
                {p.id === activeProfile.id && (
                  <Icon name="UserCheck" className="h-4 w-4 text-rose-400" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 px-2 py-2">
            <button
              role="menuitem"
              onClick={() => {
                onOpenAdd();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full border border-dashed border-white/20 text-white/50">
                <Icon name="Plus" className="h-4 w-4" />
              </span>
              Add Profile
            </button>
            <button
              role="menuitem"
              onClick={() => {
                signOut();
                onManage();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/5 text-white/70">
                <Icon name="RotateCcw" className="h-3.5 w-3.5" />
              </span>
              Switch User
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AvatarChip({ profile, small }) {
  const size = small ? "h-8 w-8 text-xs" : "h-8 w-8 text-xs sm:h-7 sm:w-7";
  return (
    <span
      className={cn(
        "grid place-items-center rounded-full border border-white/10 font-black tracking-wider text-white",
        size
      )}
      style={{
        background: `linear-gradient(135deg, ${profile.color}, #1c1917)`,
      }}
      aria-hidden="true"
    >
      {profileInitials(profile.name)}
    </span>
  );
}

export { ProfileBadge };
