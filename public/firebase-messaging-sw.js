// קובץ זה רץ ברקע ומטפל בהתראות פוש כשהאפליקציה סגורה
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// פרטי ההתחברות ל-Firebase (זהים לאלו שב-config.ts)
const firebaseConfig = {
  "projectId": "studio-7313343264-8d6d7",
  "appId": "1:754988940000:web:b830ee2c96f3b3162dee85",
  "apiKey": "AIzaSyBevC5M8uf5XuExY-z-phcdki_JHw7j4A4",
  "authDomain": "studio-7313343264-8d6d7.firebaseapp.com",
  "messagingSenderId": "754988940000"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// טיפול בהצגת ההודעה ברקע
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon-32x32.png' // וודא שיש לך אייקון בנתיב זה
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
