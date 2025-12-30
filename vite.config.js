import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Слушаем на всех интерфейсах
    port: 5174,
    strictPort: true,
    proxy: {
      // Прокси для Cloudflare Pages Functions в локальной разработке
      "/api/r2/presign": {
        target: "https://toqibox.win", // Используем продакшн endpoint для локальной разработки
        changeOrigin: true,
        secure: true,
      },
    },
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    },
    hmr: {
      host: "localhost" // HMR только для localhost
    }
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  publicDir: "public"
});
