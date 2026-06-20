const CACHE = 'the40pct-v2'

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.add('/')))
    self.skipWaiting()
})

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    )
    self.clients.claim()
})

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return

    const url = new URL(e.request.url)

    // Network-first for the HTML shell so new deployments are picked up immediately
    if (url.pathname === '/' || url.pathname.endsWith('.html')) {
        e.respondWith(
            fetch(e.request)
                .then((response) => {
                    caches.open(CACHE).then((c) => c.put(e.request, response.clone()))
                    return response
                })
                .catch(() => caches.match(e.request))
        )
        return
    }

    // Cache-first for hashed assets (JS/CSS filenames change on each deploy)
    e.respondWith(
        caches.match(e.request).then(
            (cached) => cached || fetch(e.request).then((response) => {
                caches.open(CACHE).then((c) => c.put(e.request, response.clone()))
                return response
            })
        )
    )
})
