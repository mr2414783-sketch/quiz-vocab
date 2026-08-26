const CACHE_NAME = "recap-quiz-cache-v10";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./creator.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache each asset individually so one failed file doesn't break install
      return Promise.all(
        ASSETS.map((url) =>
          fetch(url, { cache: "no-store" })
            .then((res) => {
              if (res && res.ok) return cache.put(url, res);
            })
            .catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  // Admin & feedback pages: never intercept/cache — always hit the network directly.
  if(url.includes("admin-1iamt4um1o") || url.includes("masukan-1iamt4um1o")){
    return;
  }
  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then((res) => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

/* ---- Notifikasi lokal: buka/fokuskan tab app saat notifikasi di-tap ----
   (diperkuat: pakai self.registration.scope secara eksplisit & cuma fokus ke
   tab yang memang bagian dari app ini, biar gak nyasar ke tab/origin lain) */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL("./index.html", self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const ownClient = clientsArr.find((c) => c.url.startsWith(self.registration.scope));
      if (ownClient && "focus" in ownClient) return ownClient.focus();
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
