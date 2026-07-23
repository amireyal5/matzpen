"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Play, Pause, X, Sun, Moon, Sparkles, VolumeX, Volume2, RotateCcw, Trees, Waves, Cloud, Clock, Mic, MicOff, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { useAmbientMixer } from "@/hooks/use-ambient-mixer";
import AmbientVideoBackground from "@/components/AmbientVideoBackground";
import { GUIDED_IMAGERY_JOURNEYS, GuidedImageryJourney, ImageryStep } from "@/lib/guided-imagery";
import { cn, adjustGender } from "@/lib/utils";
import Image from "next/image";
import { useUser } from "@/firebase";

interface GuidedImageryScreenProps {
  onBack: () => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
  gender: "m" | "f";
}

const JOURNEY_ICONS = { forest: Trees, ocean: Waves, clouds: Cloud };

function getJourneyDuration(journey: GuidedImageryJourney) {
  return journey.steps.reduce((sum, step) => sum + step.duration, 0);
}

// בוחר קול נשי בעברית מבין הקולות שהדפדפן מציע, עם העדפה לקולות איכותיים (Enhanced/Premium) שנשמעים טבעיים יותר מהקול הבסיסי הרובוטי
function pickHebrewFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const hebrewVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith("he"));
  if (hebrewVoices.length === 0) return null;

  const premiumVoices = hebrewVoices.filter((v) => /enhanced|premium|neural|siri/i.test(v.name));
  const pool = premiumVoices.length > 0 ? premiumVoices : hebrewVoices;

  const femaleHints = ["female", "carmit", "כרמית", "אישה", "נשי", "ניצן", "נטע", "מורן", "woman"];
  const female = pool.find((v) => femaleHints.some((hint) => v.name.toLowerCase().includes(hint)));
  return female ?? pool[0];
}

