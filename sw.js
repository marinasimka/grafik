// Имя кэша с версией - при изменении версии браузер обновит файлы
const CACHE_NAME = 'schedule-app-v1.0.1';
const urlsToCache = [
  '/grafik/',
  '/grafik/index.html',
  '/grafik/style.css',
  '/grafik/script.js',
  '/grafik/data.js',
  '/grafik/manifest.json',
  '/grafik/icons/icon-192x192.png',
  '/grafik/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Установка...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Кэширование файлов...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Установка завершена');
        // Активируем сразу, не ждём перезагрузки
        return self.skipWaiting();
      })
  );
});

// Активация
self.addEventListener('activate', event => {
  console.log('Service Worker: Активация...');
  
  event.waitUntil(
    // Удаляем старые кэши
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker: Активация завершена');
      // Берём под контроль все клиенты
      return self.clients.claim();
    })
  );
});

// Перехват запросов - СТРАТЕГИЯ: СЕТЬ ПРИОРИТЕТНЕЕ
self.addEventListener('fetch', event => {
  // Не кэшируем запросы к API и динамические данные
  if (event.request.url.includes('/api/') || event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Если получили ответ, кэшируем его
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Если сети нет, пытаемся взять из кэша
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Если нет в кэше, показываем fallback
            if (event.request.url.indexOf('.html') > -1) {
              return caches.match('/grafik/index.html');
            }
            return new Response('Нет соединения', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Получение сообщений от основного скрипта
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
