// קובץ זה רץ ברקע ומטפל בהתראות כשהאפליקציה סגורה
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// פרטי ההתחברות של הפרויקט שלך (זהים ל-src/firebase/config.ts)
firebase.initializeApp({
  apiKey: "AIzaSyBevC5M8uf5XuExY-z-phcdki_JHw7j4A4",
  authDomain: "studio-7313343264-8d6d7.firebaseapp.com",
  projectId: "studio-7313343264-8d6d7",
  storageBucket: "studio-7313343264-8d6d7.firebasestorage.app",
  messagingSenderId: "754988940000",
  appId: "1:754988940000:web:b830ee2c96f3b3162dee85"
});

const messaging = firebase.messaging();

// טיפול בהצגת ההתראה ברקע
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo-icon.png' // וודא שיש לך אייקון בתיקיית public
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
