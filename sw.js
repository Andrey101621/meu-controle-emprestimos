const CACHE_NAME = "meu-controle-emprestimos-v4";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(
          cache =>
            cache.addAll(
              ARQUIVOS
            )
        )
        .then(
          () =>
            self.skipWaiting()
        )

    );

  }
);


self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()
        .then(
          cachesExistentes =>

            Promise.all(

              cachesExistentes
                .filter(
                  cache =>
                    cache !==
                    CACHE_NAME
                )
                .map(
                  cache =>
                    caches.delete(
                      cache
                    )
                )

            )

        )
        .then(
          () =>
            self.clients.claim()
        )

    );

  }
);


self.addEventListener(
  "fetch",
  event => {

    if (
      event.request.method !==
      "GET"
    ) {

      return;

    }


    event.respondWith(

      fetch(
        event.request
      )
      .then(
        resposta => {

          const copia =
            resposta.clone();


          caches
            .open(
              CACHE_NAME
            )
            .then(
              cache =>
                cache.put(
                  event.request,
                  copia
                )
            );


          return resposta;

        }
      )
      .catch(
        () =>
          caches.match(
            event.request
          )
      )

    );

  }
);
