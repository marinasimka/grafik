// Имя кэша
const CACHE_NAME = 'schedule-cache-v1.0';

// Файлы для кэширования
const urlsToCache = [
  '/grafik/',
  '/grafik/index.html',
  '/grafik/style.css',
  '/grafik/script.js',
  '/grafik/data.js',
  '/grafik/icons/icon-192x192.png',
  '/grafik/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэш открыт');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если файл есть в кэше, возвращаем его
        if (response) {
          return response;
        }
        
        // Иначе загружаем из сети
        return fetch(event.request)
          .then(response => {
            // Проверяем валидность ответа
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Клонируем ответ
            const responseToCache = response.clone();
            
            // Добавляем в кэш
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Если нет сети, можно показать fallback страницу
            if (event.request.url.indexOf('.html') > -1) {
              return caches.match('/grafik/index.html');
            }
          });
      })
  );
});

// Фоновая синхронизация (если понадобится позже)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('Фоновая синхронизация...');
  }
});

// Push-уведомления
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление из приложения График',
    icon: '/grafik/icons/icon-192x192.png',
    badge: '/grafik/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('График работы', options)
  );
});