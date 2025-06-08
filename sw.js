// Service Worker for Atlas Infectious Disease Practice
const CACHE_NAME = 'atlas-idp-immigration-v1';
const urlsToCache = [
  '/',
  '/Immigration_exam.html',
  '/imm_exam.css',
  '/logo.AtlasPride.png',
  '/smiling-female-hero.webp',
  '/patient-hallway.webp',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache addAll failed:', error);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then((response) => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a stream
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Return offline fallback for HTML pages
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/Immigration_exam.html');
            }
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'appointment-form') {
    event.waitUntil(syncAppointmentData());
  }
});

// Function to sync appointment data when online
async function syncAppointmentData() {
  try {
    const appointmentData = await getStoredAppointmentData();
    if (appointmentData.length > 0) {
      // Send stored appointment data to server
      for (const appointment of appointmentData) {
        await submitAppointment(appointment);
      }
      // Clear stored data after successful submission
      await clearStoredAppointmentData();
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for appointment data storage
async function getStoredAppointmentData() {
  // Implementation would retrieve data from IndexedDB
  return [];
}

async function submitAppointment(appointmentData) {
  // Implementation would submit to server
  console.log('Submitting appointment:', appointmentData);
}

async function clearStoredAppointmentData() {
  // Implementation would clear stored data
  console.log('Clearing stored appointment data');
}