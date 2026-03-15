
// Service Worker עבור קבלת הודעות פוש ברקע
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBevC5M8uf5XuExY-z-phcdki_JHw7j4A4",
  authDomain: "studio-7313343264-8d6d7.firebaseapp.com",
  projectId: "studio-7313343264-8d6d7",
  messagingSenderId: "754988940000",
  appId: "1:754988940000:web:b830ee2c96f3b3162dee85"
});

const messaging = firebase.messaging();

// האזנה להודעות ברקע
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] התקבלה הודעה ברקע: ', payload);
  
  const notificationTitle = payload.notification.title || 'המצפן הרגשי 🧭';
  const notificationOptions = {
    body: payload.notification.body || 'יש לך מסר חדש במצפן',
    icon: '/favicon-32x32.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
