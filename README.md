# Search!

- Url: [https://ibrahim-13.github.io/search_bang](https://ibrahim-13.github.io/search_bang/)
- Search Url: [https://ibrahim-13.github.io/search_bang/?q=%s](https://ibrahim-13.github.io/search_bang/?q=%s)

## Deployment Configuration

### Changing the Base URL (Sub-directory)

The app is configured to run under a sub-directory path (default: `/search_bang/`). If you deploy to a different path or to the root of a domain, update **three places**:

**1. `index.html` — `<base>` tag (line 5)**

```html
<base href="/search_bang/" />
```

This controls how the browser resolves all relative URLs for assets, the manifest, and the service worker. Change `/search_bang/` to your new path (always keep the trailing slash), or remove the tag entirely if deploying to the domain root.

**2. `index.html` — Service worker registration (inside the `<script>` block)**

```js
navigator.serviceWorker.register('/search_bang/sw.js', { scope: "/search_bang/" })
```

Both the path to `sw.js` and the `scope` value must match your new base path. Example for root deployment:

```js
navigator.serviceWorker.register('/sw.js', { scope: "/" })
```

**3. `assets/script.js` — `BASE_URL` constant (line 1)**

```js
const BASE_URL = '/search_bang';
```

This is used to construct absolute asset paths (e.g., for the copy-button icon swap). Change it to your new base path **without** a trailing slash. For root deployment use an empty string `''`.

---

### Service Worker: Adding or Removing Files

The service worker (`sw.js`) caches a static list of files for offline use. Whenever you **add or remove a file** that should be served offline, you must update two things in `sw.js`:

**1. Update the `cache.addAll` file list**

```js
return cache.addAll([
  './',
  './assets/script.js',
  './assets/styles.css',
  './assets/clipboard-check.svg',
  './assets/clipboard.svg',
  './assets/search.svg',
]);
```

- Add any new file paths you want cached.
- Remove entries for deleted files (a missing file will cause the entire `install` event to fail).

**2. Bump the `CACHE_NAME` version**

```js
const CACHE_NAME = `search-bang-v8.1`;
```

Increment the version string (e.g. `v8.1` → `v8.2`) every time you change the file list. The `activate` event deletes any cache whose name is not in `cacheAllowList`, so bumping the version forces the old cache to be discarded and the new file list to be fetched and cached fresh on the next visit.

After deploying changes to `sw.js`, you can force the running service worker to update immediately by clicking the **Trigger SW Update** button on the app's settings page.

---

## Resources

- [Progressive Web Apps](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/)
- [A service worker's life](https://developer.chrome.com/docs/workbox/service-worker-lifecycle)
- [Unduck - Repository](https://github.com/t3dotgg/unduck)
- [Unduck - Dark Mode](https://github.com/irsyadpage/unduck/tree/dark-mode)
