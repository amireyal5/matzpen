'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook המונע מהמסך להכבות (Wake Lock) בזמן שהקומפוננטה פעילה.
 * @param enabled האם להפעיל את נעילת המסך כעת.
 */
export function useWakeLock(enabled: boolean = true) {
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = useCallback(async () => {
    // בדיקה אם הדפדפן תומך ב-Wake Lock API
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator) || !enabled) return;

    try {
      // שחרור נעילה קיימת אם יש
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
      }
      
      // בקשת נעילה חדשה
      wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      
      // האזנה לשחרור הנעילה על ידי המערכת (למשל כשעוברים טאב)
      wakeLockRef.current.addEventListener('release', () => {
        console.log('Screen Wake Lock was released');
      });
    } catch (err: any) {
      console.warn(`Wake Lock Error: ${err.name}, ${err.message}`);
    }
  }, [enabled]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (e) {}
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // אם המשתמש חוזר לטאב אחרי שהיה ברקע, ננסה לנעול שוב
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [enabled, requestWakeLock, releaseWakeLock]);
}
