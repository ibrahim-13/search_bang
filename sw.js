const CACHE_NAME = `search-bang-v7`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
    // Add all the assets in the array to the 'CACHE_NAME'
    // `Cache` instance for later use.
    return cache.addAll([
      '/search_bang/',
      '/search_bang/assets/script.js',
      '/search_bang/assets/styles.css',
      '/search_bang/assets/clipboard-check.svg',
      '/search_bang/assets/clipboard.svg',
      '/search_bang/assets/search.svg',
    ]);
  }));
});

self.addEventListener('activate', (event) => {
  // Specify allowed cache keys
  const cacheAllowList = [ CACHE_NAME ];

  // Get all the currently active `Cache` instances.
  event.waitUntil(caches.keys().then((keys) => {
    // Delete all caches that aren't in the allow list:
    return Promise.all(keys.map((key) => {
      if (!cacheAllowList.includes(key)) {
        return caches.delete(key);
      }
    }));
  }));
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Get the resource from the cache.
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    } else {
        try {
          // If the resource was not in the cache, try the network.
          const fetchResponse = await fetch(event.request);

          // Save the resource in the cache and return it.
          // cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        } catch (e) {
          // The network failed.
        }
    }
  })());
});