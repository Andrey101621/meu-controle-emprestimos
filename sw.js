const CACHE_NAME = "meu-controle-emprestimos-v2.2.0";

const ARQUIVOS = [
    "./",
    "./index.html",
    "./manifest.json"
];


/* =========================================================
   INSTALAÇÃO
========================================================= */

self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(ARQUIVOS);

            })

    );

});


/* =========================================================
   COMANDO PARA ATUALIZAÇÃO IMEDIATA
========================================================= */

self.addEventListener("message", event => {

    if(
        event.data &&
        event.data.type === "SKIP_WAITING"
    ){

        self.skipWaiting();

    }

});


/* =========================================================
   ATIVAÇÃO
========================================================= */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(key =>
                            key !== CACHE_NAME
                        )
                        .map(key =>
                            caches.delete(key)
                        )

                );

            })
            .then(() => {

                return self.clients.claim();

            })

    );

});


/* =========================================================
   BUSCA DE ARQUIVOS
========================================================= */

self.addEventListener("fetch", event => {

    const request =
        event.request;

    if(request.method !== "GET"){

        return;

    }

    const url =
        new URL(request.url);

    const ehArquivoPrincipal =
        url.pathname.endsWith("/index.html") ||
        url.pathname.endsWith("/manifest.json") ||
        url.pathname.endsWith("/sw.js");

    if(ehArquivoPrincipal){

        event.respondWith(

            fetch(request, {
                cache:"no-store"
            })
            .then(response => {

                if(response && response.ok){

                    const clone =
                        response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                request,
                                clone
                            );

                        });

                }

                return response;

            })
            .catch(() => {

                return caches.match(request);

            })

        );

        return;

    }


    event.respondWith(

        fetch(request)
            .then(response => {

                if(response && response.ok){

                    const clone =
                        response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                request,
                                clone
                            );

                        });

                }

                return response;

            })
            .catch(() => {

                return caches.match(request);

            })

    );

});
