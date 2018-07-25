let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMapRestaurant = () => {
  const id = getParameterByName('id');
  DBHelper.fillReviewDatabase(id);
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.log(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}


handleFav = (box) => {
  updateFav(box.checked)
  if (box.checked) {
    localStorage.setItem("favBox", 'true');
  }else {
    localStorage.setItem("favBox", 'false');
  }
};

updateFav = (status) => {

  const id = getParameterByName('id');
  localStorage.setItem(`checkBox${id}`, status);
  return fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${status}`, {
    method: "PUT",
    mode: "cors",
    redirect: "follow",
  })
}

getFormInfo = () => {
  const form = document.querySelector('.review-form');
  const id = form.getAttribute('id').slice(12);
  const name = document.querySelector(`#input-name-${id}`);
  const rating = document.querySelector(`#input-rating-${id}`);
  const comment = document.querySelector(`#input-comment-${id}`);

  const review = {

    restaurant_id: parseInt(id),
    name: name.value,
    rating: parseInt(rating.value),
    comments: comment.value
  }

  name.value = "";
  rating.value = "1";
  comment.value ="";
  // document.getElementById('reviews-container').firstElementChild.innerHTML = "";
  // document.getElementById('reviews-list').innerHTML = "";
  return review;
}

saveDataToIDB = (data, id) => {
  return DBHelper.openReviewDatabase(id).then(db => {
    if (!db) return;

    const tx = db.transaction('reviews', 'readwrite');
    const store = tx.objectStore('reviews');


    store.put(data);

    return tx.complete;
  })
}

saveDataForBackgroundSync = (data) => {
  return DBHelper.openReviewDatabase('reviewSync').then(db => {
    if (!db) return;
    const tx = db.transaction('reviews', 'readwrite');
    const store = tx.objectStore('reviews');


    store.put(data);

    return tx.complete;
  })
}


/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {

    DBHelper.fetchRestaurantById(id).then(restaurant => {
      self.restaurant = restaurant;
      fillRestaurantHTML();
      return callback(null, restaurant);
    }).catch(error => {
      console.log(error);
      return;
    })
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  const picture = document.createElement('picture');
  document.getElementById('restaurant-container').insertBefore(picture, cuisine);

  const checkBox = document.createElement('input');
  checkBox.setAttribute('id', `checkBox${restaurant.id}`);
  checkBox.setAttribute('type', 'checkbox');
  checkBox.setAttribute('role', 'checkbox');
  checkBox.setAttribute('onchange', 'handleFav(this)');
  const checked = JSON.parse(localStorage.getItem(`checkBox${restaurant.id}`));
  checkBox.checked = checked;

  document.getElementById('favorite').appendChild(checkBox);

  DBHelper.picturesForRestaurant(restaurant, picture);
  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews

  DBHelper.getReviewFromDatabase(restaurant.id).then(reviews => {
    self.restaurant.reviews = reviews;
    fillReviewsHTML();
  }).catch(error => {
    console.log(error);
  });

  fillReviewFormHTML();

}


fillReviewFormHTML = (restaurant = self.restaurant) => {
  const reviewArea = document.getElementById('reviews-form');
  const form = document.createElement('form');
  const inputName = document.createElement('input');
  const inputNameLabel = document.createElement('label');
  const inputRating = document.createElement('select');
  const inputRatingLabel = document.createElement('label');
  const inputComment = document.createElement('textarea');
  const inputCommentLabel = document.createElement('label');
  const submit = document.createElement('input');

  let inputRatingOptions = document.createElement('option');
  inputRatingOptions.setAttribute('value', '1');
  inputRatingOptions.innerHTML = '1';
  inputRating.appendChild(inputRatingOptions);
  inputRatingOptions = document.createElement('option');
  inputRatingOptions.setAttribute('value', '2');
  inputRatingOptions.innerHTML = '2';
  inputRating.appendChild(inputRatingOptions);
  inputRatingOptions = document.createElement('option');
  inputRatingOptions.setAttribute('value', '3');
  inputRatingOptions.innerHTML = '3';
  inputRating.appendChild(inputRatingOptions);
  inputRatingOptions = document.createElement('option');
  inputRatingOptions.setAttribute('value', '4');
  inputRatingOptions.innerHTML = '4';
  inputRating.appendChild(inputRatingOptions);
  inputRatingOptions = document.createElement('option');
  inputRatingOptions.setAttribute('value', '5');
  inputRatingOptions.innerHTML = '5';
  inputRating.appendChild(inputRatingOptions);

  form.setAttribute('id', `review-form-${restaurant.id}`);
  form.setAttribute('class', `review-form`);

  inputName.setAttribute('type', 'text');
  inputName.setAttribute('id', `input-name-${restaurant.id}`);
  inputNameLabel.setAttribute('for', `input-name-${restaurant.id}`)
  inputNameLabel.innerHTML = "Name:"

  inputRating.setAttribute('name', 'ratings');
  inputRating.setAttribute('id', `input-rating-${restaurant.id}`);
  inputRatingLabel.setAttribute('for', `input-rating-${restaurant.id}`)
  inputRatingLabel.innerHTML = "Rating:"

  inputComment.setAttribute('name', 'ratings');
  inputComment.setAttribute('id', `input-comment-${restaurant.id}`);
  inputCommentLabel.setAttribute('for', `input-comment-${restaurant.id}`)
  inputCommentLabel.innerHTML = "Comment:"

  submit.setAttribute('type', 'submit');
  submit.setAttribute('value', 'submit');

  form.appendChild(inputNameLabel);
  let br = document.createElement('br');
  form.appendChild(br);
  form.appendChild(inputName);
  br = document.createElement('br');
  form.appendChild(br);
  br = document.createElement('br');
  form.appendChild(br);
  form.appendChild(inputRatingLabel);
  br = document.createElement('br');
  form.appendChild(br);
  form.appendChild(inputRating);
  br = document.createElement('br');
  form.appendChild(br);
  br = document.createElement('br');
  form.appendChild(br);
  form.appendChild(inputCommentLabel);
  br = document.createElement('br');
  form.appendChild(br);
  form.appendChild(inputComment);
  br = document.createElement('br');
  form.appendChild(br);
  br = document.createElement('br');
  form.appendChild(br);
  form.appendChild(submit);
  reviewArea.appendChild(form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = getFormInfo();

    // saveDataToIDB(data, restaurant.id);
    saveDataForBackgroundSync(data)

    DBHelper.getReviewFromDatabase("reviewSync").then(reviews => {
      reviews.forEach(review => {
        console.log(review);
        const newReview = createReviewHTML(review);
        document.getElementById('reviews-list').appendChild(newReview);
      })


    })

    navigator.serviceWorker.ready.then(function(reg) {

      reg.sync.register('addReview')
    })
    // DBHelper.fetchReviewByRestaurantId(restaurant.id).then(reviews => {
    //   console.log(reviews);
    //   self.restaurant.reviews = reviews;
    //   fillReviewsHTML();
    // }).catch(error => {
    //   console.log(error);
    // });

  });


}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {

  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');

  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {


  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  // const date = document.createElement('p');
  // date.innerHTML = review.createdAt;
  // li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb-list');
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.innerHTML = restaurant.name;
  a.href = window.location.href;
  a.setAttribute('aria-current', 'page');
  li.append(a)
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

DBHelper.registerServiceWorker();
