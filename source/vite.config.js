import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Inlines all JS/CSS into one self-contained index.html (easy to host anywhere)
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: "./",
});
