var CACHE_ALL = 'cc-cache-v1';
var urlsToCache = [
  '/home.html',
  '/index.html',
  '/admin.html',
  '/profile.html',
  '/register.html',
  '/schedule.html',

  '/css/controller.css',
  '/css/icons.css',
  '/css/main.css',
  '/css/calendar.css',
  '/css/custom_elements.css',
  '/css/home.css',
  '/css/invite.css',
  '/css/loader.css',
  '/css/navbar.css',
  '/css/profile.css',
  '/css/tutorial.css',
  '/css/user_editor.css',

  '/js/controller.js',
  '/js/auth.js',
  '/js/custom_elements.js',
  '/js/get_users.js',
  '/js/navbar.js',
  '/js/tutorial.js',
  '/js/url_query.js',
  '/js/inputs.js',
  '/js/main.js',
  '/js/user.js',

  '/favicons/favicon-196x196.png',
  '/favicons/favicon-512x512.png'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_ALL).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_ALL)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('activate', function(event) {

  var cacheWhitelist = ['cc-cache-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  // You've been added to the 8AM - 10AM shift on December 30. Please log on to accept or decline.

  const title = 'The Cart Chart';
  const options = {
    body: event.data.text(),
    icon: '/favicons/favicon-512x512.png',
    badge: '/favicons/favicon-512x512.png',
    tag: 'added'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.waitUntil(
    clients.matchAll().then(function(clis) {
      var client = clis.find(function(c) {
        c.visibilityState === 'visible';
      });

      if (client !== undefined) {
        client.navigate('http://cartchart.impells.com/');
        client.focus();
      } else {
        // there are no visible windows. Open one.
        clients.openWindow('http://cartchart.impells.com/');
        event.notification.close();
      }

    })
    // clients.openWindow('http://127.0.0.1:8080/');
  );
});
