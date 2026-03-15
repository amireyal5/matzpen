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
       * !!! כאן עליך להדביק את ה-Public Key (VAPID) שייצרת ב-Firebase Console !!!
       * נתיב ב-Console: Project Settings -> Cloud Messaging -> Web Push certificates
       */
      const VAPID_PUBLIC_KEY = "YOUR_VAPID_PUBLIC_KEY_HERE"; 
      
      if (VAPID_PUBLIC_KEY === "YOUR_VAPID_PUBLIC_KEY_HERE") {
        console.error("יש להגדיר מפתח VAPID ציבורי ב-src/firebase/messaging.ts כדי שההתראות יעבדו.");
        return null;
      }
      
      const token = await getToken(messaging, { 
        vapidKey: VAPID_PUBLIC_KEY 
      });
      
      return token;
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
      // כאן ניתן להפעיל Toast או התראה בתוך ה-UI
    });
  } catch (e) {
    // Messaging עשוי לא להיות נתמך בדפדפן הספציפי
  }
}
