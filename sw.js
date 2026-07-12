var PROXY = 'https://small-poetry-287c.f3baba06.workers.dev/?url=';

self.addEventListener('install', function() { self.skipWaiting(); });
self.addEventListener('activate', function(e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  if (url.indexOf('http://') !== 0) return;

  e.respondWith(
    fetch(PROXY + encodeURIComponent(url)).then(function(resp) {
      var ct = resp.headers.get('Content-Type') || '';
      var isM3u8 = url.indexOf('.m3u8') > -1 || ct.indexOf('mpegurl') > -1 || ct.indexOf('m3u8') > -1;
      if (!isM3u8) return resp;

      return resp.text().then(function(text) {
        var base = url.replace(/\/[^\/]*$/, '/');
        var lines = text.split('\n');
        var out = [];
        for (var i = 0; i < lines.length; i++) {
          var l = lines[i], t = l.trim();
          if (!t || t.charAt(0) === '#') { out.push(l); continue; }
          var abs;
          if (t.indexOf('http://') === 0 || t.indexOf('https://') === 0) abs = t;
          else if (t.indexOf('data:') === 0) { out.push(l); continue; }
          else abs = base + t;
          out.push(abs.indexOf('http://') === 0 ? PROXY + encodeURIComponent(abs) : abs);
        }
        return new Response(out.join('\n'), {
          status: resp.status,
          headers: { 'Content-Type': 'application/x-mpegurl', 'Access-Control-Allow-Origin': '*' }
        });
      });
    }).catch(function() { return new Response('Error', { status: 502 }); })
  );
});
