import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    ssr: "scripts/render-static.tsx",
    outDir: ".static-render",
    emptyOutDir: true,
    target: "node22",
    rollupOptions: { output: { entryFileNames: "render.mjs" } },
  },
});
