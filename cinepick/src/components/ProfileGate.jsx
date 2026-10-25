// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useState } from "react";
import { Icon } from "./Icon";
import { ParticleBackground } from "./ParticleBackground";
import { cn } from "../lib/utils";
import { PROFILE_COLORS, profileInitials, useProfile } from "../store/store";

// ============================================================
// CINEPICK — "Who's watching?" entry gate
// Netflix-style profile picker with add/remove profile management.
// Selections persist in localStorage (per browser).
// ============================================================

function ProfileGate({ onSelect }) {
  const { profiles, setActive, addProfile, removeProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  function handleSelect(id) {
    setActive(id);
    onSelect?.();
  }

  function handleCreate(name, color) {
    addProfile(name, color);
    onSelect?.();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <ParticleBackground />
      {/* Aurora glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(50% 40% at 20% 20%, rgba(244,63,94,0.25), transparent 60%), radial-gradient(40% 40% at 80% 30%, rgba(124,58,237,0.25), transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-rose-200 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
            CINEPICK
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Who's watching?
          </h1>
          <p className="mt-3 max-w-md text-sm text-zinc-400">
            Pick a profile to dive in. Each profile keeps its own watchlist and
            recommendations.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:gap-6">
          {profiles.map((p) => (
            <ProfileTile
              key={p.id}
              profile={p}
              onSelect={() => handleSelect(p.id)}
              editing={editing}
              onRemove={() => removeProfile(p.id)}
            />
          ))}

          <button
            onClick={() => setAdding(true)}
            className="group flex flex-col items-center gap-3"
            aria-label="Add a new profile"
          >
            <div className="grid h-24 w-24 place-items-center rounded-2xl border border-dashed border-white/20 bg-white/5 text-white/40 transition-all group-hover:border-rose-400/60 group-hover:bg-rose-500/10 group-hover:text-rose-300 sm:h-32 sm:w-32">
              <Icon name="Plus" className="h-8 w-8" />
            </div>
            <span className="text-sm text-zinc-400 group-hover:text-white">
              Add Profile
            </span>
          </button>
        </div>

        <div className="mt-12">
          <button
            onClick={() => setEditing((e) => !e)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-white/40 hover:text-white"
          >
            <Icon name="Pencil" className="h-3.5 w-3.5" />
            {editing ? "Done" : "Manage Profiles"}
          </button>
        </div>
      </div>

      {adding && (
        <AddProfileModal
          onClose={() => setAdding(false)}
          onCreate={(name, color) => handleCreate(name, color)}
        />
      )}
    </main>
  );
}

function ProfileTile({ profile, onSelect, editing, onRemove }) {
  const initials = profileInitials(profile.name);
  return (
    <div className="group relative flex flex-col items-center gap-3">
      <button
        onClick={onSelect}
        aria-label={`Sign in as ${profile.name}`}
        className="relative block h-24 w-24 overflow-hidden rounded-2xl border-2 border-transparent transition-all hover:border-white sm:h-32 sm:w-32"
        style={{
          background: `linear-gradient(135deg, ${profile.color}, #1c1917)`,
        }}
      >
        {/* Initials */}
        <span className="absolute inset-0 grid place-items-center text-2xl font-black tracking-wider text-white drop-shadow-md sm:text-3xl">
          {initials}
        </span>
        {/* Hover overlay */}
        <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="text-xs font-semibold uppercase tracking-widest text-white">
            Enter
          </span>
        </span>
      </button>
      <span className="text-sm text-zinc-300 transition-colors group-hover:text-white">
        {profile.name}
      </span>

      {editing && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${profile.name} profile`}
          className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/40 transition-transform hover:scale-110"
        >
          <Icon name="Trash2" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function AddProfileModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PROFILE_COLORS[0]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, color);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 className="text-xl font-black tracking-tight text-white">
            Add a profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <Icon name="X" className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-6 flex justify-center">
          <div
            className="grid h-24 w-24 place-items-center rounded-2xl border border-white/10 text-3xl font-black tracking-wider text-white"
            style={{
              background: `linear-gradient(135deg, ${color}, #1c1917)`,
            }}
          >
            {profileInitials(name || "?")}
          </div>
        </div>

        <label
          htmlFor="profile-name"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
        >
          Name
        </label>
        <input
          id="profile-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Riley"
          maxLength={20}
          className="mb-5 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-rose-400/50 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
        />

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Avatar color
        </label>
        <div className="mb-6 flex flex-wrap gap-2">
          {PROFILE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border-2 transition-all",
                color === c ? "border-white" : "border-transparent"
              )}
              style={{ background: c }}
            >
              {color === c && <Icon name="Check" className="h-4 w-4 text-white" />}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className={cn(
            "w-full rounded-full px-5 py-3 text-sm font-semibold transition-all",
            name.trim()
              ? "bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-lg shadow-rose-500/30 hover:scale-[1.02]"
              : "cursor-not-allowed bg-white/5 text-zinc-500"
          )}
        >
          Create Profile
        </button>
      </form>
    </div>
  );
}

export { ProfileGate };
