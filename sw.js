const CACHE_NAME = "meu-controle-emprestimos-v8";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(cachesExistentes => {
        return Promise.all(
          cachesExistentes
            .filter(cache => cache !== CACHE_NAME)
            .map(cache => caches.delete(cache))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(resposta => {

        const copia = resposta.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, copia);
          });

        return resposta;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener("notificationclick", event => {

  event.notification.close();

  event.waitUntil(

    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    })

    .then(lista => {

      for (const cliente of lista) {

        if ("focus" in cliente) {
          return cliente.focus();
        }

      }

      if (clients.openWindow) {
        return clients.openWindow("./");
      }

    })

  );

});
