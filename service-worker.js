'use strict';

//********************      BASIC VANILLA SERVICE WORKER      //********************

self.importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js');

// disable console logs
workbox.setConfig({ debug: false });   

// skipWaiting: activate the new version of service worker now, instead of waiting for the next session to do so
self.addEventListener('install', event => { self.skipWaiting() });

// notify when the new updated service worker (this file) gets activated
self.addEventListener('activate', event => { 
    console.debug('service worker activated', event);
});


//********************            LOGGER            //********************

// Logging plugin
const logPlugin = {
    cachedResponseWillBeUsed: async ({ request, cachedResponse }) => {
        if (cachedResponse) {
            console.debug('📦 [CACHE] Cache hit for:', request.url);
        } else {
            console.debug('🕳️ [CACHE] Cache miss for:', request.url);
        }
        return cachedResponse;
    },
    fetchDidSucceed: async ({ request, response }) => {
        console.debug('✅ [LIVE] Network response for:', request.url);
        return response;
    },
    fetchDidFail: async ({ request }) => {
        console.debug('⚠️ [CACHE] Served from cache (network failed):', request.url);
    }
};


//********************            CACHING STRATEGY            //********************

// prefer internet on API calls or JavaScript fetch requests
workbox.routing.registerRoute(
    ({ url, request }) => url.pathname.includes('/api/') || url.hostname.includes('freecurrencyapi.com'),
    new workbox.strategies.NetworkFirst({
        plugins: [logPlugin]
    }),
);

// prefer cache but refresh on everything else (use cache only when offline)
workbox.routing.registerRoute(
    new RegExp('.*'),   // everything
    new workbox.strategies.StaleWhileRevalidate({
        plugins: [logPlugin]
    })
);
