const CACHE_NAME = "apples-bananas-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add("index.html");
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      const indexUrl = self.registration.scope + "index.html";
      return cache.match(event.request)
        .then((cached) => cached || cache.match(indexUrl))
        .then((cached) => cached || fetch(event.request));
    })
  );
});
