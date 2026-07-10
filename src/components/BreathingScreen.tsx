"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Flower2, Play, Sparkles, Sun, Moon, Wind, Music, VolumeX, Volume2, Pause, Repeat, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { useAmbientMixer } from "@/hooks/use-ambient-mixer";
import { SoundId } from "@/lib/ambient-sound-engine";
import { AMBIENT_VIDEOS } from "@/lib/ambient-videos";
import AmbientVideoBackground from "@/components/AmbientVideoBackground";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { BREATHING_EXERCISES, BreathingExercise } from "@/lib/breathing-exercises";

// מיפוי כל סגנון תרגול נשימה לסרטון נוף מרגיע מתאים
const BREATHING_VIDEO_BY_STYLE: Record<BreathingExercise["style"], string> = {
  "grounding-glow": AMBIENT_VIDEOS[0],
  "glow-circle": AMBIENT_VIDEOS[0],
  "flower": AMBIENT_VIDEOS[1],
  "mandala": AMBIENT_VIDEOS[1],
  "nebula": AMBIENT_VIDEOS[2],
};

interface BreathingScreenProps {
  onBack: () => void;
  initialBreathingId?: string;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

interface BreathingCardProps {
  exercise: BreathingExercise;
  onStart: (exercise: BreathingExercise) => void;
}

function BreathingCard({ exercise, onStart }: BreathingCardProps) {
  const [imageError, setImageError] = useState(false);
  const Icon = exercise.style === "glow-circle" ? Sun :
               exercise.style === "flower" ? Flower2 :
               exercise.style === "mandala" ? Sparkles : Wind;

  return (
    <div
      className="snap-start w-[72vw] xs:w-[75vw] sm:w-[280px] md:w-auto h-56 rounded-[2rem] overflow-hidden group border border-white/10 hover:border-emerald-500/30 transition-all duration-500 shadow-xl flex flex-col justify-between p-6 shrink-0 md:shrink relative"
    >
      {/* תמונת רקע איכותית או גרדיאנט רקע */}
      <div className="absolute inset-0 z-0">
        {!imageError ? (
          <Image
            src={exercise.image}
            alt={exercise.title}
            fill
            className="object-cover transition-transform duration-700 brightness-[0.25] group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 transition-all duration-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      <div className="relative z-10 space-y-2">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center backdrop-blur-md">
            <Icon size={18} />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-black text-emerald-400 px-2.5 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/10">
              {exercise.rhythmText}
            </span>
            {exercise.recommendedSoundId && (
              <span className="text-[8px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <Music size={8} />
                סאונד מובנה
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors leading-tight">{exercise.title}</h4>
          <p className="text-[10px] text-slate-300 font-medium leading-relaxed mt-1 opacity-90 line-clamp-2">{exercise.description}</p>
        </div>
      </div>

      <div className="relative z-10 flex gap-2 items-center">
        {/* תצוגת מקטעי נשימה */}
        <div className="flex flex-wrap gap-1 flex-1 justify-start">
          {exercise.pattern.map((p, idx) => (
            <span key={idx} className="text-[8px] text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 font-semibold">
              {p.type === "inhale" ? "שאף" : p.type === "hold" ? "החזק" : "נשוף"} ({p.duration}ש׳)
            </span>
          ))}
        </div>

        <Button
          onClick={() => onStart(exercise)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black h-9 px-4 rounded-xl text-[10px] transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/45"
        >
          <Play size={10} className="fill-current translate-x-[0.5px]" />
          התחל
        </Button>
      </div>
    </div>
  );
}

export default function BreathingScreen({ onBack, initialBreathingId, theme = "light", toggleTheme }: BreathingScreenProps) {
  const isLight = theme === "light";
  useWakeLock(true);

  const {
    play,
    stop,
  } = useAmbientMixer();

  // מצבי נשימה אינטראקטיבית
  const [activeExercise, setActiveExercise] = useState<BreathingExercise | null>(null);
  const [isBreathingPlaying, setIsBreathingPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepTimeLeft, setStepTimeLeft] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [introCountdown, setIntroCountdown] = useState<number | null>(null);
  const [autoPlayedSoundId, setAutoPlayedSoundId] = useState<SoundId | null>(null);
  const [isBgMusicMuted, setIsBgMusicMuted] = useState(false);
  const [isBreathingSoundMuted, setIsBreathingSoundMuted] = useState(false);

  const lastStepIndexRef = useRef<number>(-1);

  // התחלת תרגול
  const startBreathing = (exercise: BreathingExercise) => {
    setActiveExercise(exercise);
    setIntroCountdown(3);
    setIsBreathingPlaying(false);
    setCurrentStepIndex(0);
    setStepTimeLeft(exercise.pattern[0].duration);
    setTotalTimeLeft(exercise.totalDuration);

    // הפעלה אוטומטית של מוזיקה מרגיעה אם היא מקושרת לתרגיל ואינה מושתקת
    if (exercise.recommendedSoundId) {
      if (!isBgMusicMuted) {
        play(exercise.recommendedSoundId);
      }
      setAutoPlayedSoundId(exercise.recommendedSoundId);
    }
  };

  const closeBreathing = () => {
    if (autoPlayedSoundId) {
      stop(autoPlayedSoundId);
      setAutoPlayedSoundId(null);
    }
    stopActiveBreathSounds();
    setActiveExercise(null);
    setIsBreathingPlaying(false);
    setIntroCountdown(null);
  };

  const toggleBreathingPlay = () => {
    setIsBreathingPlaying(!isBreathingPlaying);
  };

  const restartBreathing = () => {
    if (!activeExercise) return;
    setIntroCountdown(3);
    setIsBreathingPlaying(false);
    setCurrentStepIndex(0);
    setStepTimeLeft(activeExercise.pattern[0].duration);
    setTotalTimeLeft(activeExercise.totalDuration);

    if (activeExercise.recommendedSoundId) {
      if (!isBgMusicMuted) {
        play(activeExercise.recommendedSoundId);
      }
      setAutoPlayedSoundId(activeExercise.recommendedSoundId);
    }
  };

  const toggleBgMusic = () => {
    if (!activeExercise || !activeExercise.recommendedSoundId) return;
    const soundId = activeExercise.recommendedSoundId;
    if (isBgMusicMuted) {
      play(soundId);
      setIsBgMusicMuted(false);
    } else {
      stop(soundId);
      setIsBgMusicMuted(true);
    }
  };

  const activeOscillatorsRef = useRef<any[]>([]);
  const breathAudioContextRef = useRef<AudioContext | null>(null);

  const stopActiveBreathSounds = () => {
    activeOscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    activeOscillatorsRef.current = [];
  };

  const playBreathBellSound = (type: "inhale" | "exhale", duration: number) => {
    stopActiveBreathSounds();

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!breathAudioContextRef.current) {
        breathAudioContextRef.current = new AudioContextClass();
      }
      const ctx = breathAudioContextRef.current;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const now = ctx.currentTime;
      
      const chordFreqs = type === "inhale"
        ? [293.66, 369.99, 440.00, 554.37, 659.25] // D4, F#4, A4, C#5, E5 (אקורד Dmaj9 שמיימי ומעורר שאיפה)
        : [261.63, 329.63, 392.00, 587.33, 783.99]; // C4, E4, G4, D5, G5 (אקורד Cadd9 מקרקע ומרגיע נשיפה)
      
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, now);

      const rippleGain = ctx.createGain();
      rippleGain.gain.setValueAtTime(0.65, now);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(2.0, now);
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.35, now);
      
      lfo.connect(lfoGain);
      lfoGain.connect(rippleGain.gain);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      
      masterGain.gain.linearRampToValueAtTime(0.06, now + 0.4);
      masterGain.gain.setValueAtTime(0.06, now + duration - 0.7);
      masterGain.gain.linearRampToValueAtTime(0.001, now + duration);
      
      filter.connect(rippleGain);
      rippleGain.connect(masterGain);
      masterGain.connect(ctx.destination);
      
      const oscNodes: any[] = [];
      const oscGains = [0.25, 0.18, 0.14, 0.09, 0.05];
      
      chordFreqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        
        const detune = (Math.random() - 0.5) * 1.0;
        osc.frequency.setValueAtTime(freq + detune, now);
        
        if (type === "inhale") {
          osc.frequency.exponentialRampToValueAtTime((freq + detune) * 1.01, now + duration);
        } else {
          osc.frequency.exponentialRampToValueAtTime((freq + detune) * 0.99, now + duration);
        }
        
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(oscGains[index] || 0.05, now);
        
        osc.connect(oscGain);
        oscGain.connect(filter);
        
        osc.start(now);
        osc.stop(now + duration);
        oscNodes.push(osc);
      });
      
      lfo.start(now);
      lfo.stop(now + duration);
      
      activeOscillatorsRef.current = [...oscNodes, lfo];
      
    } catch(e) {
      console.warn("Web Audio chime synth error:", e);
    }
  };

