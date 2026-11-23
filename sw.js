const CACHE_STATIC_NAME = "camara-static-v1";
const STATIC_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cacheOpen) => {
      return cacheOpen.addAll(STATIC_FILES);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cachesNames) => {
      return Promise.all(
        cachesNames.map((nameCache) => {
          if (nameCache !== CACHE_STATIC_NAME) {
            return caches.delete(nameCache);
          }
        }),
      );
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((respCache) => {
      if (respCache) {
        return respCache;
      }
      return fetch(event.request);
    }),
  );
});
