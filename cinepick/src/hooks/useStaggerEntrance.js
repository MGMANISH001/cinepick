// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useEffect, useRef } from "react";
import anime from "animejs";

// ============================================================
// CINEPICK — shared animation hooks (anime.js)
//
// Ported from src/components/movies/ParticleBackground.tsx
// (the hook lived there in the original project).
// ============================================================

// Stagger-fade-in a list/grid of elements after they mount (and again
// whenever `deps` change). Attach the returned ref to the container and
// tag the animated children with the selector (default: [data-card]).
function useStaggerEntrance(opts) {
  const {
    delay = 0,
    stagger = 60,
    duration = 600,
    y = 24,
    selector = "[data-card]",
    deps = [],
  } = opts ?? {};

  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const targets = node.querySelectorAll(selector);
    if (!targets.length) return;
    anime({
      targets: Array.from(targets),
      opacity: [0, 1],
      translateY: [y, 0],
      duration,
      delay: anime.stagger(stagger, { start: delay }),
      easing: "easeOutCubic",
    });
  }, deps);

  return ref;
}

export { useStaggerEntrance };
