
var urlToCache = [
  '/',
  '/restaurant.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  '/images/4.jpg',
  '/images/5.jpg',
  '/images/6.jpg',
  '/images/7.jpg',
  '/images/8.jpg',
  '/images/9.jpg',
  '/images/10.jpg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('restaurant-cache-v1').then(function(cache) {

      return cache.addAll(urlToCache);

    })

  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    }).catch(function(error) {
      console.log(error);
    })

  );
});
