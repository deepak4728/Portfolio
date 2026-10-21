import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  // GitHub Pages serves below /Portfolio/; Vercel and local dev use the domain root.
  base: command === "build" && !process.env.VERCEL ? "/Portfolio/" : "/",
}));
