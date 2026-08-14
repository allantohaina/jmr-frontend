const CACHE_NAME = "jmr-textile-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "JMR Textile", body: "Nouvelle notification", url: "/mon-profil", icon: "/favicon.svg" };

  try {
    const parsed = event.data ? event.data.json() : null;
    if (parsed) {
      data = { ...data, ...parsed };
    }
  } catch {
    // If the payload is not JSON, fall back to the raw text as the body.
    const text = event.data ? event.data.text() : "";
    if (text) data.body = text;
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: "/favicon.svg",
      data: { url: data.url || "/" },
      vibrate: [200, 100, 200],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});