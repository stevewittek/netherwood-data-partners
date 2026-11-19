import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  root: "pages-site",
  base: "/",
  publicDir: "../public",
  plugins: [react()],
  server: { fs: { deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/.private-chatbot/**", "**/backend/**"] } },
  build: {
    outDir: "../pages-dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve("pages-site/index.html"),
        about: resolve("pages-site/about/index.html"),
      },
    },
  },
});
