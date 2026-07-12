var PROXY = 'https://small-poetry-287c.f3baba06.workers.dev/?url=';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  if (url.indexOf('http://') === 0) {
    e.respondWith(fetch(PROXY + encodeURIComponent(url), {
      method: e.request.method,
      headers: e.request.headers
    }));
  }
});
