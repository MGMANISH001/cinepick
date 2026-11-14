// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useMemo, useCallback, useSyncExternalStore } from "react";

// ============================================================
// CINEPICK — persistent client-side state (profiles + watchlist)
//
// Ported from src/hooks/useProfile.ts and src/hooks/useWatchlist.ts.
// Both use React 18's useSyncExternalStore + localStorage, so state
// survives reloads and stays in sync across browser tabs — with zero
// backend and zero state-management libraries.
// ============================================================

/* ----------------------------------------------------------------
 * Profiles — "Who's watching?" gate (Netflix-style profile switcher)
 * ---------------------------------------------------------------- */

const PROFILE_STORAGE_KEY = "cinepick:profiles";
const PROFILE_ACTIVE_KEY = "cinepick:active-profile";

const DEFAULT_PROFILES = [
  { id: "p1", name: "Alex", color: "#e11d48" },
  { id: "p2", name: "Sam", color: "#7c3aed" },
  { id: "p3", name: "Jordan", color: "#0ea5e9" },
];

// Avatar color palette for the "Add profile" picker.
const PROFILE_COLORS = [
  "#e11d48", // rose
  "#7c3aed", // violet
  "#0ea5e9", // sky
  "#16a34a", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

// Initials helper for avatar rendering.
function profileInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Module-level caches so getSnapshot returns a stable reference between
// renders (useSyncExternalStore requires referential stability).
let profilesCache = null;
let activeCache = null;
const storeListeners = new Set();

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function readProfiles() {
  const stored = safeParse(
    window.localStorage.getItem(PROFILE_STORAGE_KEY),
    DEFAULT_PROFILES
  );
  if (!Array.isArray(stored) || stored.length === 0) return DEFAULT_PROFILES;
  return stored;
}

function readActive() {
  return window.localStorage.getItem(PROFILE_ACTIVE_KEY);
}

function writeProfiles(list) {
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota errors
  }
}

function writeActive(id) {
  try {
    if (id === null) window.localStorage.removeItem(PROFILE_ACTIVE_KEY);
    else window.localStorage.setItem(PROFILE_ACTIVE_KEY, id);
  } catch {
    // ignore
  }
}

function getProfilesSnapshot() {
  if (profilesCache === null) profilesCache = readProfiles();
  return profilesCache;
}

function getActiveSnapshot() {
  if (activeCache === null) activeCache = readActive();
  return activeCache ?? "";
}

function emitStoreChange() {
  for (const l of storeListeners) l();
}

function subscribeProfiles(callback) {
  storeListeners.add(callback);
  const handler = (e) => {
    if (e.key === PROFILE_STORAGE_KEY) {
      profilesCache = readProfiles();
      callback();
    }
  };
  window.addEventListener("storage", handler);
  return () => {
    storeListeners.delete(callback);
    window.removeEventListener("storage", handler);
  };
}

function subscribeActive(callback) {
  storeListeners.add(callback);
  const handler = (e) => {
    if (e.key === PROFILE_ACTIVE_KEY) {
      activeCache = readActive();
      callback();
    }
  };
  window.addEventListener("storage", handler);
  return () => {
    storeListeners.delete(callback);
    window.removeEventListener("storage", handler);
  };
}

function useProfile() {
  const profiles = useSyncExternalStore(
    subscribeProfiles,
    getProfilesSnapshot
  );
  const activeId = useSyncExternalStore(subscribeActive, getActiveSnapshot);

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeId) ?? null,
    [profiles, activeId]
  );

  const setActive = useCallback((id) => {
    activeCache = id;
    writeActive(id);
    emitStoreChange();
  }, []);

  const addProfile = useCallback((name, color) => {
    const id = `p${Date.now()}`;
    const next = [...getProfilesSnapshot(), { id, name, color }];
    profilesCache = next;
    writeProfiles(next);
    activeCache = id;
    writeActive(id);
    emitStoreChange();
  }, []);

  const removeProfile = useCallback((id) => {
    const next = getProfilesSnapshot().filter((p) => p.id !== id);
    profilesCache = next.length > 0 ? next : DEFAULT_PROFILES;
    writeProfiles(profilesCache);
    if (activeCache === id) {
      activeCache = null;
      writeActive(null);
    }
    emitStoreChange();
  }, []);

  const signOut = useCallback(() => {
    activeCache = null;
    writeActive(null);
    emitStoreChange();
  }, []);

  return { profiles, activeProfile, activeId, setActive, addProfile, removeProfile, signOut };
}

/* ----------------------------------------------------------------
 * Watchlist — persisted list of liked movie ids (per browser)
 * ---------------------------------------------------------------- */

const WATCHLIST_KEY = "movie-recs:watchlist";

let watchlistCache = null;
const watchlistListeners = new Set();

function readWatchlist() {
  try {
    const raw = window.localStorage.getItem(WATCHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

function writeWatchlist(ids) {
  try {
    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids));
  } catch {
    // ignore quota / privacy errors silently
  }
}

function getWatchlistSnapshot() {
  if (watchlistCache === null) watchlistCache = readWatchlist();
  return watchlistCache;
}

function emitWatchlistChange() {
  for (const l of watchlistListeners) l();
}

function subscribeWatchlist(callback) {
  watchlistListeners.add(callback);
  const handler = () => {
    watchlistCache = readWatchlist();
    callback();
  };
  window.addEventListener("storage", handler);
  return () => {
    watchlistListeners.delete(callback);
    window.removeEventListener("storage", handler);
  };
}

function useWatchlist() {
  const likedIds = useSyncExternalStore(subscribeWatchlist, getWatchlistSnapshot);

  const toggle = useCallback((id) => {
    const current = getWatchlistSnapshot();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    watchlistCache = next;
    writeWatchlist(next);
    emitWatchlistChange();
  }, []);

  const isLiked = useCallback((id) => getWatchlistSnapshot().includes(id), []);

  const clear = useCallback(() => {
    watchlistCache = [];
    writeWatchlist([]);
    emitWatchlistChange();
  }, []);

  return { likedIds, toggle, isLiked, clear };
}

export { DEFAULT_PROFILES, PROFILE_ACTIVE_KEY, PROFILE_COLORS, PROFILE_STORAGE_KEY, WATCHLIST_KEY, getActiveSnapshot, getProfilesSnapshot, getWatchlistSnapshot, profileInitials, subscribeActive, subscribeProfiles, subscribeWatchlist, useProfile, useWatchlist };
