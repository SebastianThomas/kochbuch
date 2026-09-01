import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

precacheAndRoute(self.__WB_MANIFEST);

const apiCache = () =>
  new NetworkFirst({
    cacheName: 'v2',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200, 201, 202, 203, 204] })],
  });

['items/', 'icons/', 'images/', 'users/'].forEach((path) => {
  registerRoute(new RegExp(path), apiCache(), 'GET');
});

self.addEventListener('push', (event) => {
  const notification = event.data.text();

  const splitter = new RegExp('%%', 'g');
  const notificationPayloads = notification.split(splitter);

  let link;
  switch (notificationPayloads[2]) {
    case 'recipe':
      link = `#/recipes/${notificationPayloads[1]}`;
      break;
    case 'user':
      link = `#/user/${notificationPayloads[1]}`;
      break;
    case 'image':
      link = `api/images/image/name/${notificationPayloads[1]}`;
      break;
    default:
      link = `#/`;
      break;
  }

  const clickOpenUrl = `${self.location.origin}/${link}`;

  const options = {
    body: `${notificationPayloads[0]}`,
    icon: '/img/icons/android-chrome-192x192.png',
    data: { url: clickOpenUrl },

    vibrate: [200, 100, 200, 100, 200, 100, 200],
    tag: 'vibration-sample',
  };
  event.waitUntil(self.registration.showNotification('kochbuch', options));
});

self.addEventListener('notificationclick', (event) => {
  const clickedNotification = event.notification;
  const openUrl = event.notification.data.url;

  clickedNotification.close();
  if (openUrl) {
    event.waitUntil(clients.openWindow(openUrl));
  }
});
