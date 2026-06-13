"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Flower2, Play, Sparkles, Disc3, Bell, Heart, Sun, Moon, Wind, Music, VolumeX, Volume2, Pause, Repeat, Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { useAmbientMixer } from "@/hooks/use-ambient-mixer";
import { SoundId, SoundDefinition } from "@/lib/ambient-sound-engine";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MeditationScreenProps {
  onBack: () => void;
  initialTab?: "sounds" | "breathing";
  initialSoundId?: SoundId;
  initialBreathingId?: string;
}

import { BREATHING_EXERCISES, BreathingExercise } from "@/lib/breathing-exercises";

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

const SOUND_STYLES: Record<SoundId, {
  icon: typeof Disc3;
  accent: string;
  bg: string;
  border: string;
  accentClass: string;
}> = {
  "tibetan-bowl": { icon: Bell, accent: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", accentClass: "accent-amber-400" },
  "tibetan-singing-bowl-journey": { icon: Wind, accent: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", accentClass: "accent-orange-400" },
  "angelic": { icon: Sparkles, accent: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", accentClass: "accent-rose-400" },
  "mind-relaxation": { icon: Heart, accent: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", accentClass: "accent-purple-400" },
  "dreamscape": { icon: Moon, accent: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30", accentClass: "accent-indigo-400" },
  "calm-peaceful": { icon: Sun, accent: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", accentClass: "accent-yellow-400" },
  "autumn-sky": { icon: Music, accent: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", accentClass: "accent-blue-400" },
  "hz-frequency-258": { icon: Disc3, accent: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", accentClass: "accent-emerald-400" },
  "ambient-calm": { icon: Flower2, accent: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30", accentClass: "accent-teal-400" },
};

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
      {/* תמונת רקע איכותית או גרדיאנט רקע כגיבוי במידה והתמונה לא נטענת */}
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

      {/* חלק עליון של הכרטיסייה: מידע ואינדיקטורים */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="text-right">
          <span className="block font-black text-lg text-white leading-snug">{sound.label}</span>
          <span className="block text-xs text-slate-300 font-medium opacity-90">{sound.description}</span>
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

      {/* חלק תחתון של הכרטיסייה: כפתורי שליטה */}
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
      {/* תמונת רקע איכותית או גרדיאנט רקע כגיבוי */}
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
        {/* תצוגת מקטעי נשימה (אינפורמטיבי) */}
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

export default function MeditationScreen({ 
  onBack,
  initialTab,
  initialSoundId,
  initialBreathingId
}: MeditationScreenProps) {
  // שמירה על מסך דולק בזמן שהות במסך המדיטציה
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

  const [activeTab, setActiveTab] = useState<"sounds" | "breathing">("sounds");

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
    // עצירה של המוזיקה שנוגנה אוטומטית בעת סגירה
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

    // הפעלה מחדש של המוזיקה המקושרת אם אינה מושתקת
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
      
      // תדרים ליצירת אקורד פעמון עשיר ועדין
      const chordFreqs = type === "inhale"
        ? [293.66, 369.99, 440.00, 554.37, 659.25] // D4, F#4, A4, C#5, E5 (אקורד Dmaj9 שמיימי ומעורר שאיפה)
        : [261.63, 329.63, 392.00, 587.33, 783.99]; // C4, E4, G4, D5, G5 (אקורד Cadd9 מקרקע ומרגיע נשיפה)
      
      // פילטר חום למניעת צלילים חדים מדי בתדרים גבוהים
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, now);

      // גיין אדווה (Ripple Gain) - מושפע ממתנד LFO ליצירת הרעדה הרמונית של כל האקורד
      const rippleGain = ctx.createGain();
      rippleGain.gain.setValueAtTime(0.65, now);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(2.0, now); // 2.0Hz אדווה - 2 מחזורים בשנייה
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.35, now); // עומק אדווה מבוקר
      
      lfo.connect(lfoGain);
      lfoGain.connect(rippleGain.gain);

      // גיין ראשי לניהול המעטפת (Envelope) לאורך כל משך השלב
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      
      // כניסה הדרגתית אך מהירה לפעמון (strike) תוך 0.4 שניות
      masterGain.gain.linearRampToValueAtTime(0.06, now + 0.4);
      // שמירה על עוצמה יציבה לאורך כל שלב הנשימה
      masterGain.gain.setValueAtTime(0.06, now + duration - 0.7);
      // דעיכה חלקה לגמרי בסוף השלב
      masterGain.gain.linearRampToValueAtTime(0.001, now + duration);
      
      // שרשור החיבורים: Oscillators -> Filter -> RippleGain -> MasterGain -> Destination
      filter.connect(rippleGain);
      rippleGain.connect(masterGain);
      masterGain.connect(ctx.destination);
      
      const oscNodes: any[] = [];
      const oscGains = [0.25, 0.18, 0.14, 0.09, 0.05]; // הרמוניות גבוהות יותר חלשות יותר לקבלת מרקם רך
      
      chordFreqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        
        // כיוונון עדין (detuning) אקראי ליצירת צליל חם ומקהלתי (shimmer/chorus)
        const detune = (Math.random() - 0.5) * 1.0;
        osc.frequency.setValueAtTime(freq + detune, now);
        
        // ירידה/עלייה עדינה של התדר לחיבור תחושתי עמוק
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

  // מעקב אחר שלבי הנשימה לניגון צליל הנחיה
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

  // ניקוי של הצלילים ביציאה מהתרגול או מהרכיב
  useEffect(() => {
    return () => {
      stopActiveBreathSounds();
      if (breathAudioContextRef.current) {
        breathAudioContextRef.current.close().catch(() => {});
        breathAudioContextRef.current = null;
      }
    };
  }, []);

  // טעינה ראשונית של פרמטרים מדף הבית
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    if (initialSoundId) {
      play(initialSoundId);
    }
    if (initialBreathingId) {
      const exercise = BREATHING_EXERCISES.find((e) => e.id === initialBreathingId);
      if (exercise) {
        const timer = setTimeout(() => {
          startBreathing(exercise);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [initialTab, initialSoundId, initialBreathingId, play]);

  const getScaleAndTransition = () => {
    if (!activeExercise) return { scale: 1, duration: 0 };
    const step = activeExercise.pattern[currentStepIndex];
    let scale = 1;
    if (step.type === "inhale") {
      scale = 1.8;
    } else if (step.type === "hold") {
      scale = 1.85;
    } else {
      scale = 1.0;
    }
    return {
      scale,
      duration: step.duration
    };
  };

  // טיימר הכנה לתרגול (3 שניות)
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

  // לולאת הנשימה הראשית
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

  // פורמט זמן עבור הצגת ספירה לאחור של טיימר
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* אנימציית גל קול מותאמת אישית וניקוי גלילה של מובייל */}
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
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">מרחב השקט</span>
          <span className="text-sm font-bold">מדיטציה ומיינדפולנס</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden relative">
          <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 max-w-4xl mx-auto w-full space-y-8 pb-16">
        <div className="relative pt-4">
          <div className={cn("absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full transition-opacity", isAnyPlaying ? "animate-pulse opacity-100" : "opacity-60")} />
          <div className="relative w-28 h-28 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-2xl">
            <Flower2 size={56} className={cn("animate-in fade-in zoom-in duration-1000", isAnyPlaying && "animate-pulse")} />
          </div>
        </div>

        {/* בורר כרטיסיות (Segmented Control Tabs) בסגנון מסחרי יוקרתי */}
        <div className="w-full max-w-md mx-auto p-1 bg-white/5 border border-white/10 rounded-2xl flex relative backdrop-blur-md shadow-inner">
          {/* סמן מונפש זורם */}
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-emerald-400 rounded-xl transition-all duration-300 ease-out z-0"
            style={{
              right: activeTab === "sounds" ? "4px" : "calc(50% + 0px)",
            }}
          />
          <button
            onClick={() => setActiveTab("sounds")}
            className={cn(
              "flex-1 py-2.5 text-xs font-black transition-all rounded-xl relative z-10 flex items-center justify-center gap-2",
              activeTab === "sounds" ? "text-slate-950 font-black scale-[1.02]" : "text-slate-400 hover:text-white"
            )}
          >
            <Music size={14} />
            צלילי מרחב
          </button>
          <button
            onClick={() => setActiveTab("breathing")}
            className={cn(
              "flex-1 py-2.5 text-xs font-black transition-all rounded-xl relative z-10 flex items-center justify-center gap-2",
              activeTab === "breathing" ? "text-slate-950 font-black scale-[1.02]" : "text-slate-400 hover:text-white"
            )}
          >
            <Wind size={14} />
            תרגולי נשימה
          </button>
        </div>

        {activeTab === "sounds" ? (
          /* דף צלילים ומוזיקה */
          <div className="w-full space-y-8 animate-in fade-in duration-300 flex flex-col items-center">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black tracking-tight leading-tight">צלילים לשלווה פנימית</h2>
              <p className="text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
                בחר את צליל הרקע המועדף עליך להתכנסות ומדיטציה עמוקה.
              </p>
            </div>

            {/* כרטיסיית טיימר כיבוי מעוצבת לרוחב מלא */}
            <div className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
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

            {/* גלריה אופקית (מובייל) וגריד (דסקטופ) */}
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
        ) : (
          /* דף תרגולי נשימה וקרקוע */
          <div className="w-full space-y-8 animate-in fade-in duration-300 flex flex-col items-center">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black tracking-tight leading-tight">תרגולי נשימה וקרקוע</h2>
              <p className="text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
                תרגילים אינטראקטיביים עם הנחיות קצב ויזואליות מונחות להרגעה, פוקוס, הפחתת חרדה וויסות עוררות יתר.
              </p>
            </div>

            {/* גלריה אופקית במובייל וגריד בדסקטופ */}
            <div className="w-full flex md:grid md:grid-cols-2 gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-6 px-6" dir="rtl">
              {BREATHING_EXERCISES.map((exercise) => (
                <BreathingCard
                  key={exercise.id}
                  exercise={exercise}
                  onStart={startBreathing}
                />
              ))}
            </div>

            {/* בקרוב: מדיטציות מונחות */}
            <div className="w-full space-y-4 pt-6 border-t border-white/5">
              <h3 className="text-sm font-black text-slate-400 text-center">בקרוב: מדיטציות מונחות בקול עמיר אייל</h3>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-[2rem] bg-white/5 border border-white/10 flex items-center gap-6 opacity-60 cursor-not-allowed">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Play size={20} className="fill-current" />
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-white">נשימה מונחית לשלווה</span>
                    <span className="block text-xs text-slate-500">10 דקות • עמיר אייל</span>
                  </div>
                </div>

                <div className="p-5 rounded-[2rem] bg-white/5 border border-white/10 flex items-center gap-6 opacity-60 cursor-not-allowed">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Play size={20} className="fill-current" />
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-white">סריקת גוף להרפיה עמוקה</span>
                    <span className="block text-xs text-slate-500">15 דקות • עמיר אייל</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-8 max-w-lg mx-auto w-full z-10">
        <Button
          onClick={onBack}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-16 rounded-[1.5rem] text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Sparkles size={20} />
          חזרה לכלים הקיימים
        </Button>
      </footer>

      {/* מודל תרגול נשימה אינטראקטיבי */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 select-none animate-in fade-in duration-300">
          {/* רקע גרדיאנט ייחודי לכל סגנון */}
          <div className={cn("absolute inset-0 z-0 bg-gradient-to-b opacity-45", activeExercise.bgGradient)} />
          
          {/* אפקטים ופרטים רקע מיוחדים */}
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

          {/* כותרת עליונה */}
          <header className="relative z-10 flex justify-between items-center w-full max-w-lg mx-auto">
            <button
              onClick={closeBreathing}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95 shadow-sm"
              aria-label="סגור תרגול"
            >
              <X size={16} />
            </button>
            <div className="text-right">
              <h3 className="font-black text-lg text-white">{activeExercise.title}</h3>
              {totalTimeLeft > 0 && (
                <p className="text-[10px] text-slate-400 font-medium">זמן נותר: {formatTime(totalTimeLeft)}</p>
              )}
            </div>
          </header>

          {/* מרכז המסך: הנפשה/הכנה/סיום */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
            {introCountdown !== null ? (
              /* מסך ספירה לאחור להכנה */
              <div className="text-center space-y-6 animate-in zoom-in duration-300">
                <p className="text-lg font-bold text-slate-300">היכון לתחילת התרגול...</p>
                <div className="text-8xl font-black text-emerald-400 animate-pulse transition-all">
                  {introCountdown === 0 ? "התחל" : introCountdown}
                </div>
                <p className="text-xs text-slate-500 font-medium">מצא תנוחה נוחה ונשום עמוק</p>
              </div>
            ) : totalTimeLeft === 0 ? (
              /* מסך סיום מוצלח */
              <div className="text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xl">
                  <Sparkles size={48} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white">כל הכבוד!</h2>
                  <p className="text-slate-400 font-medium max-w-xs mx-auto">
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
              /* תרגיל פעיל */
              <div className="w-full flex flex-col items-center justify-center space-y-12">
                {/* אזור ההנפשה הויזואלית */}
                <div className="h-72 flex items-center justify-center w-full">
                  {activeExercise.style === "glow-circle" && (
                    <div
                      className="relative flex items-center justify-center rounded-full"
                      style={{
                        width: "10rem",
                        height: "10rem",
                        transform: `scale(${getScaleAndTransition().scale})`,
                        transition: `transform ${getScaleAndTransition().duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
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
                        transition: `transform ${getScaleAndTransition().duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
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
                              transition: `transform ${getScaleAndTransition().duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
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
                      className="relative w-40 h-40 flex items-center justify-center animate-[spin_40s_linear_infinite]"
                      style={{
                        transform: `scale(${getScaleAndTransition().scale})`,
                        transition: `transform ${getScaleAndTransition().duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
                      }}
                    >
                      <div className="absolute w-48 h-48 rounded-full bg-violet-600/10 blur-3xl" />
                      <svg className="w-full h-full text-teal-400/80 stroke-[0.75] fill-none" viewBox="0 0 200 200">
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
                          transition: `transform ${getScaleAndTransition().duration}s cubic-bezier(0.4, 0, 0.2, 1), opacity ${getScaleAndTransition().duration}s ease-in-out`,
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
                              transition: `transform ${getScaleAndTransition().duration}s cubic-bezier(0.4, 0, 0.2, 1), opacity ${getScaleAndTransition().duration}s ease-in-out`,
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
                        transition: `transform ${getScaleAndTransition().duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
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

                {/* הנחיית נשימה וטיימר שלב */}
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

          {/* לוח בקרה תחתון */}
          <footer className="relative z-10 w-full max-w-lg mx-auto flex flex-col gap-5">
            {/* מד התקדמות כללי */}
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
                  {/* השתק צלילי נשימה */}
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
                    aria-label={isBreathingSoundMuted ? "הפעל צלילי נשימה" : "השתק צלילי נשימה"}
                  >
                    {isBreathingSoundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>

                  {/* התחל מחדש */}
                  <button
                    onClick={restartBreathing}
                    className="w-11 h-11 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md"
                    title="התחל מחדש"
                    aria-label="התחל מחדש"
                  >
                    <Repeat size={18} />
                  </button>

                  {/* הפעל / השהה */}
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

                  {/* השתק מוזיקת רקע */}
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
                      aria-label={isBgMusicMuted ? "הפעל מוזיקת רקע" : "השתק מוזיקת רקע"}
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