function JourneyCard({ journey, onStart }: { journey: GuidedImageryJourney; onStart: (journey: GuidedImageryJourney) => void }) {
  const [imageError, setImageError] = useState(false);
  const Icon = JOURNEY_ICONS[journey.icon];
  const minutes = Math.round(getJourneyDuration(journey) / 60);

  return (
    <div className="snap-start w-[72vw] xs:w-[75vw] sm:w-[280px] md:w-auto h-56 rounded-[2rem] overflow-hidden group border border-white/10 hover:border-indigo-500/30 transition-all duration-500 shadow-xl flex flex-col justify-between p-6 shrink-0 md:shrink relative">
      <div className="absolute inset-0 z-0">
        {!imageError ? (
          <Image
            src={journey.image || "/logo.png"}
            alt={journey.title}
            fill
            className="object-cover transition-transform duration-700 brightness-[0.3] group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 transition-all duration-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      <div className="relative z-10 space-y-2">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center backdrop-blur-md">
            <Icon size={18} />
          </div>
          <span className="text-[9px] font-black text-indigo-400 px-2.5 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/10 flex items-center gap-1">
            <Clock size={10} />
            {minutes} דק׳
          </span>
        </div>
        <div className="text-right">
          <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors leading-tight">{journey.title}</h4>
          <p className="text-[10px] text-slate-300 font-medium leading-relaxed mt-1 opacity-90 line-clamp-2">{journey.description}</p>
        </div>
      </div>

      <div className="relative z-10 flex justify-end">
        <Button
          onClick={() => onStart(journey)}
          className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black h-9 px-4 rounded-xl text-[10px] transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/45"
        >
          <Play size={10} className="fill-current translate-x-[0.5px]" />
          התחל מסע
        </Button>
      </div>
    </div>
  );
}

export default function GuidedImageryScreen({ onBack, theme = "light", toggleTheme, gender }: GuidedImageryScreenProps) {
  const { user } = useUser();
  const isLight = theme === "light";
  useWakeLock(true);

  const { play, pause, stop, setVolume } = useAmbientMixer();

  // מנמיך את עוצמת המוזיקה כדי שההקראה תישמע בבירור על רקע הצליל
  const duckMusic = useCallback((soundId: GuidedImageryJourney["soundId"]) => {
    setTimeout(() => setVolume(soundId, 35), 400);
  }, [setVolume]);

  const [activeJourney, setActiveJourney] = useState<GuidedImageryJourney | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepTimeLeft, setStepTimeLeft] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isNarrationMuted, setIsNarrationMuted] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const activeJourneyRef = useRef<GuidedImageryJourney | null>(null);
  const narrationAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { activeJourneyRef.current = activeJourney; }, [activeJourney]);

  // טעינת קולות הקראה הזמינים בדפדפן (לרוב נטענים באופן אסינכרוני)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // מקריא קטע טקסט בקול נשי בעברית, ללא תלות במצב ההשתקה (לשימוש בהדלקת ההקראה)
  const speakText = useCallback((step: ImageryStep) => {
    if (typeof window === "undefined") return;

    // עצירת הקראה קודמת
    if (narrationAudioRef.current) {
      narrationAudioRef.current.pause();
      narrationAudioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (step.isSilent) {
      return;
    }

    if (step.audio && gender === "m") {
      const audio = new Audio(step.audio);
      narrationAudioRef.current = audio;
      audio.muted = isNarrationMuted;
      audio.play().catch(err => console.log("Audio play error:", err));
    } else if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(adjustGender(step.text, gender));
      utterance.lang = "he-IL";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      const voice = pickHebrewFemaleVoice(voices);
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    }
  }, [voices, isNarrationMuted, gender]);

  // מקריא קטע טקסט רק אם ההקראה לא הושתקה - לשימוש בזרימה הרגילה של המסע
  const speakStep = useCallback((step?: ImageryStep) => {
    if (!step) return;
    if (isNarrationMuted) return;
    speakText(step);
  }, [isNarrationMuted, speakText]);

  const startJourney = (journey: GuidedImageryJourney) => {
    setActiveJourney(journey);
    setStepIndex(0);
    setStepTimeLeft(journey.steps[0].duration);
    setTotalTimeLeft(getJourneyDuration(journey));
    setIsPlaying(true);
    setIsComplete(false);
    if (!isMusicMuted) {
      play(journey.soundId);
      duckMusic(journey.soundId);
    }
    speakStep(journey.steps[0]);
  };

  const exitJourney = () => {
    if (activeJourney) stop(activeJourney.soundId);
    if (narrationAudioRef.current) {
      narrationAudioRef.current.pause();
      narrationAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setActiveJourney(null);
    setIsPlaying(false);
    setIsComplete(false);
  };

  const restartJourney = () => {
    if (!activeJourney) return;
    setStepIndex(0);
    setStepTimeLeft(activeJourney.steps[0].duration);
    setTotalTimeLeft(getJourneyDuration(activeJourney));
    setIsPlaying(true);
    setIsComplete(false);
    if (!isMusicMuted) {
      play(activeJourney.soundId);
      duckMusic(activeJourney.soundId);
    }
    speakStep(activeJourney.steps[0]);
  };

  const toggleMusic = () => {
    if (!activeJourney) return;
    if (isMusicMuted) {
      if (isPlaying) {
        play(activeJourney.soundId);
        duckMusic(activeJourney.soundId);
      }
      setIsMusicMuted(false);
    } else {
      stop(activeJourney.soundId);
      setIsMusicMuted(true);
    }
  };

  const toggleNarration = () => {
    if (isNarrationMuted) {
      setIsNarrationMuted(false);
      if (activeJourney && isPlaying && !isComplete) {
        if (narrationAudioRef.current) {
          narrationAudioRef.current.muted = false;
          narrationAudioRef.current.play().catch(err => console.log("Audio play error:", err));
        } else {
          speakText(activeJourney.steps[stepIndex]);
        }
      }
    } else {
      if (narrationAudioRef.current) {
        narrationAudioRef.current.muted = true;
        narrationAudioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsNarrationMuted(true);
    }
  };

  const togglePlay = () => {
    if (!activeJourney || isComplete) return;
    if (isPlaying) {
      if (!isMusicMuted) pause(activeJourney.soundId);
      if (narrationAudioRef.current) {
        narrationAudioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
    } else {
      if (!isMusicMuted) play(activeJourney.soundId);
      if (narrationAudioRef.current && !isNarrationMuted) {
        narrationAudioRef.current.play().catch(err => console.log("Audio play error:", err));
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.resume();
      }
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (!activeJourney || !isPlaying || isComplete) return;

    const interval = setInterval(() => {
      // יציאה הדרגתית של המוזיקה ב-5 השניות האחרונות
      if (totalTimeLeft <= 5 && !isMusicMuted) {
        const fadeVol = Math.max(0, Math.round(((totalTimeLeft - 1) / 5) * 35));
        setVolume(activeJourney.soundId, fadeVol);
      }

      if (totalTimeLeft <= 1) {
        setTotalTimeLeft(0);
        setIsPlaying(false);
        setIsComplete(true);
        if (!isMusicMuted) {
          stop(activeJourney.soundId);
          // שחזור עוצמת השמע ל-35 עבור המסעות הבאים
          setTimeout(() => {
            setVolume(activeJourney.soundId, 35);
          }, 500);
        }
        if (narrationAudioRef.current) {
          narrationAudioRef.current.pause();
          narrationAudioRef.current = null;
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        return;
      }

      setTotalTimeLeft(totalTimeLeft - 1);

      if (stepTimeLeft <= 1) {
        const nextIdx = stepIndex + 1;
        const nextStep = activeJourney.steps[nextIdx];
        setStepIndex(nextIdx);
        setStepTimeLeft(nextStep?.duration ?? 0);
        speakStep(nextStep);
      } else {
        setStepTimeLeft(stepTimeLeft - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJourney, isPlaying, isComplete, totalTimeLeft, stepTimeLeft, stepIndex, isMusicMuted, stop, speakStep, speakText]);

  // עצירת המוזיקה וההקראה אם המשתמש עוזב את המסך באמצע מסע פעיל
  useEffect(() => {
    return () => {
      if (activeJourneyRef.current) stop(activeJourneyRef.current.soundId);
      if (narrationAudioRef.current) {
        narrationAudioRef.current.pause();
        narrationAudioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-slate-950 text-white")}>
      <header className={cn("p-6 flex items-center justify-between border-b backdrop-blur-md z-10 transition-colors duration-500", isLight ? "border-slate-200 bg-white/60" : "border-white/5 bg-slate-900/50")}>
        <button onClick={onBack} className={cn("flex items-center gap-2 text-xs font-black transition-all px-3.5 py-1.5 rounded-full border shadow-sm backdrop-blur-md", isLight ? "text-slate-700 hover:text-slate-950 bg-slate-100/60 border-slate-200/50 hover:bg-slate-200/60" : "text-slate-200 hover:text-white bg-white/5 border-white/10 hover:bg-white/10")}>
          <ArrowRight size={18} />
          חזרה למסך הבית
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">דימיון מודרך</span>
          <span className={cn("text-sm font-bold", isLight ? "text-slate-900" : "text-white")}>מסעות ויזואליים לשלווה</span>
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
            {user?.photoURL ? (
              <Image src={user.photoURL} alt="פרופיל אישי" fill className="object-cover rounded-full" />
            ) : (
              <div className={cn("w-full h-full flex items-center justify-center", isLight ? "bg-slate-100 text-slate-500" : "bg-slate-800 text-slate-400")}>
                <UserIcon size={16} />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 max-w-4xl lg:max-w-5xl mx-auto w-full space-y-8 pb-32 md:pb-16">
        <div className="relative pt-4">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full transition-opacity opacity-60" />
          <div className="relative w-28 h-28 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-2xl">
            <Sparkles size={50} className="animate-in fade-in zoom-in duration-1000" />
          </div>
        </div>

        <div className="w-full space-y-8 animate-in fade-in duration-300 flex flex-col items-center">
          <div className="text-center space-y-3">
            <h2 className={cn("text-3xl font-black tracking-tight leading-tight transition-colors", isLight ? "text-slate-900" : "text-white")}>מסעות דימיון מודרך</h2>
            <p className={cn("font-bold leading-relaxed max-w-md mx-auto text-xs", isLight ? "text-slate-500" : "text-slate-400")}>
              חוויה ויזואלית עם וידאו נוף, מוזיקה רגועה והקראה מלווה שמלווה אותך בין הפסקאות. בחר מסע, עצום עיניים, הקשב לקול ולמוזיקה, והרשה לדמיון לעבוד.
            </p>
          </div>

          <div className="w-full flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-6 px-6" dir="rtl">
            {GUIDED_IMAGERY_JOURNEYS.map((journey) => (
              <JourneyCard key={journey.id} journey={journey} onStart={startJourney} />
            ))}
          </div>
        </div>
      </main>

      {/* נגן המסע - תצוגה מלאה */}
      {activeJourney && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 select-none animate-in fade-in duration-300">
          <AmbientVideoBackground
            src={activeJourney.video}
            className="z-0"
            overlayClassName="bg-gradient-to-b from-slate-950/55 via-slate-950/40 to-slate-950/85"
          />

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes imagery-breathe { 0%, 100% { transform: scale(0.92); opacity: 0.5; } 50% { transform: scale(1.15); opacity: 0.9; } }
          ` }} />

          <header className="relative z-10 flex items-start justify-between gap-2 w-full max-w-lg mx-auto">
            <button
              onClick={exitJourney}
              className="shrink-0 px-3.5 sm:px-4 h-11 rounded-full bg-black/70 hover:bg-black/85 border border-white/20 flex items-center gap-1.5 text-white transition-all active:scale-95 shadow-lg backdrop-blur-md"
              aria-label="סגור מסע"
            >
              <X size={16} />
              <span className="text-xs font-black hidden xs:inline">סגור מסע</span>
            </button>
            <div className="min-w-0 flex-1 text-center px-1">
              <h3 className="font-black text-base sm:text-lg text-white drop-shadow-lg line-clamp-1">{activeJourney.title}</h3>
              {!isComplete && (
                <p className="text-[10px] text-slate-200 font-bold drop-shadow">זמן נותר: {formatTime(totalTimeLeft)}</p>
              )}
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleNarration}
                className={cn(
                  "w-9 h-9 rounded-full border flex items-center justify-center transition-all active:scale-95 backdrop-blur-md shadow-lg",
                  isNarrationMuted
                    ? "bg-rose-500/20 border-rose-500/30 text-rose-300 hover:bg-rose-500/30"
                    : "bg-black/40 border-white/15 text-white hover:bg-black/55"
                )}
                title={isNarrationMuted ? "הפעל הקראה" : "השתק הקראה"}
              >
                {isNarrationMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                type="button"
                onClick={toggleMusic}
                className={cn(
                  "w-9 h-9 rounded-full border flex items-center justify-center transition-all active:scale-95 backdrop-blur-md shadow-lg",
                  isMusicMuted
                    ? "bg-rose-500/20 border-rose-500/30 text-rose-300 hover:bg-rose-500/30"
                    : "bg-black/40 border-white/15 text-white hover:bg-black/55"
                )}
                title={isMusicMuted ? "הפעל מוזיקה" : "השתק מוזיקה"}
              >
                {isMusicMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </header>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full text-center">
            {!isComplete ? (
              <>
                {/* אורב נושם - אנימציה רכה לליווי הקצב */}
                <div className="relative w-36 h-36 mb-12 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full bg-indigo-400/20 blur-2xl"
                    style={{ animation: "imagery-breathe 10s ease-in-out infinite" }}
                  />
                  <div
                    className="absolute inset-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
                    style={{ animation: "imagery-breathe 10s ease-in-out infinite" }}
                  />
                </div>

                {/* Subtitles removed for distraction-free imagery as requested by user
                <div key={stepIndex} className="animate-in fade-in zoom-in-95 duration-[1500ms]">
                  <p className="text-xl md:text-3xl font-bold text-white leading-relaxed drop-shadow-lg max-w-md">
                    {activeJourney.steps[stepIndex].text}
                  </p>
                </div>
                */}
              </>
            ) : (
              <div className="text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20 shadow-2xl backdrop-blur-md">
                  <Sparkles size={48} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white drop-shadow-lg">המסע הסתיים</h2>
                  <p className="text-slate-200 font-bold max-w-xs mx-auto text-xs leading-relaxed drop-shadow">
                    {adjustGender("קח/י רגע נוסף לפני שתחזור/י לפעילות. שמור/י איתך את התחושה שיצרת לעצמך.", gender)}
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-4 items-center">
                  <Button
                    onClick={restartJourney}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-12 px-8 rounded-xl transition-all shadow-lg shadow-indigo-950/40 flex items-center gap-2"
                  >
                    <RotateCcw size={16} />
                    עוד פעם
                  </Button>
                  <button
                    onClick={exitJourney}
                    className="text-xs font-black text-white hover:text-indigo-200 transition-all px-4 py-2 rounded-full bg-black/70 hover:bg-black/85 border border-white/20 backdrop-blur-md shadow-lg"
                  >
                    חזרה לתפריט
                  </button>
                </div>
              </div>
            )}
          </div>

          <footer className="relative z-10 w-full max-w-lg mx-auto flex flex-col gap-5">
            {!isComplete && (
              <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden backdrop-blur-sm">
                <div
                  className="bg-indigo-400 h-full transition-all duration-1000"
                  style={{ width: `${(totalTimeLeft / getJourneyDuration(activeJourney)) * 100}%` }}
                />
              </div>
            )}

            {!isComplete && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-40 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-950/40"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={18} fill="currentColor" />
                      <span>השהה מסע</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} className="fill-current" />
                      <span>המשך מסע</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </footer>
        </div>
      )}
    </div>
  );
}
