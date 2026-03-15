
'use client';

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getApp } from "firebase/app";

/**
 * פונקציה לבקשת הרשאה והפקת טוקן להתראות פוש.
 * @returns ה-FCM Token אם ההרשאה ניתנה, אחרת null.
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn("הדפדפן אינו תומך בהתראות פוש.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = getMessaging(getApp());
      
      /**
       * המפתח הציבורי (VAPID) שסופק על ידי המשתמש.
       */
      const VAPID_PUBLIC_KEY = "BLH5e9Xb4kRHIyQagGiNt3Ujdf-y_KKqR3hHaD3Y0oawxHMBcBV71A141-Y03qZxfA5iGl6lsQZJ0s7xNRpDHQs"; 
      
      const token = await getToken(messaging, { 
        vapidKey: VAPID_PUBLIC_KEY 
      });
      
      console.log("FCM Token נוצר בהצלחה:", token);
      return token;
    } else {
      console.warn("המשתמש סירב לקבלת התראות.");
    }
  } catch (error) {
    console.error("שגיאה בבקשת הרשאה להתראות:", error);
  }
  return null;
}

/**
 * האזנה להודעות פוש כשהאפליקציה פתוחה (Foreground).
 */
export function onMessageListener() {
  if (typeof window === 'undefined') return;
  
  try {
    const messaging = getMessaging(getApp());
    onMessage(messaging, (payload) => {
      console.log("הודעה התקבלה בזמן שהאפליקציה פתוחה:", payload);
      // בעתיד נוכל להוסיף כאן Toast שקופץ למשתמש
      if (payload.notification) {
        alert(`${payload.notification.title}\n${payload.notification.body}`);
      }
    });
  } catch (e) {
    // Messaging עשוי לא להיות נתמך בדפדפן הספציפי
  }
}
