// ============================================================
// CINEPICK — entry point
// Mounts the <App /> into #root. (In dev this file is transformed
// on the fly by Vite; in production it's bundled by `npm run build`.)
// ============================================================

import anime from "animejs";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Honour the OS "reduce motion" setting for every anime.js animation at
// once: a very high global speed makes each tween finish instantly (and
// still land on its end state), so nothing flies in or staggers.
if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
  anime.speed = 1000;
}

createRoot(document.getElementById("root")).render(<App />);
