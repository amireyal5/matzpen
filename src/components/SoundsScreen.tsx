"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Flower2, Play, Sparkles, Disc3, Bell, Heart, Sun, Moon, Wind, Music, VolumeX, Volume2, Pause, Repeat, Timer, X, Cast } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useWakeLock } from "@/hooks/use-wake-lock";
import type { useAmbientMixer } from "@/hooks/use-ambient-mixer";
import { SoundId, SoundDefinition } from "@/lib/ambient-sound-engine";
import { AMBIENT_VIDEOS } from "@/lib/ambient-videos";
import AmbientVideoBackground from "@/components/AmbientVideoBackground";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SoundsScreenProps {
  onBack: () => void;
  mixer: ReturnType<typeof useAmbientMixer>;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

interface SoundCardProps {
  sound: SoundDefinition;
  track: { playState: "playing" | "paused" | "stopped"; isLoopEnabled: boolean };
  play: (id: SoundId) => void;
  pause: (id: SoundId) => void;
  stop: (id: SoundId) => void;
  toggleLoop: (id: SoundId) => void;
  onOpenFullscreen: (id: SoundId) => void;
}

function SoundCard({ sound, track, play, pause, stop, toggleLoop, onOpenFullscreen }: SoundCardProps) {
  const [imageError, setImageError] = useState(false);
  const playState = track.playState;
  const isPlaying = playState === "playing";
  const isPaused = playState === "paused";
  const isActive = isPlaying || isPaused;

  return (
    <div
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if (isPlaying) {
          onOpenFullscreen(sound.id);
        } else {
          play(sound.id);
        }
      }}
      className={cn(
        "relative h-48 rounded-[2rem] overflow-hidden group border transition-all duration-500 shadow-xl flex flex-col justify-between p-5 cursor-pointer",
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
                "w-12 h-12 rounded-full border flex items-center justify-center hover:scale-105 active:scale-95 transition-all backdrop-blur-md shadow-lg",
                track.isLoopEnabled
                  ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                  : "bg-black/40 text-white border-white/15 hover:bg-black/55"
              )}
              title="נגינה בלולאה חוזרת"
            >
              <Repeat size={16} className={track.isLoopEnabled && isPlaying ? "animate-[spin_10s_linear_infinite]" : ""} />
            </button>
          </div>

          {/* תגית מצב */}
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-md",
              isPlaying && "bg-emerald-500/25 text-emerald-300 border-emerald-500/30 animate-pulse",
              isPaused && "bg-amber-500/25 text-amber-300 border-amber-500/30",
              !isActive && "bg-black/40 text-slate-200 border-white/15"
            )}
          >
            {isPlaying ? "מנגן" : isPaused ? "מושהה" : "כבוי"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SoundsScreen({ onBack, mixer, theme = "light", toggleTheme }: SoundsScreenProps) {
  const isLight = theme === "light";
  useWakeLock(true);

  const [activeSoundId, setActiveSoundId] = useState<SoundId | null>(null);

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
    castTrack,
    castState,
    isCastSupported,
  } = mixer;

  useEffect(() => {
    // If a sound is already playing when the screen mounts, open it in fullscreen
    const playingSound = sounds.find((s) => trackStates[s.id].playState === "playing");
    if (playingSound) {
      setActiveSoundId(playingSound.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const activeSound = sounds.find((s) => s.id === activeSoundId);

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-500 relative isolate",
      isLight ? "text-slate-900" : "text-white",
      !isAnyPlaying && (isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100" : "bg-slate-950")
    )}>
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

      {/* רקע וידאו נופי חי - מופיע כשמתנגן צליל, להעמקת תחושת הנוכחות והשלווה */}
      {isAnyPlaying && (() => {
        const playingSound = sounds.find((s) => trackStates[s.id].playState === "playing");
        const playingSoundIdx = playingSound ? sounds.indexOf(playingSound) : 0;
        return (
          <AmbientVideoBackground
            src={AMBIENT_VIDEOS[playingSoundIdx % AMBIENT_VIDEOS.length]}
            className="fixed inset-0 -z-10 animate-in fade-in duration-1000"
            overlayClassName={isLight ? "bg-white/70" : "bg-slate-950/70"}
          />
        );
      })()}

      <header className={cn("relative z-10 p-6 flex items-center justify-between border-b backdrop-blur-md transition-colors duration-500", isLight ? "border-slate-200 bg-white/60" : "border-white/5 bg-slate-900/50")}>
        <button onClick={onBack} className={cn("flex items-center gap-2 text-xs font-black transition-colors", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-white")}>
          <ArrowRight size={18} />
          חזרה למסך הבית
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">צלילי מרחב</span>
          <span className={cn("text-sm font-bold", isLight ? "text-slate-900" : "text-white")}>שקט ומוזיקה מרגיעה</span>
        </div>
        <div className="flex items-center gap-2">
          {toggleTheme && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-90",
                    isLight
                      ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 shadow-sm"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                  )}
                  aria-label={isLight ? "מצב כהה" : "מצב בהיר"}
                >
                  {isLight ? <Moon size={18} /> : <Sun size={18} />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isLight ? "מצב כהה" : "מצב בהיר"}</TooltipContent>
            </Tooltip>
          )}
          <div className={cn("w-10 h-10 rounded-full border overflow-hidden relative transition-colors", isLight ? "border-slate-200" : "border-white/10")}>
            <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center p-6 max-w-4xl lg:max-w-5xl mx-auto w-full space-y-6 pb-32 md:pb-16">
        <div className="w-full space-y-6 animate-in fade-in duration-300 flex flex-col items-center">
          <div className="text-center space-y-3">
            <h2 className={cn("text-3xl font-black tracking-tight leading-tight transition-colors", isLight ? "text-slate-900" : "text-white")}>צלילים לשלווה פנימית</h2>
            <p className={cn("font-bold leading-relaxed max-w-md mx-auto text-xs", isLight ? "text-slate-500" : "text-slate-400")}>
              בחר את צליל הרקע המועדף עליך להתכנסות ומדיטציה עמוקה.
            </p>
          </div>

          {/* טיימר כיבוי עדין וקטן */}
          <div className={cn(
            "flex flex-col sm:flex-row items-center gap-3 justify-center py-2 px-4 rounded-full border max-w-md mx-auto transition-colors duration-500",
            isLight 
              ? "bg-slate-100/50 border-slate-200/60 text-slate-700" 
              : "bg-white/5 border-white/5 text-slate-400"
          )}>
            <div className="flex items-center gap-2 shrink-0">
              <Timer size={14} className={cn(timeLeft !== null ? "text-emerald-500 animate-pulse" : isLight ? "text-slate-400" : "text-slate-500")} />
              <span className="text-[10px] font-black tracking-widest uppercase">
                {timeLeft !== null ? `כיבוי בעוד ${formatTime(timeLeft)}` : "טיימר כיבוי:"}
              </span>
            </div>
            
            <div className="flex gap-1 items-center">
              {[0, 5, 15, 30, 45, 60].map((m) => {
                const isSelected = (m === 0 && timeLeft === null) || (m > 0 && timeLeft !== null && Math.round(timeLeft / 60) === m);
                return (
                  <button
                    key={m}
                    onClick={() => startTimer(m)}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all active:scale-95",
                      isSelected
                        ? "bg-emerald-500 border-emerald-500 text-slate-950 font-black shadow-sm"
                        : isLight
                          ? "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    )}
                  >
                    {m === 0 ? "ללא" : `${m} דק׳`}
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
                play={(id) => {
                  play(id);
                  setActiveSoundId(id);
                }}
                pause={pause}
                stop={stop}
                toggleLoop={toggleTrackLoop}
                onOpenFullscreen={setActiveSoundId}
              />
            ))}
          </div>

          {isAnyPlaying && (
            <button
              onClick={stopAll}
              className={cn("flex items-center gap-2 text-xs font-black transition-colors", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-white")}
            >
              <VolumeX size={16} />
              עצירת ניגון
            </button>
          )}
        </div>
      </main>

      {/* מודל נגן מוזיקה אינטראקטיבי מלא */}
      {activeSound && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 select-none animate-in fade-in duration-300">
          <AmbientVideoBackground
            src={AMBIENT_VIDEOS[sounds.indexOf(activeSound) % AMBIENT_VIDEOS.length]}
            className="z-0"
            overlayClassName={cn("bg-gradient-to-b opacity-60", isLight ? "from-indigo-950/30 to-slate-950/80" : "from-slate-950/80 to-slate-950")}
          />
          
          <header className="relative z-10 flex items-start justify-between gap-2 w-full max-w-lg mx-auto">
            <button
              onClick={() => setActiveSoundId(null)}
              className="shrink-0 px-3.5 sm:px-4 h-11 rounded-full bg-black/40 hover:bg-black/55 border border-white/15 flex items-center gap-1.5 text-white transition-all active:scale-95 shadow-lg backdrop-blur-md"
              aria-label="סגור נגן"
            >
              <X size={16} />
              <span className="text-xs font-black hidden xs:inline">סגור נגן</span>
            </button>
            <div className="min-w-0 flex-1 text-right px-1">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest drop-shadow">נגן צלילי מרחב</span>
              <h3 className="font-black text-base sm:text-lg text-white drop-shadow-lg line-clamp-1">{activeSound.label}</h3>
            </div>
          </header>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full space-y-6">
            <div className="relative">
              {/* טבעת הילה מונפשת */}
              <div className={cn(
                "absolute inset-0 rounded-full bg-emerald-500/10 blur-3xl scale-150 transition-all duration-1000",
                trackStates[activeSound.id].playState === "playing" ? "animate-pulse" : "opacity-0"
              )} />
              
              {/* דיסק מוזיקה מעוצב */}
              <div className={cn(
                "w-48 h-48 rounded-full border-4 border-white/10 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center shadow-2xl relative overflow-hidden group transition-all duration-1000",
                trackStates[activeSound.id].playState === "playing" ? "scale-105" : "scale-95"
              )}>
                <Image
                  src={activeSound.image}
                  alt={activeSound.label}
                  fill
                  className={cn(
                    "object-cover opacity-40 transition-all duration-[10000ms] ease-linear",
                    trackStates[activeSound.id].playState === "playing" ? "scale-110" : ""
                  )}
                  style={trackStates[activeSound.id].playState === "playing" ? { animation: "spin 20s linear infinite" } : undefined}
                />
                
                <div className="relative w-16 h-16 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center shadow-lg">
                  <Music className={cn("text-emerald-400", trackStates[activeSound.id].playState === "playing" ? "animate-bounce" : "")} size={24} />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2 px-6">
              <h4 className="text-xl font-headline font-black text-white">{activeSound.label}</h4>
              <p className="text-xs text-slate-400 font-bold max-w-xs mx-auto leading-relaxed">
                {activeSound.description}
              </p>
            </div>

            {/* קווי אקולייזר מנגנים */}
            {trackStates[activeSound.id].playState === "playing" && (
              <div className="flex items-end gap-1.5 h-6 justify-center">
                <span className="w-1 bg-emerald-400 rounded-full eq-bar-1" style={{ height: "40%" }} />
                <span className="w-1 bg-emerald-400 rounded-full eq-bar-2" style={{ height: "80%" }} />
                <span className="w-1 bg-emerald-400 rounded-full eq-bar-3" style={{ height: "50%" }} />
                <span className="w-1 bg-emerald-400 rounded-full eq-bar-2" style={{ height: "70%" }} />
                <span className="w-1 bg-emerald-400 rounded-full eq-bar-1" style={{ height: "30%" }} />
              </div>
            )}
          </div>

          <div className="relative z-10 max-w-lg mx-auto w-full space-y-6 pb-6">
            {/* סטטוס טיימר כיבוי */}
            {timeLeft !== null && (
              <div className="text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  הכיבוי האוטומטי פעיל • עצירה בעוד {formatTime(timeLeft)}
                </span>
              </div>
            )}

            {/* סטטוס שידור פעיל */}
            {castState !== "disconnected" && (
              <div className="text-center">
                {castState === "connected" ? (
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 justify-center shadow-md animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    משדר כעת לרמקול חכם / טלוויזיה
                  </span>
                ) : (
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 justify-center shadow-md animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    מתחבר למכשיר חיצוני...
                  </span>
                )}
              </div>
            )}

            {/* כפתורי בקרה ראשיים */}
            <div className="flex items-center justify-center gap-6">
              {/* כפתור לולאה */}
              <button
                onClick={() => toggleTrackLoop(activeSound.id)}
                className={cn(
                  "w-12 h-12 rounded-full border flex items-center justify-center transition-all active:scale-95 backdrop-blur-md shadow-lg",
                  trackStates[activeSound.id].isLoopEnabled
                    ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                    : "bg-black/40 text-white border-white/15"
                )}
                title="נגינה בלולאה"
              >
                <Repeat size={18} className={trackStates[activeSound.id].isLoopEnabled && trackStates[activeSound.id].playState === "playing" ? "animate-[spin_10s_linear_infinite]" : ""} />
              </button>

              {/* כפתור שידור (Cast) */}
              {isCastSupported && (
                <button
                  onClick={() => castTrack(activeSound.id)}
                  className={cn(
                    "w-12 h-12 rounded-full border flex items-center justify-center transition-all active:scale-95 backdrop-blur-md shadow-lg",
                    castState === "connected"
                      ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-500/10"
                      : castState === "connecting"
                      ? "bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/10"
                      : "bg-black/40 text-white border-white/15 hover:bg-black/55"
                  )}
                  title="שידור לרמקול או טלוויזיה חכמה"
                >
                  <Cast size={18} className={castState === "connecting" ? "animate-pulse" : ""} />
                </button>
              )}

              {/* הפעלה / השהיה */}
              {trackStates[activeSound.id].playState === "playing" ? (
                <button
                  onClick={() => pause(activeSound.id)}
                  className="w-20 h-20 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl"
                  aria-label="השהה"
                >
                  <Pause size={32} className="fill-current text-slate-950" />
                </button>
              ) : (
                <button
                  onClick={() => play(activeSound.id)}
                  className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emerald-500/25"
                  aria-label="נגן"
                >
                  <Play size={32} className="fill-current text-white translate-x-[2px]" />
                </button>
              )}

              {/* עצירה ויציאה מהנגן */}
              <button
                onClick={() => {
                  stop(activeSound.id);
                  setActiveSoundId(null);
                }}
                className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/55 border border-white/15 text-white flex items-center justify-center active:scale-95 transition-all backdrop-blur-md shadow-lg"
                aria-label="עצור וצא"
              >
                <span className="w-4 h-4 bg-white rounded-sm" />
              </button>
            </div>

            {/* הגדרת טיימר כיבוי ישירות מהמסך המלא */}
            <div className="flex justify-center gap-1.5 flex-wrap">
              {[0, 5, 15, 30, 45, 60].map((m) => {
                const isSelected = (m === 0 && timeLeft === null) || (m > 0 && timeLeft !== null && Math.round(timeLeft / 60) === m);
                return (
                  <button
                    key={m}
                    onClick={() => startTimer(m)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all active:scale-95 backdrop-blur-md",
                      isSelected
                        ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-md font-black"
                        : "bg-black/40 border-white/15 text-white hover:bg-black/55 shadow-lg"
                    )}
                  >
                    {m === 0 ? "ללא טיימר" : `${m} דק׳`}
                  </button>
                );
              })}
            </div>

            {/* כפתור חזרה */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setActiveSoundId(null)}
                className="text-xs font-black text-white hover:text-emerald-200 transition-colors px-4 py-2 rounded-full bg-black/40 border border-white/15 backdrop-blur-md shadow-lg"
              >
                חזרה לצלילים
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
