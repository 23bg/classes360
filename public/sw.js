const CACHE_VERSION = "classes360-pwa-v1";
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;

// Cache only the stable shell assets needed to keep the app usable offline.
const APP_SHELL_URLS = ["/", "/manifest.json", "/pwa-icon.svg", "/pwa-maskable.svg"];

const isSameOrigin = (url) => url.origin === self.location.origin;
const isApiRequest = (url) => url.pathname.startsWith("/api/");
const isHtmlRequest = (request) => {
  const accept = request.headers.get("accept") || "";
  return request.mode === "navigate" || accept.includes("text/html");
};

const fetchAndCache = async (request, cacheName) => {
  const response = await fetch(request);

  // Only cache successful same-origin GET responses so the cache stays useful
  // without persisting error pages or cross-origin responses.
  if (response.ok && request.method === "GET" && isSameOrigin(new URL(request.url))) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }

  return response;
};

const networkFirst = async (request) => {
  const cacheName = isHtmlRequest(request) ? APP_SHELL_CACHE : RUNTIME_CACHE;
  const cache = await caches.open(cacheName);

  try {
    return await fetchAndCache(request, cacheName);
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    if (isHtmlRequest(request)) {
      const fallback = await cache.match("/");
      if (fallback) {
        return fallback;
      }
    }

    throw error;
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS))
  );

  // Activate the new worker immediately so deploys pick up the latest shell.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(
        keys
          .filter((key) => key.startsWith("app-shell-") || key.startsWith("runtime-"))
          .filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache API requests; CRM and admission data must always prefer fresh
  // server responses over possibly stale runtime cache entries.
  if (request.method !== "GET" || !isSameOrigin(url) || isApiRequest(url)) {
    return;
  }

  event.respondWith(networkFirst(request));
});
