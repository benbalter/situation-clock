import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/script.ts"),
      name: "SituationClock",
      fileName: "script",
      formats: ["iife"],
    },
    outDir: "assets",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: "script.js",
      },
    },
  },
});
