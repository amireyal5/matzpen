"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Check, ChevronLeft, Sun, Moon, Volume2, Pause, Loader2, X, VolumeX, Sparkles } from "lucide-react";
import { BANK, CATS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { generateSpeech } from "@/ai/flows/tts-flow";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAmbientMixer } from "@/hooks/use-ambient-mixer";
import { SoundId } from "@/lib/ambient-sound-engine";
import AmbientVideoBackground from "@/components/AmbientVideoBackground";
import { AMBIENT_VIDEOS } from "@/lib/ambient-videos";

interface GuidedSessionProps {
  catKey: string;
  practiceIdx: number;
  gender: "m" | "f";
  onBack: () => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

export default function GuidedSession({ catKey, practiceIdx, gender, onBack, theme = "light", toggleTheme }: GuidedSessionProps) {
  const isLight = theme === "light";
  const [stepIdx, setStepIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // מניעת כיבוי מסך בזמן תרגול פעיל
  useWakeLock(!isFinished);

  const cat = CATS.find(c => c.key === catKey) || CATS[0];
  const practice = BANK[catKey]?.[practiceIdx] || BANK[catKey]?.[0];

  const g = (obj: any) => gender === 'f' ? (obj.f || obj.m) : (obj.m || obj.f);

  const steps = [
    { type: "intro", text: g(practice.why) },
    ...practice.steps.map(s => ({ type: "step", text: g(s) })),
    { 
      type: "outro", 
      text: g({ 
        m: "איך אתה מרגיש עכשיו? זכור שהכוח לוויסות נמצא תמיד בתוכך.", 
        f: "איך את מרגישה עכשיו? זכרי שהכוח לוויסות נמצא תמיד בתוכך." 
      }) 
    }
  ];

  const currentStep = steps[stepIdx];
  const progress = ((stepIdx + 1) / steps.length) * 100;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // ניהול מוזיקת רקע
  const { play, stop } = useAmbientMixer();
  const [isBgMusicPlaying, setIsBgMusicPlaying] = useState(true);

  const bgSoundMap: Record<string, SoundId> = {
    SOS: "ambient-calm",
    SLEEP: "dreamscape",
    BODY: "mind-relaxation",
    RESILIENCE: "hz-frequency-258",
    ACCEPTANCE: "calm-peaceful",
  };
  const bgSoundId: SoundId = bgSoundMap[catKey] || "autumn-sky";

  useEffect(() => {
    if (isBgMusicPlaying && !isFinished) {
      play(bgSoundId);
    } else {
      stop(bgSoundId);
    }
    return () => {
      stop(bgSoundId);
    };
  }, [isBgMusicPlaying, bgSoundId, isFinished, play, stop]);

  // הקראה אוטומטית בעת מעבר בין שלבים
  const activeStepRef = useRef<number>(0);
  
  useEffect(() => {
    // Cleanup any playing audio on step change
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
  }, [stepIdx, isFinished]);

  const handlePlayAudio = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      return;
    }

    setIsLoadingAudio(true);
    try {
      const { audioUri } = await generateSpeech({ text: currentStep.text, gender });
      const audio = new Audio(audioUri);
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoadingAudio(false);
        audioRef.current = null;
      };
      audioRef.current = audio;
      await audio.play();
    } catch (error) {
      console.error("שגיאה בהפעלת ההקראה:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleNext = () => {
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
    }
  };

  const toggleBgMusic = () => {
    setIsBgMusicPlaying(prev => !prev);
  };

  const videoSrc = catKey === "SOS" ? AMBIENT_VIDEOS[0] : 
                   catKey === "SLEEP" ? AMBIENT_VIDEOS[2] : 
                   AMBIENT_VIDEOS[1];

