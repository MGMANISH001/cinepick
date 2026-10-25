// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useState, useMemo } from "react";
import { Icon } from "./Icon";
import { ALL_GENRES, ALL_MOODS, MOVIES } from "../data/movies";
import { useStaggerEntrance } from "../hooks/useStaggerEntrance";
import { cn } from "../lib/utils";

// ============================================================
// CINEPICK — 3-step mood quiz (mood → genre → review)
// Feeds the taste engine: results drive the "Your Picks" row.
// ============================================================

const QUIZ_STEPS = ["mood", "genre", "review"];

function MoodQuiz({ onComplete, onReset, initial }) {
  const [step, setStep] = useState("mood");
  const [moods, setMoods] = useState(initial.moods);
  const [genres, setGenres] = useState(initial.genres);

  const moodRef = useStaggerEntrance({ selector: "[data-chip]", deps: [step] });

  function toggle(list, set, value) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  function goNext() {
    if (step === "mood") setStep("genre");
    else if (step === "genre") setStep("review");
    else onComplete({ genres, moods });
  }

  function goBack() {
    if (step === "genre") setStep("mood");
    else if (step === "review") setStep("genre");
    else onReset();
  }

  const canProceed = useMemo(() => {
    if (step === "mood") return moods.length > 0;
    if (step === "genre") return genres.length > 0 || moods.length > 0;
    return true;
  }, [step, moods, genres]);

  const progress = step === "mood" ? 33 : step === "genre" ? 66 : 100;

  return (
    <section
      id="quiz"
      className="relative mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-rose-200">
          <Icon name="Sparkles" className="h-3.5 w-3.5" />
          Taste Engine
        </span>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Tell us how you{" "}
          <span className="bg-gradient-to-r from-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
            feel
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400">
          Pick a few moods and genres you love. Our taste-matching engine scores
          every film in the library and surfaces the ones most likely to stick
          with you.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mx-auto mb-8 max-w-md">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-zinc-500">
          <span>
            Step {QUIZ_STEPS.indexOf(step) + 1} of {QUIZ_STEPS.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        ref={moodRef}
        className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur sm:p-10"
      >
        {step === "mood" && (
          <div>
            <h3 className="mb-1 text-xl font-bold text-white">
              What mood are you chasing?
            </h3>
            <p className="mb-6 text-sm text-zinc-400">
              Pick one or more — these describe how you want the film to feel.
            </p>
            <div className="flex flex-wrap gap-3">
              {ALL_MOODS.map((m) => (
                <Chip
                  key={m}
                  active={moods.includes(m)}
                  onClick={() => toggle(moods, setMoods, m)}
                  label={m}
                />
              ))}
            </div>
          </div>
        )}

        {step === "genre" && (
          <div>
            <h3 className="mb-1 text-xl font-bold text-white">
              Which genres pull you in?
            </h3>
            <p className="mb-6 text-sm text-zinc-400">
              Optional — even one is enough, but the more you pick, the sharper
              your results.
            </p>
            <div className="flex flex-wrap gap-3">
              {ALL_GENRES.map((g) => (
                <Chip
                  key={g}
                  active={genres.includes(g)}
                  onClick={() => toggle(genres, setGenres, g)}
                  label={g}
                  variant="genre"
                />
              ))}
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-500 shadow-lg shadow-rose-500/40">
              <Icon name="Heart" className="h-7 w-7 fill-white text-white" />
            </div>
            <h3 className="text-2xl font-black text-white">Ready to roll?</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              We'll score all {MOVIES.length} films in the library against your
              taste profile and surface your best matches.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {moods.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-xs text-zinc-300">
                  <span className="text-zinc-500">Moods:</span> {moods.join(", ")}
                </div>
              )}
              {genres.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-xs text-zinc-300">
                  <span className="text-zinc-500">Genres:</span> {genres.join(", ")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
          >
            <Icon name="RotateCcw" className="h-3.5 w-3.5" />
            {step === "mood" ? "Cancel" : "Back"}
          </button>
          <button
            onClick={goNext}
            disabled={!canProceed}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all",
              canProceed
                ? "bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-lg shadow-rose-500/30 hover:scale-[1.03]"
                : "cursor-not-allowed bg-white/5 text-zinc-500"
            )}
          >
            {step === "review" ? (
              <>
                <Icon name="Sparkles" className="h-4 w-4" /> Get My Picks
              </>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function Chip({ active, onClick, label, variant = "mood" }) {
  return (
    <button
      data-chip
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all",
        !active &&
          "border-white/10 bg-white/5 text-zinc-300 hover:border-white/25 hover:text-white",
        active &&
          "border-transparent bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-lg shadow-rose-500/30"
      )}
    >
      {label}
    </button>
  );
}

export { MoodQuiz };
