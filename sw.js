// Gamache Apps service worker: lets the app install and run offline.
// Change VERSION whenever you upload new files so everyone gets the update.
const VERSION = 'scene-secure-v10';
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./suspectsprelude.html",
  "./foursuspectsprelude.html",
  "./Warehouse.html",
  "./tallbuildings.html",
  "./highrise.html",
  "./Images/Suspect1.png",
  "./Images/prisonbreak3.jpg",
  "./Images/prisonbreak6.jpg",
  "./Images/Officer1.png",
  "./Images/prisonbreak8.jpg",
  "./Images/Policecar.jpg",
  "./Images/prisonbreak4.jpg",
  "./Images/officerandsuspect1.png",
  "./Images/Suspect2.png",
  "./Images/7suspects.jpg",
  "./Images/suspect3.png",
  "./Images/policecar1.png",
  "./Images/officerandsuspect2.png",
  "./Images/prisonbreak5.jpg",
  "./Images/prisonbreak7.jpg",
  "./Images/4suspectsprelude.jpg",
  "./Images/44magnum2.png",
  "./Images/prisonbreak1.jpg",
  "./Images/prisonbreak2.jpg",
  "./Images/44magnum1.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(VERSION).then(cache =>
      Promise.allSettled(FILES.map(f => cache.add(f)))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Pages: get the newest copy when online, use the saved copy when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() =>
        caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html'))
      )
    );
    return;
  }

  // Everything else: use the saved copy right away and refresh it in the background.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
