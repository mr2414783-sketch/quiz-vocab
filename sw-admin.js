// Service worker KHUSUS panel admin.
// Sengaja file & scope-nya terpisah total dari sw.js (punya peserta),
// supaya browser menganggap ini aplikasi/PWA yang berbeda dan bisa
// di-install terpisah dari aplikasi peserta.
const CACHE_NAME = "recap-quiz-admin-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("recap-quiz-admin-cache-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Selalu ambil langsung dari server (no-store) — admin panel gak butuh
// offline support, yang penting selalu versi terbaru.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request, { cache: "no-store" }).catch(() => caches.match(event.request))
  );
});
