// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  "projectId": "studio-7313343264-8d6d7",
  "appId": "1:754988940000:web:b830ee2c96f3b3162dee85",
  "apiKey": "AIzaSyBevC5M8uf5XuExY-z-phcdki_JHw7j4A4",
  "authDomain": "studio-7313343264-8d6d7.firebaseapp.com",
  "messagingSenderId": "754988940000"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo-icon.png' // וודא שיש לך אייקון בנתיב הזה
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