  useEffect(() => {
    if (!activeExercise || !isBreathingPlaying || introCountdown !== null) {
      stopActiveBreathSounds();
      lastStepIndexRef.current = -1;
      return;
    }
    
    if (currentStepIndex !== lastStepIndexRef.current) {
      lastStepIndexRef.current = currentStepIndex;
      const step = activeExercise.pattern[currentStepIndex];
      
      if (!isBreathingSoundMuted && (step.type === "inhale" || step.type === "exhale")) {
        playBreathBellSound(step.type, step.duration);
      } else {
        stopActiveBreathSounds();
      }
    }
  }, [currentStepIndex, isBreathingPlaying, activeExercise, introCountdown, isBreathingSoundMuted]);

  useEffect(() => {
    return () => {
      stopActiveBreathSounds();
      if (breathAudioContextRef.current) {
        breathAudioContextRef.current.close().catch(() => {});
        breathAudioContextRef.current = null;
      }
    };
  }, []);

  // טעינה ראשונית של פרמטרים
  useEffect(() => {
    if (initialBreathingId) {
      const exercise = BREATHING_EXERCISES.find((e) => e.id === initialBreathingId);
      if (exercise) {
        const timer = setTimeout(() => {
          startBreathing(exercise);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [initialBreathingId]);

  const getScaleAndTransition = () => {
    if (!activeExercise) return { scale: 1, duration: 0 };
    const step = activeExercise.pattern[currentStepIndex];
    const duration = step.duration;

    if (step.type === "inhale") {
      return { scale: 1.8, duration };
    } else if (step.type === "exhale") {
      return { scale: 1.0, duration };
    } else {
      // hold – שמירה על סקייל השלב הקודם (מלא אחרי שאיפה, ריק אחרי נשיפה)
      const prevIdx = (currentStepIndex - 1 + activeExercise.pattern.length) % activeExercise.pattern.length;
      const prevStep = activeExercise.pattern[prevIdx];
      return { scale: prevStep.type === "inhale" ? 1.8 : 1.0, duration };
    }
  };

  useEffect(() => {
    if (activeExercise && introCountdown !== null && introCountdown > 0) {
      const timer = setTimeout(() => {
        setIntroCountdown(introCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (activeExercise && introCountdown === 0) {
      setIntroCountdown(null);
      setIsBreathingPlaying(true);
    }
  }, [activeExercise, introCountdown]);

  useEffect(() => {
    if (!activeExercise || !isBreathingPlaying || introCountdown !== null) return;

    const interval = setInterval(() => {
      if (totalTimeLeft <= 1) {
        setTotalTimeLeft(0);
        setIsBreathingPlaying(false);
        return;
      }

      setTotalTimeLeft(totalTimeLeft - 1);

      if (stepTimeLeft <= 1) {
        const nextIdx = (currentStepIndex + 1) % activeExercise.pattern.length;
        setCurrentStepIndex(nextIdx);
        setStepTimeLeft(activeExercise.pattern[nextIdx].duration);
      } else {
        setStepTimeLeft(stepTimeLeft - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExercise, isBreathingPlaying, introCountdown, totalTimeLeft, stepTimeLeft, currentStepIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-slate-950 text-white")}>
      <header className={cn("p-6 flex items-center justify-between border-b backdrop-blur-md z-10 transition-colors duration-500", isLight ? "border-slate-200 bg-white/60" : "border-white/5 bg-slate-900/50")}>
        <button onClick={onBack} className={cn("flex items-center gap-2 text-xs font-black transition-colors", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-white")}>
          <ArrowRight size={18} />
          חזרה למסך הבית
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">תרגולי נשימה</span>
          <span className={cn("text-sm font-bold", isLight ? "text-slate-900" : "text-white")}>ויסות והרגעה</span>
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

      <main className="flex-1 flex flex-col items-center p-6 max-w-4xl lg:max-w-5xl mx-auto w-full space-y-8 pb-16">
        <div className="relative pt-4">
          <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full transition-opacity opacity-60" />
          <div className="relative w-28 h-28 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-2xl">
            <Wind size={52} className="animate-in fade-in zoom-in duration-1000" />
          </div>
        </div>

        <div className="w-full space-y-8 animate-in fade-in duration-300 flex flex-col items-center">
          <div className="text-center space-y-3">
            <h2 className={cn("text-3xl font-black tracking-tight leading-tight transition-colors", isLight ? "text-slate-900" : "text-white")}>תרגולי נשימה וקרקוע</h2>
            <p className={cn("font-bold leading-relaxed max-w-md mx-auto text-xs", isLight ? "text-slate-500" : "text-slate-400")}>
              תרגילים אינטראקטיביים עם הנחיות קצב ויזואליות מונחות להרגעה, פוקוס, הפחתת חרדה וויסות עוררות יתר.
            </p>
          </div>

          {/* גריד תרגילים */}
          <div className="w-full flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-6 px-6" dir="rtl">
            {BREATHING_EXERCISES.map((exercise) => (
              <BreathingCard
                key={exercise.id}
                exercise={exercise}
                onStart={startBreathing}
              />
            ))}
          </div>

          {/* בקרוב: מדיטציות מונחות */}
          <div className={cn("w-full space-y-4 pt-6 border-t transition-colors", isLight ? "border-slate-200" : "border-white/5")}>
            <h3 className={cn("text-xs font-black text-center", isLight ? "text-slate-500" : "text-slate-400")}>בקרוב: מדיטציות מונחות בקול עמיר אייל</h3>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={cn("p-5 rounded-[2rem] border flex items-center gap-6 opacity-60 cursor-not-allowed transition-colors", isLight ? "bg-slate-100/70 border-slate-200" : "bg-white/5 border-white/10")}>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Play size={20} className="fill-current" />
                </div>
                <div className="text-right">
                  <span className={cn("block font-bold", isLight ? "text-slate-900" : "text-white")}>נשימה מונחית לשלווה</span>
                  <span className={cn("block text-xs", isLight ? "text-slate-400" : "text-slate-500")}>10 דקות • עמיר אייל</span>
                </div>
              </div>

              <div className={cn("p-5 rounded-[2rem] border flex items-center gap-6 opacity-60 cursor-not-allowed transition-colors", isLight ? "bg-slate-100/70 border-slate-200" : "bg-white/5 border-white/10")}>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Play size={20} className="fill-current" />
                </div>
                <div className="text-right">
                  <span className={cn("block font-bold", isLight ? "text-slate-900" : "text-white")}>סריקת גוף להרפיה עמוקה</span>
                  <span className={cn("block text-xs", isLight ? "text-slate-400" : "text-slate-500")}>15 דקות • עמיר אייל</span>
                </div>
              </div>
            </div>
          </div>
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

      {/* מודל תרגול נשימה אינטראקטיבי */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 select-none animate-in fade-in duration-300">
          <AmbientVideoBackground
            src={BREATHING_VIDEO_BY_STYLE[activeExercise.style]}
            className="z-0"
            overlayClassName={cn("bg-gradient-to-b opacity-70", activeExercise.bgGradient)}
          />
          
          {activeExercise.style === "glow-circle" && (
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="50,0 20,100 35,100" fill="url(#rayGrad)" className="animate-[pulse_8s_ease-in-out_infinite]" />
                <polygon points="50,0 65,100 80,100" fill="url(#rayGrad)" className="animate-[pulse_12s_ease-in-out_infinite_2s]" />
                <polygon points="50,0 42,100 48,100" fill="url(#rayGrad)" className="animate-[pulse_10s_ease-in-out_infinite_1s]" />
                <defs>
                  <linearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}

          {activeExercise.style === "grounding-glow" && (
            <div className="absolute inset-0 z-0 opacity-15 pointer-events-none mix-blend-screen overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="50,100 20,0 35,0" fill="url(#goldRayGrad)" className="animate-[pulse_10s_ease-in-out_infinite]" />
                <polygon points="50,100 65,0 80,0" fill="url(#goldRayGrad)" className="animate-[pulse_15s_ease-in-out_infinite_3s]" />
                <defs>
                  <linearGradient id="goldRayGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}

          <header className="relative z-10 flex justify-between items-center w-full max-w-lg mx-auto">
            <button
              onClick={closeBreathing}
              className="px-4 h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm backdrop-blur-md"
              aria-label="סגור תרגול"
            >
              <X size={16} />
              <span className="text-xs font-black">סגור תרגול</span>
            </button>
            <div className="text-right">
              <h3 className="font-black text-lg text-white">{activeExercise.title}</h3>
              {totalTimeLeft > 0 && (
                <p className="text-[10px] text-slate-400 font-bold">זמן נותר: {formatTime(totalTimeLeft)}</p>
              )}
            </div>
          </header>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
            {introCountdown !== null ? (
              <div className="text-center space-y-6 animate-in zoom-in duration-300">
                <p className="text-lg font-bold text-slate-300">היכון לתחילת התרגול...</p>
                <div className="text-8xl font-black text-emerald-400 animate-pulse transition-all">
                  {introCountdown === 0 ? "התחל" : introCountdown}
                </div>
                <p className="text-xs text-slate-500 font-bold">מצא תנוחה נוחה ונשום עמוק</p>
              </div>
            ) : totalTimeLeft === 0 ? (
              <div className="text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xl">
                  <Sparkles size={48} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white">כל הכבוד!</h2>
                  <p className="text-slate-400 font-bold max-w-xs mx-auto text-xs leading-relaxed">
                    השלמת את תרגול הנשימה בהצלחה. הגוף והנפש שלך מודים לך על רגעי השקט האלו.
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-4 items-center">
                  <Button
                    onClick={restartBreathing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 px-8 rounded-xl transition-all shadow-lg shadow-emerald-950/40"
                  >
                    תרגל שוב
                  </Button>
                  <button
                    onClick={closeBreathing}
                    className="text-xs font-black text-slate-500 hover:text-white transition-colors"
                  >
                    חזרה לתפריט
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center space-y-12">
                <div className="h-72 flex items-center justify-center w-full">
                  {activeExercise.style === "glow-circle" && (
                    <div
                      className="relative flex items-center justify-center rounded-full"
                      style={{
                        width: "10rem",
                        height: "10rem",
                        transform: `scale(${getScaleAndTransition().scale})`,
                        transition: `transform ${getScaleAndTransition().duration}s ease-in-out`,
                      }}
                    >
                      <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl" />
                      <div className="w-full h-full rounded-full border border-blue-400/30 bg-blue-400/10 shadow-[0_0_60px_rgba(56,189,248,0.35)] backdrop-blur-md flex items-center justify-center">
                        <div className="w-2/3 h-2/3 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 opacity-80 shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]" />
                      </div>
                    </div>
                  )}

                  {activeExercise.style === "flower" && (
                    <div
                      className="relative w-40 h-40 flex items-center justify-center"
                      style={{
                        transform: `scale(${getScaleAndTransition().scale})`,
                        transition: `transform ${getScaleAndTransition().duration}s ease-in-out`,
                      }}
                    >
                      <div className="absolute w-48 h-48 rounded-full bg-rose-500/10 blur-3xl" />
                      {Array.from({ length: 6 }).map((_, i) => {
                        const baseRotation = i * 60;
                        const openRotation = baseRotation + (getScaleAndTransition().scale > 1.2 ? 15 : 0);
                        return (
                          <div
                            key={i}
                            className="absolute w-14 h-24 rounded-full bg-gradient-to-t from-rose-500/30 to-pink-400/20 border border-pink-300/30 origin-bottom mix-blend-screen backdrop-blur-[2px]"
                            style={{
                              transform: `rotate(${openRotation}deg) translateY(-8px) scale(${getScaleAndTransition().scale > 1.2 ? 1.05 : 0.95})`,
                              transition: `transform ${getScaleAndTransition().duration}s ease-in-out`,
                              bottom: "50%",
                            }}
                          />
                        );
                      })}
                      <div className="absolute w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 blur-[1px] shadow-[0_0_15px_rgba(251,191,36,0.5)] z-10" />
                    </div>
                  )}

                  {activeExercise.style === "mandala" && (
                    <div
                      className="relative w-40 h-40 flex items-center justify-center"
                      style={{
                        transform: `scale(${getScaleAndTransition().scale})`,
                        transition: `transform ${getScaleAndTransition().duration}s ease-in-out`,
                      }}
                    >
                      <div className="absolute w-48 h-48 rounded-full bg-violet-600/10 blur-3xl" />
                      <svg className="w-full h-full text-teal-400/80 stroke-[0.75] fill-none animate-[spin_40s_linear_infinite]" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="90" className="stroke-teal-500/30" />
                        <circle cx="100" cy="100" r="60" className="stroke-violet-500/40" />
                        <circle cx="100" cy="100" r="30" className="stroke-fuchsia-500/50" />
                        {Array.from({ length: 8 }).map((_, i) => (
                          <g key={i} transform={`rotate(${i * 45} 100 100)`}>
                            <rect x="50" y="50" width="100" height="100" className="stroke-teal-400/50" />
                            <polygon points="100,30 150,150 50,150" className="stroke-violet-400/30" />
                          </g>
                        ))}
                        <circle cx="100" cy="100" r="8" className="fill-teal-300 stroke-none" />
                      </svg>
                    </div>
                  )}

                  {activeExercise.style === "nebula" && (
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <div
                        className="absolute rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 blur-2xl transition-all"
                        style={{
                          width: "5rem",
                          height: "5rem",
                          transform: `scale(${activeExercise.pattern[currentStepIndex].type === "exhale" ? 0.6 : 1.6})`,
                          opacity: activeExercise.pattern[currentStepIndex].type === "exhale" ? 0.3 : 0.8,
                          transition: `transform ${getScaleAndTransition().duration}s ease-in-out, opacity ${getScaleAndTransition().duration}s ease-in-out`,
                        }}
                      />
                      {Array.from({ length: 16 }).map((_, i) => {
                        const angle = (i * 2 * Math.PI) / 16;
                        const isExhale = activeExercise.pattern[currentStepIndex].type === "exhale";
                        const r = isExhale ? 80 : 25;
                        const x = Math.cos(angle) * r;
                        const y = Math.sin(angle) * r;
                        return (
                          <div
                            key={i}
                            className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                            style={{
                              transform: `translate(${x}px, ${y}px) scale(${isExhale ? 0.7 : 1.25})`,
                              opacity: isExhale ? 0.25 : 0.85,
                              transition: `transform ${getScaleAndTransition().duration}s ease-in-out, opacity ${getScaleAndTransition().duration}s ease-in-out`,
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {activeExercise.style === "grounding-glow" && (
                    <div
                      className="relative flex items-center justify-center rounded-full"
                      style={{
                        width: "10rem",
                        height: "10rem",
                        transform: `scale(${getScaleAndTransition().scale})`,
                        transition: `transform ${getScaleAndTransition().duration}s ease-in-out`,
                      }}
                    >
                      <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
                      <div className="w-full h-full rounded-full border border-amber-400/40 bg-amber-500/10 shadow-[0_0_60px_rgba(245,158,11,0.35)] backdrop-blur-md flex items-center justify-center">
                        <div className="w-2/3 h-2/3 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500 opacity-85 shadow-[inset_0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center">
                          <div className="w-1/2 h-1/2 rounded-full bg-white/20 blur-[2px] animate-pulse" />
                        </div>
                      </div>
                      
                      {activeExercise.pattern[currentStepIndex].type === "exhale" && (
                        <>
                          <div className="absolute border border-amber-400/30 rounded-full animate-[ping_3s_linear_infinite] w-full h-full" />
                          <div className="absolute border border-amber-500/20 rounded-full animate-[ping_4.5s_linear_infinite] w-full h-full" />
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-black text-white tracking-tight animate-pulse min-h-[3rem]">
                    {activeExercise.pattern[currentStepIndex].label}
                  </h2>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-5xl font-black text-emerald-400">
                      {stepTimeLeft}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">שניות לשלב הבא</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <footer className="relative z-10 w-full max-w-lg mx-auto flex flex-col gap-5">
            {introCountdown === null && totalTimeLeft > 0 && (
              <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-1000"
                  style={{ width: `${(totalTimeLeft / activeExercise.totalDuration) * 100}%` }}
                />
              </div>
            )}

            <div className="flex justify-center items-center gap-4">
              {introCountdown === null && totalTimeLeft > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsBreathingSoundMuted(!isBreathingSoundMuted)}
                    className={cn(
                      "w-11 h-11 rounded-full border flex items-center justify-center transition-all active:scale-95 shadow-md",
                      isBreathingSoundMuted 
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20" 
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                    title={isBreathingSoundMuted ? "הפעל צלילי נשימה" : "השתק צלילי נשימה"}
                  >
                    {isBreathingSoundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>

                  <button
                    onClick={restartBreathing}
                    className="w-11 h-11 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md"
                    title="התחל מחדש"
                  >
                    <Repeat size={18} />
                  </button>

                  <button
                    onClick={toggleBreathingPlay}
                    className="w-40 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-950/40"
                  >
                    {isBreathingPlaying ? (
                      <>
                        <Pause size={18} fill="currentColor" />
                        <span>השהה תרגול</span>
                      </>
                    ) : (
                      <>
                        <Play size={18} className="fill-current" />
                        <span>המשך תרגול</span>
                      </>
                    )}
                  </button>

                  {activeExercise.recommendedSoundId && (
                    <button
                      type="button"
                      onClick={toggleBgMusic}
                      className={cn(
                        "w-11 h-11 rounded-full border flex items-center justify-center transition-all active:scale-95 shadow-md",
                        isBgMusicMuted 
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20" 
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                      )}
                      title={isBgMusicMuted ? "הפעל מוזיקת רקע" : "השתק מוזיקת רקע"}
                    >
                      {isBgMusicMuted ? <VolumeX size={18} /> : <Music size={18} />}
                    </button>
                  )}
                </>
              )}
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
