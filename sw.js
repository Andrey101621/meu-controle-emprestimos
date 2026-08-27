const CACHE_NAME = "meu-controle-emprestimos-v2.1.0";

const ARQUIVOS = [
    "./",
    "./index.html",
    "./manifest.json"
];


/* =========================================================
   INSTALAÇÃO
========================================================= */

self.addEventListener("install", event => {

    /*
       Força a nova versão a assumir imediatamente
       o controle.
    */

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(ARQUIVOS);

            })

    );

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

                /*
                   A nova versão assume imediatamente
                   todas as páginas abertas.
                */

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

    /*
       Apenas requisições GET.
    */

    if(request.method !== "GET"){

        return;

    }

    /*
       Para index.html, manifest e sw.js,
       sempre tenta buscar a versão mais recente
       na internet.
    */

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


    /*
       Para os demais arquivos:
       tenta rede primeiro e usa cache
       se estiver sem internet.
    */

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
