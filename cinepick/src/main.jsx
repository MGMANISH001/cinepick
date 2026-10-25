// ============================================================
// CINEPICK — entry point
// Mounts the <App /> into #root. (In dev this file is transformed
// on the fly by Vite; in production it's bundled by `npm run build`.)
// ============================================================

import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(<App />);
