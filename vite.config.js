import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import unusedCode from "vite-plugin-unused-code";

import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    unusedCode({
      patterns: ["src/**/*.*", "!src/**/*.bak"],
      detectUnusedExport: false,
    }),
  ],
  test: {
    globals: true,
    environment: "happy-dom",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@config": path.resolve(__dirname, "./config"),
    },
  },
});
