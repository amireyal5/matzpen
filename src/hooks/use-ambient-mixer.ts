"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AMBIENT_SOUNDS, SoundId } from "@/lib/ambient-sound-engine";

export type PlayState = "playing" | "paused" | "stopped";

export interface TrackState {
  playState: PlayState;
  volume: number; // 0 to 100
  isLoopEnabled: boolean;
}

type TrackStatesMap = Record<SoundId, TrackState>;

const INITIAL_STATES: TrackStatesMap = AMBIENT_SOUNDS.reduce((acc, sound) => {
  acc[sound.id] = {
    playState: "stopped",
    volume: 80, // ברירת מחדל של 80%
    isLoopEnabled: true, // לופ פעיל כברירת מחדל
  };
  return acc;
}, {} as TrackStatesMap);

/**
 * מנהל ומנגן קבצי שמע (HTML5 Audio) עם אפשרות לניגון ברקע,
 * שליטה מתקדמת (הפעלה, השהיה, עצירה, ועוצמת קול) ואינטגרציה עם Media Session API.
 * תומך בניגון בלעדי, טיימר כיבוי (Sleep Timer) ונגינה בלולאה (Loop).
 */
export function useAmbientMixer() {
  const activeAudiosRef = useRef<Partial<Record<SoundId, HTMLAudioElement>>>({});
  const fadeTimersRef = useRef<Partial<Record<SoundId, NodeJS.Timeout>>>({});
  const [trackStates, setTrackStates] = useState<TrackStatesMap>(INITIAL_STATES);
  
  // הגדרות טיימר כיבוי
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // שניות שנותרו
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // סנכרון עם ה-Media Session API של מערכת ההפעלה
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    const activeTracks = AMBIENT_SOUNDS.filter(
      (s) => trackStates[s.id].playState === "playing"
    );

    if (activeTracks.length > 0) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: activeTracks.map((s) => s.label).join(" + "),
        artist: "מרחב השקט | עמיר אייל",
        album: "מדיטציה ומיינדפולנס",
        artwork: [
          { src: "/logo.png", sizes: "192x192", type: "image/png" },
          { src: "/logo.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
      });
      navigator.mediaSession.playbackState = "playing";
    } else {
      navigator.mediaSession.playbackState = "paused";
    }
  }, [trackStates]);

  // האזנה למקשי מערכת ההפעלה (אוזניות, מסך נעילה וכו')
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => {
      // המשך ניגון של כל מה שהיה במצב playing
      Object.entries(activeAudiosRef.current).forEach(([id, audio]) => {
        if (audio && trackStates[id as SoundId].playState === "playing") {
          audio.play().catch((e) => console.warn(e));
        }
      });
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      // השהיית כל הנגנים הפעילים
      Object.values(activeAudiosRef.current).forEach((audio) => {
        if (audio) audio.pause();
      });
    });

    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      }
    };
  }, [trackStates]);

  // ביטול פייד קיים למנוע התנגשויות
  const clearFade = useCallback((id: SoundId) => {
    if (fadeTimersRef.current[id]) {
      clearInterval(fadeTimersRef.current[id]);
      delete fadeTimersRef.current[id];
    }
  }, []);

  // עצירה מוחלטת ואיפוס זמן
  const stop = useCallback((id: SoundId) => {
    clearFade(id);
    const audio = activeAudiosRef.current[id];
    if (!audio) {
      setTrackStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], playState: "stopped" },
      }));
      return;
    }

    // Fade Out מהיר ואז סגירת הנגן
    const startVol = audio.volume;
    let currentStep = 0;
    const steps = 10;
    const intervalTime = 20; // 200ms Fade Out

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(timer);
        if (activeAudiosRef.current[id]) {
          activeAudiosRef.current[id]!.pause();
          activeAudiosRef.current[id]!.currentTime = 0;
          activeAudiosRef.current[id]!.src = "";
          delete activeAudiosRef.current[id];
        }
        delete fadeTimersRef.current[id];
      } else if (activeAudiosRef.current[id]) {
        activeAudiosRef.current[id]!.volume = startVol * (1 - currentStep / steps);
      }
    }, intervalTime);

    fadeTimersRef.current[id] = timer;

    setTrackStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], playState: "stopped" },
    }));
  }, [clearFade]);

  // עצירת הכל
  const stopAll = useCallback(() => {
    AMBIENT_SOUNDS.forEach((sound) => stop(sound.id));
  }, [stop]);

  // השהיית סאונד (הנמכה חלקה ואז עצירה)
  const pause = useCallback((id: SoundId) => {
    clearFade(id);
    const audio = activeAudiosRef.current[id];
    if (!audio || audio.paused) {
      setTrackStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], playState: "paused" },
      }));
      return;
    }

    // Fade Out ל-0 ואז השהייה
    const startVol = audio.volume;
    let currentStep = 0;
    const steps = 10;
    const intervalTime = 30; // 300ms Fade Out

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(timer);
        if (activeAudiosRef.current[id]) {
          activeAudiosRef.current[id]!.pause();
          activeAudiosRef.current[id]!.volume = startVol;
        }
        delete fadeTimersRef.current[id];
      } else if (activeAudiosRef.current[id]) {
        activeAudiosRef.current[id]!.volume = startVol * (1 - currentStep / steps);
      }
    }, intervalTime);

    fadeTimersRef.current[id] = timer;

    setTrackStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], playState: "paused" },
    }));
  }, [clearFade]);

  // הפעלת סאונד (ומניעת ניגון של צלילים אחרים במקביל)
  const play = useCallback((id: SoundId) => {
    clearFade(id);

    // עצירת כל שאר הצלילים הפעילים לפני ניגון הצליל החדש
    AMBIENT_SOUNDS.forEach((sound) => {
      if (sound.id !== id) {
        stop(sound.id);
      }
    });

    const sound = AMBIENT_SOUNDS.find((s) => s.id === id);
    if (!sound) return;

    const targetVolume = trackStates[id].volume / 100;
    let audio = activeAudiosRef.current[id];

    if (!audio) {
      audio = new Audio(sound.url);
      audio.preload = "auto";
      activeAudiosRef.current[id] = audio;
    }

    // הגדרת לופ לפי בחירת המשתמש ברצועה זו
    const trackLoop = trackStates[id].isLoopEnabled;
    audio.loop = trackLoop;
    audio.onended = () => {
      if (!trackLoop) {
        stop(id);
      }
    };

    // הגדלת הווליום מ-0 לווליום המטרה בצורה חלקה (Fade In)
    audio.volume = 0;
    audio.play().catch((err) => console.warn(`Audio play failed for ${id}:`, err));

    let currentStep = 0;
    const steps = 10;
    const intervalTime = 30; // 300ms Fade In
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(timer);
        if (activeAudiosRef.current[id]) {
          activeAudiosRef.current[id]!.volume = targetVolume;
        }
      } else if (activeAudiosRef.current[id]) {
        activeAudiosRef.current[id]!.volume = targetVolume * (currentStep / steps);
      }
    }, intervalTime);

    setTrackStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], playState: "playing" },
    }));
  }, [trackStates, stop, clearFade]);

  // שינוי עוצמה
  const setVolume = useCallback((id: SoundId, value: number) => {
    const vol = Math.max(0, Math.min(100, value));
    setTrackStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], volume: vol },
    }));

    const audio = activeAudiosRef.current[id];
    if (audio) {
      if (!fadeTimersRef.current[id]) {
        audio.volume = vol / 100;
      }
    }
  }, []);

  // שינוי הגדרת הלופ של רצועה ספציפית
  const toggleTrackLoop = useCallback((id: SoundId) => {
    setTrackStates((prev) => {
      const nextLoop = !prev[id].isLoopEnabled;
      const audio = activeAudiosRef.current[id];
      if (audio) {
        audio.loop = nextLoop;
        audio.onended = () => {
          if (!nextLoop) stop(id);
        };
      }
      return {
        ...prev,
        [id]: { ...prev[id], isLoopEnabled: nextLoop },
      };
    });
  }, [stop]);

  // הגדרת טיימר כיבוי (בדקות)
  const startTimer = useCallback((minutes: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (minutes === 0) {
      setTimeLeft(null);
      endTimeRef.current = null;
      return;
    }

    const seconds = minutes * 60;
    setTimeLeft(seconds);
    const endTime = Date.now() + seconds * 1000;
    endTimeRef.current = endTime;

    timerRef.current = setInterval(() => {
      const remaining = Math.round((endTime - Date.now()) / 1000);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setTimeLeft(null);
        endTimeRef.current = null;
        stopAll();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
  }, [stopAll]);

  // ניקוי משאבים בעת יציאה
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      Object.values(fadeTimersRef.current).forEach((t) => t && clearInterval(t));
      Object.values(activeAudiosRef.current).forEach((audio) => {
        if (audio) {
          try {
            audio.pause();
            audio.src = "";
          } catch (e) {
            console.error(e);
          }
        }
      });
      activeAudiosRef.current = {};
    };
  }, []);

  const isAnyPlaying = AMBIENT_SOUNDS.some(
    (sound) => trackStates[sound.id].playState === "playing"
  );

  return {
    trackStates,
    play,
    pause,
    stop,
    setVolume,
    stopAll,
    isAnyPlaying,
    sounds: AMBIENT_SOUNDS,
    toggleTrackLoop,
    timeLeft,
    startTimer,
  };
}
