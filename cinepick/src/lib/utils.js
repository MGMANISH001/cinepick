// ============================================================
// CINEPICK — tiny class-merge helper
// Equivalent of the original cn() from lib/utils.ts (clsx +
// tailwind-merge). For this project a simple join of truthy
// arguments is enough — no conflicting classes are used.
// ============================================================

function cn() {
  return Array.from(arguments)
    .flat()
    .filter(Boolean)
    .join(" ");
}

export { cn };
