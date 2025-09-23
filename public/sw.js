// Service Worker placeholder
// This file exists to prevent 404 errors

self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', function(event) {
  // Let the browser handle all fetch requests normally
  return;
});