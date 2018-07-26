/**
 * Common database helper functions.
 */



class DBHelper {

  static openDatabase() {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open('restaurant', 1, (upgradeDb) => {
      upgradeDb.createObjectStore('restaurants', {
        keyPath: 'id'
      });
    })
  }

  static openReviewDatabase(name) {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open(name, 1, (upgradeDb) => {

      upgradeDb.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
    })
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }


  static fillReviewDatabase(id) {

    if(id) {
      return fetch(`http://localhost:1337/reviews?restaurant_id=${id}`).then(res => res.json())
      .then(reviews => {
        DBHelper.openReviewDatabase(id).then(db => {
          if (!db) return;

          const tx = db.transaction('reviews', 'readwrite');
          const store = tx.objectStore('reviews');



          reviews.forEach(review => {
            store.put(review);
          })
          return tx.complete;
        })
        return DBHelper.getReviewFromDatabase(id);
        // return reviews;
      }).catch(error => {
        return error;
      });
    }

  }

  static fillRestaurantDatabase() {
    return fetch(DBHelper.DATABASE_URL).then(res => res.json())
    .then(restaurants => {
      DBHelper.openDatabase().then(db => {
        if (!db) return;

        const tx = db.transaction('restaurants', 'readwrite');
        const store = tx.objectStore('restaurants');
        restaurants.forEach(restaurant => {
          store.put(restaurant);
        })
        return tx.complete;
      })
      return DBHelper.getFromDatabase();
      // return restaurants;
    }).catch(error => {
      return error;
    });

  }

  static getFromDatabase() {
    return DBHelper.openDatabase().then(db => {
      return db.transaction('restaurants').objectStore('restaurants').getAll();
    })
  }

  static getReviewFromDatabase(name) {
    return DBHelper.openReviewDatabase(name).then(db => {
      return db.transaction('reviews').objectStore('reviews').getAll();
    })
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    return DBHelper.getFromDatabase();
  }

  static fetchReviews() {
    return DBHelper.getReviewFromDatabase();
  }

  // static fetchReviewByRestaurantId(id) {
  //
  //   return DBHelper.fetchReviews().then(reviews => {
  //     const restaurantReviews = reviews.filter(r => r.restaurant_id == id);
  //
  //     return restaurantReviews;
  //   })
  // }
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id) {
    return DBHelper.fetchRestaurants().then(restaurants => {
      const restaurant = restaurants.find(r => r.id == id);
      if (restaurant) { // Got the restaurant
        return restaurant;
      } else { // Restaurant does not exist in the database
        return 'Restaurant does not exist';
      }
    }).catch(error => {
      return error;
    })
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    return DBHelper.fetchRestaurants().then(restaurants => {
      let results = restaurants
      if (cuisine != 'all') { // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }
      return results;
    })
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods() {
    return DBHelper.fetchRestaurants().then(restaurants => {

      // Get all neighborhoods from all restaurants
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
      // Remove duplicates from neighborhoods
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
      return uniqueNeighborhoods;
    }).catch(errors => {
      return errors;
    });
  }


  /**
   * Fetch all cuisines with proper error handling.
   */
   static fetchCuisines() {
     // Fetch all restaurants
     return DBHelper.fetchRestaurants().then(restaurants => {
       // Get all cuisines from all restaurants
       const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
       // Remove duplicates from cuisines
       const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
       return uniqueCuisines;
     }).catch(error => {
       return error;
     })
   }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/images/${restaurant.id}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
     // https://leafletjs.com/reference-1.3.0.html#marker
     const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
       {title: restaurant.name,
       alt: restaurant.name,
       url: DBHelper.urlForRestaurant(restaurant)
       })
       marker.addTo(newMap);
     return marker;
   }
  // static mapMarkerForRestaurant(restaurant, map) {
  //   const marker = new google.maps.Marker({
  //     position: restaurant.latlng,
  //     title: restaurant.name,
  //     url: DBHelper.urlForRestaurant(restaurant),
  //     map: map,
  //     animation: google.maps.Animation.DROP}
  //   );
  //   return marker;
  // }

  // generate picture element and images
  static picturesForRestaurant(restaurant, picture) {
    const sourceLarge = document.createElement('source');
    sourceLarge.srcset = `/images/${restaurant.id}-large.webp`;
    sourceLarge.media = `(min-width: 860px)`
    picture.append(sourceLarge);

    const sourceMedium = document.createElement('source');
    sourceMedium.srcset = `/images/${restaurant.id}-medium.webp`
    sourceMedium.media = `(min-width: 450px)`
    picture.append(sourceMedium);

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = `${DBHelper.imageUrlForRestaurant(restaurant)}.webp`;
    image.alt = `${restaurant.name}'s restaurant picture`;
    picture.append(image);
  }

  //register ServiceWorker
  static registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {

        navigator.serviceWorker.register('/sw.js').then(function(registration) {
          // Registration was successful

          console.log('ServiceWorker registration successful with scope: ', registration.scope);

        }, function(err) {
          // registration failed :(
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  }



}
