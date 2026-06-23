const CACHE_NAME = "johny-os-lite-v4";
const APP_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/auth.js",
  "/storage.js",
  "/icon.svg",
  "/johny-cat.svg",
  "/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = event.request.url;
  if (url.includes("supabase.co") || url.includes("fonts.googleapis") || url.includes("fonts.gstatic") || url.includes("cdn.jsdelivr")) return;

  const isAppShell = APP_ASSETS.some(a => url.includes(a.replace("/", ""))) || url.endsWith("/");

  if (isAppShell) {
    // Network-first: always try network, update cache, fall back to cache when offline
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
  } else {
    // Cache-first for everything else (fonts, images, etc.)
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true })
        .then((cached) => cached || fetch(event.request))
    );
  }
});
