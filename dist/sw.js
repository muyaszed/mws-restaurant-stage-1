importScripts('/js/dbhelper.js');
importScripts('/js/idb.js');

var urlToCache = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/idb.js',
  '/js/dbhelper.js',
  '/images/1.webp',
  '/images/2.webp',
  '/images/3.webp',
  '/images/4.webp',
  '/images/5.webp',
  '/images/6.webp',
  '/images/7.webp',
  '/images/8.webp',
  '/images/9.webp',
  '/images/10.webp',
  

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
      console.log("this is error");
    })

  );
});

self.addEventListener('sync', function(event) {
  if (event.tag == 'addReview') {

    event.waitUntil(saveReviewToServer());
  }
});

function saveReviewToServer () {
  idb.open('reviewSync', 1, (upgradeDb) => {

    upgradeDb.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
  }).then(db => {
    return db.transaction('reviews').objectStore('reviews').getAll();
  }).then(datas => {

    datas.forEach(data => {
      delete data.id;

      const myInit = {
        method: 'POST',
        body: JSON.stringify(data)
      };
      fetch('http://localhost:1337/reviews/', myInit).then(res => {
        idb.open('reviewSync', 1, (upgradeDb) => {
          upgradeDb.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
        }).then(db => {
          if (!db) return;

          const tx = db.transaction('reviews', 'readwrite');
          const store = tx.objectStore('reviews');
          store.clear();
          return res.json();
        })

      }).catch(err => {
        console.log(err);
      })
    })

  })
}
