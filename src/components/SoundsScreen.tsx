"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Flower2, Play, Sparkles, Disc3, Bell, Heart, Sun, Moon, Wind, Music, VolumeX, Volume2, Pause, Repeat, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { useAmbientMixer } from "@/hooks/use-ambient-mixer";
import { SoundId, SoundDefinition } from "@/lib/ambient-sound-engine";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SoundsScreenProps {
  onBack: () => void;
  initialSoundId?: SoundId;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

interface SoundCardProps {
  sound: SoundDefinition;
  track: { playState: "playing" | "paused" | "stopped"; isLoopEnabled: boolean };
  play: (id: SoundId) => void;
  pause: (id: SoundId) => void;
  stop: (id: SoundId) => void;
  toggleLoop: (id: SoundId) => void;
}

function SoundCard({ sound, track, play, pause, stop, toggleLoop }: SoundCardProps) {
  const [imageError, setImageError] = useState(false);
  const playState = track.playState;
  const isPlaying = playState === "playing";
  const isPaused = playState === "paused";
  const isActive = isPlaying || isPaused;

  return (
    <div
      className={cn(
        "relative h-48 rounded-[2rem] overflow-hidden group border transition-all duration-500 shadow-xl flex flex-col justify-between p-5",
        "snap-start w-[72vw] xs:w-[75vw] sm:w-[280px] md:w-auto shrink-0 md:shrink",
        isActive ? "border-emerald-500/40 shadow-emerald-950/20" : "border-white/10 hover:border-white/20"
      )}
    >
      {/* תמונת רקע איכותית או גרדיאנט רקע כגיבוי */}
      <div className="absolute inset-0 z-0">
        {!imageError ? (
          <Image
            src={sound.image}
            alt={sound.label}
            fill
            className={cn(
              "object-cover transition-transform duration-700 brightness-[0.3] group-hover:scale-105",
              isPlaying && "scale-105 brightness-[0.4]"
            )}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 transition-all duration-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      {/* חלק עליון של הכרטיסייה */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="text-right">
          <span className="block font-black text-base text-white leading-snug">{sound.label}</span>
          <span className="block text-[10px] text-slate-300 font-bold opacity-90">{sound.description}</span>
        </div>

        {/* גלי אקולייזר מונפשים כשהסאונד מנגן */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-4 w-5 bg-emerald-500/20 border border-emerald-500/20 backdrop-blur-md rounded-full px-1.5 py-0.5" title="מנגן">
            <span className="w-0.5 bg-emerald-400 rounded-full eq-bar-1" style={{ height: "40%" }} />
            <span className="w-0.5 bg-emerald-400 rounded-full eq-bar-2" style={{ height: "80%" }} />
            <span className="w-0.5 bg-emerald-400 rounded-full eq-bar-3" style={{ height: "50%" }} />
          </div>
        )}
      </div>

      {/* חלק תחתון של הכרטיסייה */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {/* כפתור הפעלה / השהיה */}
            {isPlaying ? (
              <button
                onClick={() => pause(sound.id)}
                className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                aria-label={`השהה ${sound.label}`}
              >
                <Pause size={18} className="fill-current" />
              </button>
            ) : (
              <button
                onClick={() => play(sound.id)}
                className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                aria-label={`נגן ${sound.label}`}
              >
                <Play size={18} className="fill-current translate-x-[1px]" />
              </button>
            )}

            {/* כפתור עצירה מוחלטת */}
            {isActive && (
              <button
                onClick={() => stop(sound.id)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all backdrop-blur-md"
                aria-label={`עצור ${sound.label}`}
              >
                <span className="w-3.5 h-3.5 bg-white rounded-sm" />
              </button>
            )}

            {/* כפתור לופ של הרצועה */}
            <button
              onClick={() => toggleLoop(sound.id)}
              className={cn(
                "w-12 h-12 rounded-full border flex items-center justify-center hover:scale-105 active:scale-95 transition-all backdrop-blur-md",
                track.isLoopEnabled
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/35"
                  : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
              )}
              title="נגינה בלולאה חוזרת"
            >
              <Repeat size={16} className={track.isLoopEnabled && isPlaying ? "animate-[spin_10s_linear_infinite]" : ""} />
            </button>
          </div>

          {/* תגית מצב */}
          <span
            className={cn(
              "text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border",
              isPlaying && "bg-emerald-500/20 text-emerald-400 border-emerald-500/20 animate-pulse",
              isPaused && "bg-amber-500/20 text-amber-400 border-amber-500/20",
              !isActive && "bg-white/5 text-slate-500 border-white/5"
            )}
          >
            {isPlaying ? "מנגן" : isPaused ? "מושהה" : "כבוי"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SoundsScreen({ onBack, initialSoundId }: SoundsScreenProps) {
  useWakeLock(true);

  const {
    trackStates,
    play,
    pause,
    stop,
    stopAll,
    isAnyPlaying,
    sounds,
    toggleTrackLoop,
    timeLeft,
    startTimer,
  } = useAmbientMixer();

  // טעינה ראשונית של סאונד מדף הבית
  useEffect(() => {
    if (initialSoundId) {
      play(initialSoundId);
    }
  }, [initialSoundId, play]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes eq-bar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .eq-bar-1 { animation: eq-bar 0.8s ease-in-out infinite; }
        .eq-bar-2 { animation: eq-bar 0.5s ease-in-out -0.3s infinite; }
        .eq-bar-3 { animation: eq-bar 0.7s ease-in-out -0.15s infinite; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white transition-colors">
          <ArrowRight size={18} />
          חזרה
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">צלילי מרחב</span>
          <span className="text-sm font-bold">שקט ומוזיקה מרגיעה</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden relative">
          <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 max-w-4xl mx-auto w-full space-y-8 pb-16">
        <div className="relative pt-4">
          <div className={cn("absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full transition-opacity", isAnyPlaying ? "animate-pulse opacity-100" : "opacity-60")} />
          <div className="relative w-28 h-28 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-2xl">
            <Music size={50} className={cn("animate-in fade-in zoom-in duration-1000", isAnyPlaying && "animate-pulse")} />
          </div>
        </div>

        <div className="w-full space-y-8 animate-in fade-in duration-300 flex flex-col items-center">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black tracking-tight leading-tight">צלילים לשלווה פנימית</h2>
            <p className="text-slate-400 font-bold leading-relaxed max-w-md mx-auto text-xs">
              בחר את צליל הרקע המועדף עליך להתכנסות ומדיטציה עמוקה.
            </p>
          </div>

          {/* טיימר כיבוי */}
          <div className="w-full bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
            <div className="flex items-center gap-4 text-right">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", timeLeft !== null ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-500")}>
                <Timer size={22} className={timeLeft !== null ? "animate-pulse" : ""} />
              </div>
              <div>
                <span className="block text-base font-black text-white">טיימר כיבוי אוטומטי</span>
                <span className="block text-xs text-slate-400 mt-0.5">
                  {timeLeft !== null ? `המוזיקה תעצר בעוד ${formatTime(timeLeft)} דקות` : "הגדרת זמן לכיבוי אוטומטי של הצלילים"}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
              {[0, 5, 15, 30, 45, 60].map((m) => {
                const isSelected = (m === 0 && timeLeft === null) || (m > 0 && timeLeft !== null && Math.round(timeLeft / 60) === m);
                return (
                  <button
                    key={m}
                    onClick={() => startTimer(m)}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-xs font-black border transition-all active:scale-95 flex-1 md:flex-initial text-center",
                      isSelected
                        ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500/15"
                        : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                    )}
                  >
                    {m === 0 ? "ללא טיימר" : `${m} דק׳`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* גלריה/גריד צלילים */}
          <div className="w-full flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-6 px-6" dir="rtl">
            {sounds.map((sound) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                track={trackStates[sound.id]}
                play={play}
                pause={pause}
                stop={stop}
                toggleLoop={toggleTrackLoop}
              />
            ))}
          </div>

          {isAnyPlaying && (
            <button
              onClick={stopAll}
              className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white transition-colors"
            >
              <VolumeX size={16} />
              עצירת ניגון
            </button>
          )}
        </div>
      </main>

      <footer className="p-8 max-w-lg mx-auto w-full z-10">
        <Button
          onClick={onBack}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-16 rounded-[1.5rem] text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Sparkles size={20} />
          חזרה לכלים
        </Button>
      </footer>
    </div>
  );
}