  if (isFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700 relative isolate bg-slate-950">
        <AmbientVideoBackground
          src={videoSrc}
          className="z-0"
          overlayClassName={isLight ? "bg-white/80" : "bg-slate-950/80"}
        />
        
        <div className="relative z-10">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse-soft" />
          <div className={cn(
            "w-24 h-24 rounded-[2rem] border-4 flex items-center justify-center p-5 relative overflow-hidden shadow-2xl animate-in zoom-in duration-500",
            isLight ? "bg-indigo-50 border-white text-indigo-600 shadow-indigo-100" : "bg-indigo-950/40 border-white/10 text-indigo-400"
          )}>
            <Check size={48} className="animate-bounce text-emerald-500" />
          </div>
        </div>
        
        <div className="space-y-4 max-w-sm relative z-10">
          <h2 className={cn("text-3xl font-headline font-black", isLight ? "text-slate-900" : "text-white")}>כל הכבוד על התרגול!</h2>
          <p className={cn("font-bold text-sm leading-relaxed", isLight ? "text-slate-600" : "text-slate-350")}>
            הקדשת זמן יקר לעצמך ולוויסות הפנימי שלך. זהו צעד משמעותי לבניית חוסן ושלווה.
          </p>
        </div>
        
        <Button
          onClick={onBack}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-16 px-12 rounded-[1.5rem] text-lg shadow-lg active:scale-95 transition-all relative z-10"
        >
          חזרה למסך הבית
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative isolate bg-slate-950 overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.2; }
          50% { transform: scale(1.15); opacity: 0.5; }
          100% { transform: scale(0.95); opacity: 0.2; }
        }
        .animate-pulse-ring { animation: pulse-ring 4s infinite ease-in-out; }
        @keyframes eq-bar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .eq-bar-1 { animation: eq-bar 0.8s ease-in-out infinite; }
        .eq-bar-2 { animation: eq-bar 0.5s ease-in-out -0.3s infinite; }
        .eq-bar-3 { animation: eq-bar 0.7s ease-in-out -0.15s infinite; }
      `}} />

      {/* רקע וידאו נופי מרגיע */}
      <AmbientVideoBackground
        src={videoSrc}
        className="z-0"
        overlayClassName={isLight ? "bg-white/75" : "bg-slate-950/75"}
      />

      {/* כותרת עליונה */}
      <header className={cn("relative z-10 p-6 flex items-center justify-between border-b backdrop-blur-md transition-colors duration-500", isLight ? "border-slate-200/60 bg-white/60" : "border-white/5 bg-slate-900/50")}>
        <button onClick={onBack} className={cn("flex items-center gap-2 text-xs font-black transition-colors", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-white")}>
          <X size={18} />
          יציאה
        </button>
        <div className="flex flex-col items-center">
          <span className={cn("text-[10px] font-black uppercase tracking-widest", isLight ? "text-indigo-600" : "text-indigo-400")}>{cat.label}</span>
          <span className={cn("text-sm font-bold", isLight ? "text-slate-900" : "text-white")}>{g(practice.t)}</span>
        </div>
        <div className="flex items-center gap-2">
          {toggleTheme && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-90",
                    isLight ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 shadow-sm" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  )}
                  aria-label={isLight ? "מצב כהה" : "מצב בהיר"}
                >
                  {isLight ? <Moon size={18} /> : <Sun size={18} />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isLight ? "מצב כהה" : "מצב בהיר"}</TooltipContent>
            </Tooltip>
          )}

          {/* שליטה במוזיקת רקע */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleBgMusic}
                className={cn(
                  "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-90",
                  isBgMusicPlaying
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    : isLight
                      ? "bg-slate-100 border-slate-200 text-slate-400"
                      : "bg-white/5 border-white/10 text-slate-500"
                )}
                aria-label="מוזיקת רקע"
              >
                {isBgMusicPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </TooltipTrigger>
            <TooltipContent>מוזיקת רקע</TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* מד התקדמות */}
      <div className="px-6 lg:px-12 pt-4 relative z-10">
        <Progress value={progress} className={cn("h-1 [&>div]:bg-indigo-500 transition-all duration-500", isLight ? "bg-slate-200" : "bg-white/5")} />
      </div>

      {/* תוכן ראשי מעוצב ככרטיסיית זכוכית מעופפת */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg lg:max-w-2xl mx-auto w-full relative z-10">
        <div className={cn(
          "w-full rounded-[2.5rem] p-8 border backdrop-blur-xl shadow-2xl flex flex-col justify-between items-center text-center space-y-8 transition-colors duration-500",
          isLight 
            ? "bg-white/80 border-slate-200/60 shadow-indigo-100/30" 
            : "bg-slate-900/60 border-white/10"
        )}>
          
          {/* הילת מיקוד מרכזית מונפשת */}
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-full blur-3xl scale-150 animate-pulse-ring",
              catKey === "SOS" ? "bg-amber-500/20" :
              catKey === "BODY" ? "bg-emerald-500/20" :
              catKey === "SLEEP" ? "bg-indigo-500/20" :
              catKey === "RESILIENCE" ? "bg-blue-500/20" :
              "bg-purple-500/20"
            )} />
            
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center border shadow-xl relative overflow-hidden transition-all duration-1000",
              isLight ? "bg-white border-slate-100" : "bg-slate-900/80 border-white/5"
            )}>
              <cat.icon size={36} style={{ color: cat.hue }} className={cn("relative z-10", isPlaying ? "scale-110" : "scale-100")} />
            </div>
          </div>

          {/* כיתוב והנחיה */}
          <div className="space-y-4 w-full">
            <div className={cn(
              "inline-block px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
              isLight 
                ? "bg-indigo-50 border-indigo-100 text-indigo-600" 
                : "bg-indigo-950/30 border-indigo-500/20 text-indigo-400"
            )}>
              {currentStep.type === "intro" ? "תובנה והכנה" : currentStep.type === "outro" ? "סיכום ומחשבה" : `שלב ${stepIdx}`}
            </div>
            
            <h3 className={cn(
              "text-xl md:text-2xl font-black leading-relaxed font-headline min-h-[5.5rem] flex items-center justify-center px-4 transition-all duration-500",
              isLight ? "text-slate-900" : "text-white"
            )}>
              {currentStep.text}
            </h3>
          </div>

          {/* הדמיית גלי הקראה ובקרת שמע */}
          <div className="space-y-4 w-full">
            <div className="flex justify-center items-center gap-1.5 h-6">
              {isPlaying ? (
                <>
                  <span className="w-1 bg-indigo-500 rounded-full eq-bar-1" style={{ height: "60%" }} />
                  <span className="w-1 bg-indigo-500 rounded-full eq-bar-2" style={{ height: "100%" }} />
                  <span className="w-1 bg-indigo-500 rounded-full eq-bar-3" style={{ height: "70%" }} />
                  <span className="w-1 bg-indigo-500 rounded-full eq-bar-2" style={{ height: "90%" }} />
                  <span className="w-1 bg-indigo-500 rounded-full eq-bar-1" style={{ height: "50%" }} />
                </>
              ) : (
                <div className={cn("h-[1px] w-24 rounded-full", isLight ? "bg-slate-200" : "bg-white/10")} />
              )}
            </div>

            <button
              onClick={handlePlayAudio}
              disabled={isLoadingAudio}
              className={cn(
                "mx-auto flex items-center gap-2.5 px-6 py-2.5 rounded-full border text-xs font-black transition-all active:scale-95 disabled:opacity-60 shadow-md",
                isLight ? "border-slate-200 text-slate-655 hover:bg-slate-100" : "border-white/10 text-slate-350 hover:bg-white/5"
              )}
            >
              {isLoadingAudio ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={16} className="text-indigo-400" />
              ) : (
                <Volume2 size={16} />
              )}
              {isLoadingAudio ? "טוען הקראה..." : isPlaying ? "השהה הקראה" : "הקראת מנחה"}
            </button>
          </div>
        </div>
      </main>

      {/* בקרת ניווט תחתונה */}
      <footer className="p-8 grid grid-cols-2 gap-4 max-w-lg lg:max-w-2xl mx-auto w-full relative z-10">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={stepIdx === 0}
          className={cn(
            "h-16 rounded-[1.5rem] font-bold disabled:opacity-30 border transition-all active:scale-95",
            isLight 
              ? "bg-white/80 border-slate-200 text-slate-500 hover:bg-slate-100 shadow-sm" 
              : "bg-slate-900/40 border-white/5 text-slate-400 hover:bg-white/5"
          )}
        >
          <ChevronLeft size={20} className="ml-2" />
          הקודם
        </Button>
        <Button
          onClick={handleNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-16 rounded-[1.5rem] text-lg shadow-lg active:scale-95 transition-all"
        >
          {stepIdx === steps.length - 1 ? "סיום" : "המשך"}
          {stepIdx < steps.length - 1 && <Check size={20} className="mr-2" />}
        </Button>
      </footer>
    </div>
  );
}
