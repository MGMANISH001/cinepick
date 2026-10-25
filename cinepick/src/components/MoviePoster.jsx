// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useState } from "react";

// ============================================================
// CINEPICK — movie poster with graceful gradient fallback
// Shows the real poster (default object-contain, letterboxing blends
// into a matching gradient background). Pass fit="cover" for frames
// that must render every artwork at an IDENTICAL size (hero carousel) —
// overflow is cropped instead of letterboxed. If the image fails to
// load, renders a designed gradient poster with the title typeset on top.
// ============================================================

function MoviePoster({ movie, className = "", fit = "contain", eager = false }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const showImage = movie.posterUrl && !imgError;

  const [fromGrad, toGrad] = movie.posterGradient;

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${fromGrad}, ${toGrad})`,
      }}
    >
      {showImage && (
        <img
          src={movie.posterUrl}
          alt={`${movie.title} (${movie.year}) poster`}
          onError={() => setImgError(true)}
          onLoad={() => setImgLoaded(true)}
          loading={eager ? "eager" : "lazy"}
          className={`h-full w-full ${
            fit === "cover" ? "object-cover" : "object-contain"
          } transition-opacity duration-300 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* While the image loads (and it hasn't failed), show a soft spinner */}
      {showImage && !imgLoaded && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-8 w-8 animate-pulse rounded-full border-2 border-white/20 border-t-white/60" />
        </div>
      )}

      {imgError && <GradientFallbackContent movie={movie} />}

      {/* Subtle bottom vignette for legibility under overlay chips */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40"
        aria-hidden="true"
      />
    </div>
  );
}

// Designed fallback poster (only rendered when the image fails).
function GradientFallbackContent({ movie }) {
  const [from, to] = movie.posterGradient;
  const offset = movie.title.charCodeAt(0) % 7;
  const ringHue = (movie.id.charCodeAt(0) * 13) % 360;

  return (
    <>
      <div
        className="absolute inset-0 flex items-center justify-center opacity-10"
        aria-hidden="true"
      >
        <span
          className="select-none font-black uppercase tracking-tight"
          style={{
            fontSize: "12rem",
            lineHeight: 1,
            color: "#ffffff",
            transform: `rotate(${offset - 3}deg)`,
          }}
        >
          {movie.title.charAt(0)}
        </span>
      </div>
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "6px 6px",
        }}
      />
      <div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-2 opacity-20"
        style={{ borderColor: `hsl(${ringHue} 80% 70%)` }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full border opacity-15"
        style={{ borderColor: `hsl(${(ringHue + 120) % 360} 80% 70%)` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <div className="mb-2 h-px w-10 bg-white/40" aria-hidden="true" />
        <h3 className="text-2xl font-black uppercase leading-tight tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
          {movie.title}
        </h3>
        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/60">
          {movie.year} · {movie.duration} min
        </p>
      </div>
    </>
  );
}

export { MoviePoster };
