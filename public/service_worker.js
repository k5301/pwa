// const CACHE_NAME = 'sw-cache-example';
// const toCache = [
//   '/',
//   '/index.html',
// ];

// self.addEventListener('install', function(event) {
//   console.log('used to register the service worker');
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then(function(cache) {
//         return cache.addAll(toCache)
//       })
//       .then(self.skipWaiting())
//   )
// })

// self.addEventListener('fetch', function(event) {
//   console.log('used to intercept requests so we can check for the file or data in the cache')
//   event.respondWith(
//     fetch(event.request)
//       .catch(() => {
//         return caches.open(CACHE_NAME)
//           .then((cache) => {
//             return cache.match(event.request)
//           })
//       })
//   )
// })

// self.addEventListener('activate', function(event) {
//   console.log('this event triggers when the service worker activates');
//   event.waitUntil(
//     caches.keys()
//       .then((keyList) => {
//         return Promise.all(keyList.map((key) => {
//           if (key !== CACHE_NAME) {
//             console.log('[ServiceWorker] Removing old cache', key)
//             return caches.delete(key)
//           }
//         }))
//       })
//       .then(() => self.clients.claim())
//   )
// })



self.addEventListener("install", function(event) {
  event.waitUntil(preLoad());
});

var preLoad = function(){
  console.log("Installing web app");
  return caches.open("offline").then(function(cache) {
    console.log("caching index and important routes");
    // return cache.addAll(["/blog/", "/blog", "/", "/contact", "/resume", "/offline.html"]);
    return cache.addAll(["/offline.html"]);
  });
};

self.addEventListener("fetch", function(event) {
  event.respondWith(checkResponse(event.request).catch(function() {
    return returnFromCache(event.request);
  }));
  event.waitUntil(addToCache(event.request));
});

var checkResponse = function(request){
  return new Promise(function(fulfill, reject) {
    fetch(request).then(function(response){
      if(response.status !== 404) {
        fulfill(response);
      } else {
        reject();
      }
    }, reject);
  });
};

var addToCache = function(request){
  return caches.open("offline").then(function (cache) {
    return fetch(request).then(function (response) {
      console.log(response.url + " was cached");
      return cache.put(request, response);
    });
  });
};

var returnFromCache = function(request){
  return caches.open("offline").then(function (cache) {
    return cache.match(request).then(function (matching) {
     if(!matching || matching.status == 404) {
       return cache.match("offline.html");
     } else {
       return matching;
     }
    });
  });
};