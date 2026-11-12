// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { useState, useRef, useMemo } from "react";
import { ContentRow } from "./components/ContentRow";
import { GenreFilter } from "./components/GenreFilter";
import { HeroCarousel } from "./components/HeroCarousel";
import { Icon } from "./components/Icon";
import { MoodQuiz } from "./components/MoodQuiz";
import { MovieCard } from "./components/MovieCard";
import { MovieModal } from "./components/MovieModal";
import { ProfileGate } from "./components/ProfileGate";
import { Sidebar } from "./components/Sidebar";
import { TopTenRow } from "./components/TopTenRow";
import { ALL_GENRES, MOVIES, getMovieById } from "./data/movies";
import { useStaggerEntrance } from "./hooks/useStaggerEntrance";
import { getRecommendations, getSimilar, getTrending } from "./lib/recommender";
import { useProfile, useWatchlist } from "./store/store";

// ============================================================
// CINEPICK — main application (page composition + bootstrap)
// Port of the original src/app/page.tsx, plus the React 18 mount.
// ============================================================

const BROWSE_PREVIEW_COUNT = 10;

function App() {
  const profile = useProfile();
  const watchlist = useWatchlist();

  const [quizResult, setQuizResult] = useState(null);
  const [browseGenres, setBrowseGenres] = useState([]);
  const [openMovie, setOpenMovie] = useState(null);
  const [profileGateOpen, setProfileGateOpen] = useState(false);
  const [browseExpanded, setBrowseExpanded] = useState(false);

  const heroSlides = useMemo(
    () => [...MOVIES].sort((a, b) => b.rating - a.rating).slice(0, 7),
    []
  );

  const trending = useMemo(() => getTrending(12), []);

  const recommendations = useMemo(() => {
    if (!quizResult && watchlist.likedIds.length === 0) return [];
    const prefs = {
      genres: quizResult?.genres ?? [],
      moods: quizResult?.moods ?? [],
      likedMovieIds: watchlist.likedIds,
    };
    return getRecommendations(prefs, 12);
  }, [quizResult, watchlist.likedIds]);

  const maxRecScore = useMemo(
    () => recommendations.reduce((max, r) => Math.max(max, r.score), 0) || 1,
    [recommendations]
  );

  const browseResults = useMemo(() => {
    return browseGenres.length === 0
      ? MOVIES
      : MOVIES.filter((m) => m.genres.some((g) => browseGenres.includes(g)));
  }, [browseGenres]);

  const browsePreview = browseResults.slice(
    0,
    browseExpanded ? undefined : BROWSE_PREVIEW_COUNT
  );
  const browseTotalMatches = browseResults.length;

  const similarForOpen = useMemo(() => {
    if (!openMovie) return [];
    return getSimilar(openMovie, 6);
  }, [openMovie]);

  const watchlistMovies = useMemo(
    () =>
      watchlist.likedIds
        .map((id) => getMovieById(id))
        .filter(Boolean),
    [watchlist.likedIds]
  );

  const genreRows = useMemo(() => {
    return ALL_GENRES.slice(0, 6).map((g) => ({
      genre: g,
      movies: MOVIES.filter((m) => m.genres.includes(g)),
    }));
  }, []);

  // Section refs for sidebar nav smooth-scrolling.
  const trendingRef = useRef(null);
  const top10Ref = useRef(null);
  const quizRef = useRef(null);
  const browseRef = useRef(null);
  const watchlistRef = useRef(null);
  const genreRowRefs = useRef({});

  function jumpToHome() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function jumpTo(el) {
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function jumpToTrending() {
    jumpTo(trendingRef.current);
  }
  function jumpToTop10() {
    jumpTo(top10Ref.current);
  }
  function jumpToQuiz() {
    jumpTo(quizRef.current);
  }
  function jumpToBrowse() {
    jumpTo(browseRef.current);
  }
  function jumpToWatchlist() {
    jumpTo(watchlistRef.current);
  }
  function jumpToGenreRow(genre) {
    jumpTo(genreRowRefs.current[genre]);
  }

  function handleQuizComplete(result) {
    setQuizResult(result);
    setTimeout(jumpToQuiz, 60);
  }
  function handleQuizReset() {
    setQuizResult(null);
  }

  function toggleGenre(g) {
    setBrowseGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
    setBrowseExpanded(false);
  }

  // === Profile Gate ===
  if (!profile.activeProfile || profileGateOpen) {
    return <ProfileGate onSelect={() => setProfileGateOpen(false)} />;
  }

  const showSeeAll = !browseExpanded && browseTotalMatches > BROWSE_PREVIEW_COUNT;
  const showShowLess = browseExpanded && browseTotalMatches > BROWSE_PREVIEW_COUNT;

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      {/* === SIDEBAR === */}
      <Sidebar
        onJumpHome={jumpToHome}
        onJumpTrending={jumpToTrending}
        onJumpTop10={jumpToTop10}
        onJumpQuiz={jumpToQuiz}
        onJumpBrowse={jumpToBrowse}
        onJumpWatchlist={jumpToWatchlist}
        onJumpGenreRow={jumpToGenreRow}
        onPickFromSearch={(m) => setOpenMovie(m)}
        onOpenProfileGate={() => setProfileGateOpen(true)}
        hasWatchlist={watchlistMovies.length > 0}
      />

      {/* === MAIN CONTENT (padded to clear the COLLAPSED rail on md+ —
           the expanded sidebar panel overlays this padding when hovered) === */}
      <div className="md:pl-20">
        {/* === HERO CAROUSEL === */}
        <HeroCarousel
          slides={heroSlides}
          onPlay={(m) => setOpenMovie(m)}
          onMoreInfo={(m) => setOpenMovie(m)}
          onJumpToQuiz={jumpToQuiz}
        />

        <main className="relative z-10 -mt-8 flex flex-col gap-10 pb-20 sm:-mt-12 sm:gap-16 sm:pb-32">
          {/* === CONTINUE WATCHING === */}
          {watchlistMovies.length > 0 && (
            <ContentRow
              title="Continue Watching"
              subtitle="Pick up where you left off — your saved films."
              badge={
                <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-rose-200">
                  My List
                </span>
              }
            >
              {watchlistMovies.map((m) => (
                <MovieCard
                  key={m.id}
                  movie={m}
                  liked
                  onOpen={setOpenMovie}
                  onToggleLike={watchlist.toggle}
                  variant="compact"
                />
              ))}
            </ContentRow>
          )}

          {/* === TRENDING NOW === */}
          <div ref={trendingRef} className="scroll-mt-8">
            <ContentRow
              title="Trending Now"
              subtitle="What everyone's talking about this week."
              badge={<Icon name="Flame" className="h-4 w-4 text-rose-400" />}
            >
              {trending.slice(0, 12).map((m) => (
                <MovieCard
                  key={m.id}
                  movie={m}
                  liked={watchlist.isLiked(m.id)}
                  onOpen={setOpenMovie}
                  onToggleLike={watchlist.toggle}
                  variant="compact"
                />
              ))}
            </ContentRow>
          </div>

          {/* === TOP 10 === */}
          <div ref={top10Ref} className="scroll-mt-8">
            <TopTenRow
              movies={trending}
              onOpen={setOpenMovie}
              liked={watchlist.isLiked}
              onToggleLike={watchlist.toggle}
            />
          </div>

          {/* === YOUR PICKS === */}
          {recommendations.length > 0 && (
            <ContentRow
              title="Your Picks"
              subtitle={
                quizResult
                  ? `Matched against your mood + genre taste${watchlist.likedIds.length > 0 ? " and watchlist" : ""}.`
                  : "Tuned to the films you've saved."
              }
              badge={
                <span className="rounded-md bg-gradient-to-r from-rose-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                  For You
                </span>
              }
            >
              {recommendations.map((r) => {
                const pct = Math.max(50, Math.round((r.score / maxRecScore) * 100));
                return (
                  <MovieCard
                    key={r.movie.id}
                    movie={r.movie}
                    liked={watchlist.isLiked(r.movie.id)}
                    onOpen={setOpenMovie}
                    onToggleLike={watchlist.toggle}
                    matchPercent={pct}
                    variant="compact"
                    footerExtra={
                      r.reasons.length > 0 ? (
                        <p className="line-clamp-1 text-[10px] text-rose-300/80">
                          {r.reasons[0]}
                        </p>
                      ) : null
                    }
                  />
                );
              })}
            </ContentRow>
          )}

          {/* === GENRE ROWS === */}
          {genreRows.map(({ genre, movies }) => (
            <div
              key={genre}
              ref={(el) => {
                genreRowRefs.current[genre] = el;
              }}
              className="scroll-mt-8"
            >
              <ContentRow
                title={genre}
                subtitle={`${movies.length} films in the ${genre.toLowerCase()} library.`}
                badge={<Icon name="Film" className="h-4 w-4 text-zinc-500" />}
              >
                {movies.map((m) => (
                  <MovieCard
                    key={m.id}
                    movie={m}
                    liked={watchlist.isLiked(m.id)}
                    onOpen={setOpenMovie}
                    onToggleLike={watchlist.toggle}
                    variant="compact"
                  />
                ))}
              </ContentRow>
            </div>
          ))}

          {/* === QUIZ === */}
          <div ref={quizRef} className="scroll-mt-8">
            <MoodQuiz
              initial={quizResult ?? { genres: [], moods: [] }}
              onComplete={handleQuizComplete}
              onReset={handleQuizReset}
            />
          </div>

          {/* === BROWSE === */}
          <section
            ref={browseRef}
            className="mx-auto w-full max-w-7xl scroll-mt-8 px-4 py-8 sm:px-8"
          >
            <SectionHeading
              icon={<Icon name="TrendingUp" className="h-5 w-5" />}
              eyebrow="Browse"
              title="The whole library"
              subtitle="Filter by genre to narrow it down. Use the search in the sidebar to jump to a specific title."
            />
            <div className="mb-6 flex flex-col gap-4 sm:mb-8">
              <GenreFilter
                selected={browseGenres}
                onToggle={toggleGenre}
                onClear={() => {
                  setBrowseGenres([]);
                  setBrowseExpanded(false);
                }}
              />
            </div>

            {browsePreview.length > 0 ? (
              <BrowseGrid
                movies={browsePreview}
                onOpen={setOpenMovie}
                liked={watchlist.isLiked}
                onToggleLike={watchlist.toggle}
              />
            ) : (
              <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-8 text-center text-zinc-400 sm:p-12">
                <p className="text-sm">
                  No films match your filters. Try a different genre combination.
                </p>
              </div>
            )}

            {showSeeAll && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setBrowseExpanded(true)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  See All {browseTotalMatches} Films
                  <Icon name="ChevronDown" className="h-4 w-4" />
                </button>
              </div>
            )}
            {showShowLess && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setBrowseExpanded(false)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  Show Less
                  <Icon name="ChevronUp" className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>

          {/* === WATCHLIST === */}
          {watchlistMovies.length > 0 && (
            <section
              ref={watchlistRef}
              className="mx-auto w-full max-w-7xl scroll-mt-8 px-4 py-8 sm:px-8"
            >
              <SectionHeading
                icon={<Icon name="Heart" className="h-5 w-5" />}
                eyebrow="My List"
                title={`${profile.activeProfile?.name ?? "Your"}'s Watchlist`}
                subtitle="These shape your recommendations. Add or remove films any time — your picks persist across sessions."
              />
              <BrowseGrid
                movies={watchlistMovies}
                onOpen={setOpenMovie}
                liked={watchlist.isLiked}
                onToggleLike={watchlist.toggle}
              />
            </section>
          )}
        </main>

        {/* === FOOTER === */}
        <footer className="mt-auto border-t border-white/10 bg-zinc-950 pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center text-sm text-zinc-500 sm:flex-row sm:px-8 sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-rose-500 to-fuchsia-500">
                <Icon name="Film" className="h-4 w-4 text-white" />
              </div>
              <span className="font-black tracking-tight text-white">CINEPICK</span>
              <span className="text-zinc-600">— a taste-tuned film discovery experience</span>
            </div>
            <p className="max-w-md text-xs sm:max-w-sm sm:text-right">
              Built with plain HTML, Tailwind CSS, React, and anime.js — no build
              step. Profile, watchlist, and recommendations are stored locally in
              your browser only.
            </p>
          </div>
        </footer>
      </div>

      {/* === MODAL === */}
      <MovieModal
        movie={openMovie}
        liked={openMovie ? watchlist.isLiked(openMovie.id) : false}
        onToggleLike={watchlist.toggle}
        similar={similarForOpen}
        onSelectSimilar={(m) => setOpenMovie(m)}
        onOpenChange={(open) => !open && setOpenMovie(null)}
      />
    </div>
  );
}

/* ---------- Internal helpers ---------- */

function SectionHeading({ icon, eyebrow, title, subtitle }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-rose-200">
          {icon}
          {eyebrow}
        </div>
        <h2 className="break-words text-2xl font-black tracking-tight text-white min-[400px]:text-3xl sm:text-4xl">
          {title}
        </h2>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">{subtitle}</p>
      </div>
    </div>
  );
}

function BrowseGrid({ movies, onOpen, liked, onToggleLike }) {
  const ref = useStaggerEntrance({
    selector: "[data-card]",
    stagger: 40,
    deps: [movies.map((m) => m.id).join(",")],
  });
  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5"
    >
      {movies.map((m) => (
        <MovieCard
          key={m.id}
          movie={m}
          liked={liked(m.id)}
          onOpen={onOpen}
          onToggleLike={onToggleLike}
        />
      ))}
    </div>
  );
}

export { App, BROWSE_PREVIEW_COUNT, BrowseGrid, SectionHeading };

export default App;
