// (Vite ESM port — imports injected by scripts/port_to_vite.py)

import { MOVIES, getMovieById } from "../data/movies";

// ============================================================
// CINEPICK — recommendation engine (pure functions, no React)
//
// Ported 1:1 from the original src/lib/recommender.ts. Scores every
// movie against user preferences (mood quiz + watchlist) and finds
// similar movies to a given seed.
// ============================================================

// Compute a similarity score for a candidate movie against a seed movie.
// Used by "Because you liked X" and watchlist-driven recommendations.
function similarToSeed(seed, candidate) {
  if (seed.id === candidate.id) {
    return { movie: candidate, score: 0, reasons: [] };
  }

  let score = 0;
  const reasons = [];

  // Shared genres — strongest signal.
  const sharedGenres = candidate.genres.filter((g) => seed.genres.includes(g));
  score += sharedGenres.length * 30;
  if (sharedGenres.length > 0) {
    reasons.push(
      `Shares ${sharedGenres.length} genre${sharedGenres.length > 1 ? "s" : ""} (${sharedGenres.join(", ")})`
    );
  }

  // Shared moods — second strongest.
  const sharedMoods = candidate.moods.filter((m) => seed.moods.includes(m));
  score += sharedMoods.length * 20;
  if (sharedMoods.length > 0) {
    reasons.push(`Matches your taste for ${sharedMoods.join(", ").toLowerCase()} films`);
  }

  // Shared cast (capped so two films from the same ensemble don't dominate).
  const sharedCast = candidate.cast.filter((c) => seed.cast.includes(c)).slice(0, 2);
  score += sharedCast.length * 15;
  if (sharedCast.length > 0) {
    reasons.push(`Features ${sharedCast.join(" & ")}`);
  }

  // Same director — a strong auteur signal.
  if (candidate.director === seed.director) {
    score += 12;
    reasons.push(`Directed by ${candidate.director}`);
  }

  // Rating proximity — quality usually begets quality.
  const ratingDiff = Math.abs(candidate.rating - seed.rating);
  if (ratingDiff <= 0.5) {
    score += 8;
    reasons.push("Loved by audiences as much as your pick");
  } else if (ratingDiff <= 1) {
    score += 3;
  }

  // Year proximity — taste usually clusters in eras.
  const yearDiff = Math.abs(candidate.year - seed.year);
  if (yearDiff <= 5) score += 6;
  else if (yearDiff <= 10) score += 3;
  else score -= Math.min(5, Math.floor((yearDiff - 10) / 10));

  return { movie: candidate, score, reasons };
}

// Score a movie against a user's selected genres/moods (the quiz result).
function scoreAgainstPrefs(movie, prefs) {
  let score = 0;
  const reasons = [];

  // Mood matches weigh highest — they capture how a movie feels, which
  // matters more for recommendations than genre labels.
  const moodMatches = movie.moods.filter((m) => prefs.moods.includes(m));
  score += moodMatches.length * 25;
  if (moodMatches.length > 0) {
    reasons.push(`Feels ${moodMatches.map((m) => m.toLowerCase()).join(", ")}`);
  }

  // Genre matches.
  const genreMatches = movie.genres.filter((g) => prefs.genres.includes(g));
  score += genreMatches.length * 18;
  if (genreMatches.length > 0) {
    reasons.push(`${genreMatches.join("/")} you love`);
  }

  // If the user has saved movies, boost movies similar to those.
  let bestSeedId = null;
  let bestSeedScore = 0;
  for (const likedId of prefs.likedMovieIds) {
    const seed = getMovieById(likedId);
    if (!seed) continue;
    const sim = similarToSeed(seed, movie);
    if (sim.score > bestSeedScore) {
      bestSeedScore = sim.score;
      bestSeedId = likedId;
    }
  }
  if (bestSeedScore > 0) {
    score += Math.floor(bestSeedScore * 0.6);
    if (bestSeedId) {
      const seed = getMovieById(bestSeedId);
      if (seed) reasons.push(`Similar to "${seed.title}" you saved`);
    }
  }

  // Rating baseline — highly rated movies get a small lift even without prefs.
  score += Math.max(0, (movie.rating - 6) * 4);

  return { movie, score, reasons };
}

// Top-N recommendations for a user, sorted by score.
function getRecommendations(prefs, limit = 12) {
  return MOVIES
    .map((m) => scoreAgainstPrefs(m, prefs))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Top-N movies most similar to a seed movie.
function getSimilar(seed, limit = 6) {
  return MOVIES
    .map((m) => similarToSeed(seed, m))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Free-text search — TITLE ONLY.
// Why title-only: searching plot/director/cast surfaced too many tangential
// matches (e.g. "comedy" returned every film whose plot mentions humor).
function searchMovies(query) {
  const q = query.trim().toLowerCase();
  if (!q) return MOVIES;
  return MOVIES.filter((m) => m.title.toLowerCase().includes(q));
}

// Top-N title matches sorted by rating (for the search dropdown).
function searchTitlesByPrefix(query, limit = 6) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return MOVIES.filter((m) => m.title.toLowerCase().includes(q))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

// Trending = highest rated (a simple heuristic for this dataset).
function getTrending(limit = 10) {
  return [...MOVIES].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export { getRecommendations, getSimilar, getTrending, scoreAgainstPrefs, searchMovies, searchTitlesByPrefix, similarToSeed };
