import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "apple-touch-icon.png",
        "web-app-manifest-192x192.png",
        "web-app-manifest-512x512.png"
      ],
      manifest: {
        name: "TOQIBOX",
        short_name: "TOQIbox",
        description: "Официальные страницы музыкальных треков и артистов",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#07080b",
        theme_color: "#07080b",
        orientation: "any",
        icons: [
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.toqibox\.win\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "toqibox-images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 дней
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 минут
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/toqibox\.win\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "toqibox-api",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 минут
              },
              networkTimeoutSeconds: 10
            }
          }
        ],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//]
      },
      devOptions: {
        enabled: false // Отключаем в dev режиме для избежания конфликтов
      }
    })
  ],
  server: {
    host: "0.0.0.0", // Слушаем на всех интерфейсах
    port: 5174,
    strictPort: true,
    proxy: {
      // Прокси для Cloudflare Pages Functions в локальной разработке
      // ВРЕМЕННО ОТКЛЮЧЕНО для локального тестирования studio_photo
      // Для studio_photo в dev режиме используется локальное превью (URL.createObjectURL)
      // "/api/r2/presign": {
      //   target: "https://toqibox.win",
      //   changeOrigin: true,
      //   secure: true,
      //   onError: (err, req, res) => {
      //     console.warn('⚠️ Прокси недоступен, используем локальную заглушку');
      //   },
      // },
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
