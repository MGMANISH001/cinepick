# CINEPICK — Find your next favorite film 🎬

A taste-tuned movie recommendation engine built with **React + Tailwind CSS + JavaScript + anime.js**, powered by **Vite** — the standard `npm run dev` workflow, just like any modern portfolio project.

> Ported 1:1 from the original Next.js version. Same UI, same features, same recommendation engine — now with a proper dev server, HMR, and production builds.

---

## ⚡ Quick start

> Requires **Node.js 18+** (you already have it if `npm -v` works).

```bash
npm install     # one time only — installs React, Vite, Tailwind, anime.js…
npm run dev     # starts the dev server → http://localhost:5173
```

That's it. The dev server opens on **http://localhost:5173** with **Hot Module Replacement** — edit any file and the browser updates instantly, without losing state.

## 📜 Scripts

| Command           | What it does                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `npm run dev`     | Start the dev server with HMR at `http://localhost:5173`            |
| `npm run build`   | Production build → outputs static files to `dist/`                  |
| `npm run preview` | Serve the production build locally to check it before deploying     |

**Deploying:** run `npm run build` and upload the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages…). No server code needed — it's a pure frontend app.

## 🗂 Project structure

```
cinepick/
├── index.html                    ← Vite entry HTML (loads src/main.jsx)
├── package.json                  ← scripts + dependencies
├── vite.config.js                ← Vite + React plugin
├── tailwind.config.js            ← Tailwind scans index.html + src/**
├── postcss.config.js
└── src/
    ├── main.jsx                  ← React bootstrap (createRoot → <App/>)
    ├── index.css                 ← Tailwind directives + custom animations
    ├── App.jsx                   ← page composition (all views + state)
    ├── components/               ← 13 React components
    │   ├── Icon.jsx              ← <Icon name="Play"/> via lucide-react
    │   ├── ProfileGate.jsx       ← "Who's watching?" screen
    │   ├── Sidebar.jsx           ← nav + live search
    │   ├── HeroCarousel.jsx      ← auto-rotating hero (anime.js)
    │   ├── ContentRow.jsx        ← horizontal scroll rows
    │   ├── TopTenRow.jsx         ← Top 10 with giant rank numbers
    │   ├── MovieCard.jsx         ← grid + compact variants
    │   ├── MoviePoster.jsx       ← poster + gradient fallback
    │   ├── MovieModal.jsx        ← detail dialog
    │   ├── MoodQuiz.jsx          ← 3-step taste quiz
    │   ├── GenreFilter.jsx       ← browse filter chips
    │   ├── ProfileBadge.jsx      ← profile switcher dropdown
    │   └── ParticleBackground.jsx← canvas particle field
    ├── data/movies.js            ← 50 curated films (genres, moods, cast…)
    ├── lib/recommender.js        ← the taste-matching scoring engine ⭐
    ├── store/store.js            ← profiles + watchlist (localStorage)
    ├── hooks/useStaggerEntrance.js ← anime.js entrance animations
    └── lib/utils.js              ← cn() class helper
```

## ✨ Features

- **"Who's watching?" profile gate** — 4 default profiles + add/remove, persisted in `localStorage`
- **Hotstar-style sidebar** — live search suggestions, category shortcuts, profile switcher, mobile drawer
- **Auto-rotating hero carousel** — 7 featured films, Ken Burns backdrop, staggered anime.js entrances
- **Content rows** — Trending Now, per-genre rows, Top 10 Today with giant outlined ranks
- **3-step Mood Quiz** — mood → genre → review, with progress bar
- **Recommendation engine** — scores all 50 films against your moods/genres + watchlist; surfaces top 12 with match-% and a "why" line
- **Movie detail modal** — plot, cast, metadata chips, "Because you like X" similar grid
- **Watchlist** — persists across reloads and reshapes your recommendations

## 🧠 How the recommendation engine works

```
score(movie) =
      25 × (mood matches with your quiz answers)
    + 18 × (genre matches)
    + 0.6 × (best similarity to any film you saved)   ← "Similar to X you saved"
    + small boosts for rating / shared cast / director / era
```

Film similarity uses shared genres (×30), shared moods (×20), shared cast (×15), same director (+12), plus rating and year proximity. Top 12 non-zero scores become your **Your Picks** row.

## 🛠 Tech notes

- **Vite** — instant dev server (~160ms startup), HMR, optimized production builds
- **React 18** with `useSyncExternalStore` for the localStorage-backed store — zero state libraries
- **Tailwind CSS 3** compiled at build time (proper PostCSS pipeline, tree-shaken CSS)
- **lucide-react** for icons (the same set the original design used)
- **anime.js 3** for hero, card entrances and micro-animations
- The bundle is ~936 kB minified because the `<Icon>` wrapper imports the whole lucide icon map — fine for a demo; swap to per-icon imports if you want to slim it down.
