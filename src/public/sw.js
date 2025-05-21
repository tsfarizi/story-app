self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Notifikasi',
        options: {
          body: event.data.text(),
        }
      };
    }
  }
  const title = data.title || 'Notifikasi';
  const options = data.options || {
    body: 'Ada notifikasi baru.',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});