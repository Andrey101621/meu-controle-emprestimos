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

    /*
       Faz a nova versão assumir imediatamente
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
                   Assume imediatamente o controle
                   de todas as páginas abertas.
                */

                return self.clients.claim();

            })
            .then(() => {

                /*
                   Informa às páginas abertas que
                   uma nova versão foi ativada.
                */

                return self.clients.matchAll({
                    type: "window",
                    includeUncontrolled: true
                });

            })
            .then(clients => {

                clients.forEach(client => {

                    client.postMessage({
                        type: "NOVA_VERSAO_ATIVADA"
                    });

                });

            })

    );

});


/* =========================================================
   BUSCA DE ARQUIVOS
========================================================= */

self.addEventListener("fetch", event => {

    const request = event.request;

    /*
       Apenas requisições GET.
    */

    if (request.method !== "GET") {

        return;

    }

    const url = new URL(request.url);

    /*
       Arquivos principais do aplicativo.
       Sempre tenta buscar a versão mais recente
       na internet.
    */

    const ehArquivoPrincipal =
        url.pathname.endsWith("/index.html") ||
        url.pathname.endsWith("/manifest.json") ||
        url.pathname.endsWith("/sw.js");

    if (ehArquivoPrincipal) {

        event.respondWith(

            fetch(request, {
                cache: "no-store"
            })

            .then(response => {

                if (response && response.ok) {

                    const clone = response.clone();

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
       tenta a internet primeiro.

       Se não houver internet,
       utiliza o cache.
    */

    event.respondWith(

        fetch(request)

            .then(response => {

                if (response && response.ok) {

                    const clone = response.clone();

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
