// TQ Studio Service Worker
// Минимальная версия для PWA регистрации

self.addEventListener("install", (e) => {
  console.log("[Studio SW] Installing");
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  console.log("[Studio SW] Activating");
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Не кешируем, просто пропускаем для PWA совместимости
});
