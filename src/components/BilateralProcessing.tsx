"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Wind,
  ShieldCheck,
  Quote,
  X,
  ChevronRight,
  Zap,
  ArrowRight,
  Loader2,
  Settings2,
  Volume2,
  Info,
  Clock,
  Paintbrush,
  Eye,
  Smile,
  Check,
  ChevronLeft,
  VolumeX,
  Sun,
  Moon,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { generateSpeech } from "@/ai/flows/tts-flow";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { useBilateralAudio } from "@/hooks/use-bilateral-audio";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AMBIENT_SOUNDS } from "@/lib/ambient-sound-engine";
import { AMBIENT_VIDEOS } from "@/lib/ambient-videos";
import AmbientVideoBackground from "@/components/AmbientVideoBackground";

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

interface Affirmation {
  text: string;
  audioUrl?: string;
}

interface Category {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
  accent: string;
  affirmations: Affirmation[];
  voiceTone: string;
  blsSpeed: number;
}

const CATEGORIES: Category[] = [
  {
    id: 'anxiety',
    title: 'ויסות חרדה',
    subtitle: 'הקלטות מקוריות - עמיר אייל',
    icon: Wind,
    color: 'from-blue-600/90 via-indigo-900/95 to-black',
    accent: '#60A5FA',
    affirmations: [
      { 
        text: "אני בטוח כאן ועכשיו.", 
        audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2Fmp3.%D7%90%D7%A0%D7%99%20%D7%91%D7%98%D7%95%D7%97%20%D7%9B%D7%90%D7%9F%20%D7%95%D7%A2%D7%9B%D7%A9%D7%99%D7%95.mp3?alt=media&token=70f8d22f-637c-4627-ab30-1b2a71626afa" 
      },
      { 
        text: "הנשימה שלי היא העוגן שלי.", 
        audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2F%D7%94%D7%A0%D7%A9%D7%99%D7%9E%D7%94%20%D7%A9%D7%9C%D7%99%20%D7%94%D7%99%D7%90%20%D7%94%D7%A2%D7%95%D7%92%D7%9F%20%D7%A9%D7%9C%D7%99.mp3?alt=media&token=72105974-72f0-4d89-aece-40d23bacccab" 
      },
      { 
        text: "אני מאפשר למחשבות לחלוף.", 
        audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2F%D7%90%D7%A0%D7%99%20%D7%9E%D7%90%D7%A4%D7%A9%D7%A8%20%D7%9C%D7%9E%D7%97%D7%A9%D7%91%D7%95%D7%AA%20%D7%9C%D7%97%D7%9C%D7%95%D7%A3.mp3?alt=media&token=f7b93f1a-c436-48b0-a170-4956aee29cc5" 
      },
      { 
        text: "הגוף שלי חוזר לאיזון.", 
        audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2F%D7%94%D7%92%D7%95%D7%93%D7%A3%20%D7%A9%D7%9C%D7%99%20%D7%97%D7%95%D7%96%D7%A8%20%D7%9C%D7%90%D7%99%D7%96%D7%95%D7%9F.mp3?alt=media&token=9a142133-cc21-4114-92ee-eb71b0bbcddd" 
      },
      { 
        text: "השקט שבי חזק מכל סערה בחוץ.", 
        audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2F%D7%94%D7%A0%D7%A9%D7%A7%D7%98%20%D7%A9%D7%9B%D7%99%20%D7%97%D7%96%D7%A7%20%D7%9E%D7%9B%D7%9C%20%D7%A1%D7%A2%D7%A8%D7%94%20%D7%91%D7%97%D7%95%D7%A5.mp3?alt=media&token=05d601a2-2f54-4772-8b31-f416c6010eec" 
      }
    ],
    voiceTone: "בטון רגוע, רך וטיפולי. זרימה אטית ורציפה.",
    blsSpeed: 5500 
  },
  {
    id: 'confidence',
    title: 'ביטחון עצמי',
    subtitle: 'עיבוד משאבים פנימיים',
    icon: ShieldCheck,
    color: 'from-amber-600/90 via-orange-900/95 to-black',
    accent: '#FBBF24',
    affirmations: [
      { text: "יש בי את הכוח להתמודד.", audioUrl: "" },
      { text: "אני סומך על עצמי.", audioUrl: "" },
      { text: "הערך שלי יציב וקיים.", audioUrl: "" },
      { text: "אני בוחר להאמין ביכולות שלי היום.", audioUrl: "" }
    ],
    voiceTone: "בטון חם, יציב ומעודד. זרימה אטית.",
    blsSpeed: 5000
  },
  {
    id: 'trauma',
    title: 'חוסן וקרקוע מטראומה',
    subtitle: 'ויסות הצפה וחיבור להווה',
    icon: Zap,
    color: 'from-purple-900/90 via-rose-950/95 to-black',
    accent: '#C084FC',
    affirmations: [
      { text: "אני מוגן וכאן עכשיו.", audioUrl: "" },
      { text: "מה שהיה שייך לעבר, כעת אני בטוח.", audioUrl: "" },
      { text: "הגוף שלי זוכר אך כעת אני מנהל אותו.", audioUrl: "" },
      { text: "הנשימה מחזירה אותי לרגע הזה.", audioUrl: "" }
    ],
    voiceTone: "בטון מרגיע, איטי ומקרקע מאוד. זרימה שקטה.",
    blsSpeed: 6000
  }
];

const STIMULUS_SHAPES = [
  { id: 'orb', label: 'כדור אור פועם' },
  { id: 'flower', label: 'פרח פועם' },
  { id: 'ring', label: 'הילה מרגיעה' }
];

const STIMULUS_COLORS = [
  { id: 'cyan', label: 'כחול ים', hex: '#06B6D4' },
  { id: 'green', label: 'ירוק יער', hex: '#10B981' },
  { id: 'amber', label: 'זהב חם', hex: '#F59E0B' },
  { id: 'indigo', label: 'סגול עמוק', hex: '#6366F1' }
];

const SPEEDS = [
  { id: 'slow', label: 'אטי (לביסוס)', desc: '3.0 שניות' },
  { id: 'medium', label: 'בינוני (לוויסות)', desc: '2.0 שניות' },
  { id: 'fast', label: 'מהיר (להפחתת רגישות)', desc: '1.2 שניות' }
];

const TIMERS = [
  { id: 60, label: 'דקה אחת' },
  { id: 180, label: '3 דקות' },
  { id: 300, label: '5 דקות' },
  { id: 0, label: 'ללא הגבלה' }
];

interface BilateralProcessingProps {
  gender: "m" | "f";
  onBack: () => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

type SessionState = "setup" | "active" | "grounding";

export default function BilateralProcessing({ gender, onBack, theme = "light", toggleTheme }: BilateralProcessingProps) {
  const isLight = theme === "light";
  const [sessionState, setSessionState] = useState<SessionState>("setup");
  const [selectedCat, setSelectedCat] = useState<Category>(CATEGORIES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAffText, setCurrentAffText] = useState("");
  const [showAff, setShowAff] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [blsSide, setBlsSide] = useState<'left' | 'right' | 'center'>('center');
  const [isLoading, setIsLoading] = useState(false);
  
  const [treatmentMode, setTreatmentMode] = useState<'desensitize' | 'resource'>('desensitize');
  const [speed, setSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [stimulusShape, setStimulusShape] = useState<'orb' | 'flower' | 'ring'>('orb');
  const [stimulusColor, setStimulusColor] = useState<'cyan' | 'green' | 'amber' | 'indigo'>('cyan');
  const [selectedSoundId, setSelectedSoundId] = useState<string>("ambient-calm");
  const [droneVolume, setDroneVolume] = useState(0.3); 

  const [distressCategory, setDistressCategory] = useState<string>("חרדה");
  const [customDistress, setCustomDistress] = useState<string>("");
  const [initialSuds, setInitialSuds] = useState<number>(7);
  const [currentSuds, setCurrentSuds] = useState<number>(7);
  const [sudsHistory, setSudsHistory] = useState<number[]>([]);
  const [activeSet, setActiveSet] = useState<number>(1);
  const [desensitizePhase, setDesensitizePhase] = useState<'focus' | 'processing' | 'checkin'>('focus');
  
  const [resourcePhase, setResourcePhase] = useState<'speak' | 'install' | 'breath'>('speak');

  const [phaseTimeLeft, setPhaseTimeLeft] = useState<number>(0);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Setup tabs and Bilateral Audio state
  const [setupTab, setSetupTab] = useState<'focus' | 'settings'>('focus');
  const [bilateralAudioEnabled, setBilateralAudioEnabled] = useState(true);
  const [bilateralToneType, setBilateralToneType] = useState<'click' | 'tone' | 'bowl'>('click');
  const [bilateralVolume, setBilateralVolume] = useState(0.5);

  useWakeLock(isPlaying);

  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const droneAudioRef = useRef<HTMLAudioElement | null>(null);
  const sessionContainerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const affIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const blsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isPlayingRef = useRef(isPlaying);
  const sessionStateRef = useRef(sessionState);
  const nextAffIndexRef = useRef(0);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { sessionStateRef.current = sessionState; }, [sessionState]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
      return;
    }
    setShowControls(true);
    hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 4000);
    return () => { if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current); };
  }, [isFullscreen]);

  useEffect(() => {
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await sessionContainerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) { /* fullscreen not supported / denied */ }
  };

  const handleScreenTap = () => {
    if (!isFullscreen) return;
    setShowControls(prev => {
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
      const next = !prev;
      if (next) hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 4000);
      return next;
    });
  };

  const activeColorHex = STIMULUS_COLORS.find(c => c.id === stimulusColor)?.hex || '#06B6D4';

  const getGenderAffirmation = (text: string) => {
    if (gender === 'f') {
      return text
        .replace("בטוח", "בטוחה")
        .replace("מוגן", "מוגנת")
        .replace("מנהל אותו", "מנהלת אותו")
        .replace("סומך", "סומכת");
    }
    return text;
  };

  const getSpeedMs = () => {
    if (speed === 'slow') return 3000;
    if (speed === 'fast') return 1200;
    return 2000;
  };

  const stopAll = () => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.src = "";
    }
    if (affIntervalRef.current) clearTimeout(affIntervalRef.current);
    if (blsIntervalRef.current) clearInterval(blsIntervalRef.current);
    if (textHideTimeoutRef.current) clearTimeout(textHideTimeoutRef.current);
  };

  const speakAffirmation = async (aff: Affirmation) => {
    if (!selectedCat) return;
    setIsSpeaking(true);
    setIsLoading(true);

    try {
      let audioSrc = "";
      if (aff.audioUrl) {
        audioSrc = aff.audioUrl;
      } else {
        const adaptedText = getGenderAffirmation(aff.text);
        const { audioUri } = await generateSpeech({ 
          text: `${selectedCat.voiceTone}: ${adaptedText}`, 
          gender 
        });
        audioSrc = audioUri;
      }
      
      if (!isPlayingRef.current || sessionStateRef.current !== "active") {
        setIsLoading(false);
        setIsSpeaking(false);
        setShowAff(false);
        return;
      }

      if (voiceAudioRef.current) voiceAudioRef.current.pause();

      const audio = new Audio(audioSrc);
      voiceAudioRef.current = audio;

      audio.onplaying = () => {
        setCurrentAffText(getGenderAffirmation(aff.text));
        setShowAff(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        textHideTimeoutRef.current = setTimeout(() => {
          setShowAff(false);
          if (isPlayingRef.current && sessionStateRef.current === "active") {
            setResourcePhase('install');
            setPhaseTimeLeft(15);
            setIsPlaying(true);
          }
        }, 3000);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        setCurrentAffText(getGenderAffirmation(aff.text));
        setShowAff(true);
        textHideTimeoutRef.current = setTimeout(() => {
          setShowAff(false);
          if (isPlayingRef.current && sessionStateRef.current === "active") {
            setResourcePhase('install');
            setPhaseTimeLeft(15);
            setIsPlaying(true);
          }
        }, 5000);
      };

      await audio.play();
    } catch (error) {
      setIsSpeaking(false);
      setIsLoading(false);
      setCurrentAffText(getGenderAffirmation(aff.text));
      setShowAff(true);
      textHideTimeoutRef.current = setTimeout(() => {
        setShowAff(false);
        if (isPlayingRef.current && sessionStateRef.current === "active") {
          setResourcePhase('install');
          setPhaseTimeLeft(15);
          setIsPlaying(true);
        }
      }, 5000);
    }
  };

  const triggerStep = () => {
    if (!selectedCat || !isPlayingRef.current || sessionStateRef.current !== "active") return;
    if (treatmentMode === 'resource') {
      const affirmations = selectedCat.affirmations;
      if (affirmations.length === 0) return;
      const index = nextAffIndexRef.current % affirmations.length;
      speakAffirmation(affirmations[index]);
      nextAffIndexRef.current = (index + 1) % affirmations.length;
    }
  };

  const handleStartSession = () => {
    setSessionState("active");
    setIsPlaying(true);
    if (treatmentMode === 'desensitize') {
      setDesensitizePhase('focus');
      setPhaseTimeLeft(5);
      setSudsHistory([initialSuds]);
      setCurrentSuds(initialSuds);
      setActiveSet(1);
    } else {
      setResourcePhase('speak');
      setPhaseTimeLeft(0);
      nextAffIndexRef.current = 0;
      setTimeout(() => triggerStep(), 300);
    }
  };

  const handleExitEarly = () => { setIsPlaying(false); setSessionState("grounding"); };
  const handleFinishGrounding = () => { setSessionState("setup"); };
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  const isStimulusMoving = isPlaying && sessionState === "active" && (
    (treatmentMode === 'desensitize' && desensitizePhase === 'processing') ||
    (treatmentMode === 'resource' && resourcePhase === 'install')
  );

  useBilateralAudio({
    enabled: bilateralAudioEnabled && isStimulusMoving,
    side: blsSide,
    volume: bilateralVolume,
    toneType: bilateralToneType,
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPlaying && sessionState === "active" && phaseTimeLeft > 0) {
      intervalId = setInterval(() => {
        setPhaseTimeLeft(prev => {
          if (prev <= 1) {
            handlePhaseTimerExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isPlaying, sessionState, phaseTimeLeft]);

  const handlePhaseTimerExpired = () => {
    if (treatmentMode === 'desensitize') {
      if (desensitizePhase === 'focus') {
        setDesensitizePhase('processing');
        setPhaseTimeLeft(35);
      } else if (desensitizePhase === 'processing') {
        setDesensitizePhase('checkin');
        setIsPlaying(false);
      }
    } else {
      if (resourcePhase === 'install') {
        setResourcePhase('breath');
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (sessionState === "active" && treatmentMode === "resource" && resourcePhase === "speak") {
      if (voiceAudioRef.current) {
        isPlaying ? voiceAudioRef.current.play().catch(() => {}) : voiceAudioRef.current.pause();
      }
    }
  }, [isPlaying, sessionState, treatmentMode, resourcePhase]);

  useEffect(() => {
    if (isPlaying && selectedSoundId !== "none" && sessionState === "active") {
      if (!droneAudioRef.current) {
        const soundDef = AMBIENT_SOUNDS.find(s => s.id === selectedSoundId);
        if (soundDef) {
          const audio = new Audio(soundDef.url);
          audio.loop = true;
          audio.volume = droneVolume;
          droneAudioRef.current = audio;
          audio.play().catch(() => {});
        }
      } else {
        droneAudioRef.current.play().catch(() => {});
      }
    } else {
      if (droneAudioRef.current) { droneAudioRef.current.pause(); droneAudioRef.current.src = ""; droneAudioRef.current = null; }
    }
    return () => {
      if (droneAudioRef.current) { droneAudioRef.current.pause(); droneAudioRef.current.src = ""; droneAudioRef.current = null; }
    };
  }, [isPlaying, selectedSoundId, sessionState]);

  useEffect(() => { if (droneAudioRef.current) droneAudioRef.current.volume = droneVolume; }, [droneVolume]);

  useEffect(() => {
    if (blsIntervalRef.current) clearInterval(blsIntervalRef.current);
    if (isStimulusMoving) {
      const speedMs = (treatmentMode === 'resource') ? 3500 : getSpeedMs();
      setBlsSide('right');
      blsIntervalRef.current = setInterval(() => {
        setBlsSide(prev => prev === 'right' ? 'left' : 'right');
      }, speedMs / 2);
    } else {
      setBlsSide('center');
    }
    return () => { if (blsIntervalRef.current) clearInterval(blsIntervalRef.current); };
  }, [isStimulusMoving, speed, treatmentMode]);

  const getStimulusLeft = () => blsSide === 'left' ? '0%' : blsSide === 'right' ? '100%' : '50%';

  return (
    <div className={cn("min-h-screen font-sans text-right overflow-hidden select-none transition-colors duration-500", sessionState === "setup" || sessionState === "grounding" ? (isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-slate-950 text-white") : "bg-slate-950 text-white")} dir="rtl">
      {sessionState === "active" && (
        <AmbientVideoBackground
          src={AMBIENT_VIDEOS[1]}
          className="fixed inset-0"
          overlayClassName="transition-all duration-[3000ms]"
          overlayStyle={{ background: `linear-gradient(to bottom right, ${activeColorHex}40, black)`, opacity: 0.55 }}
        />
      )}

      {sessionState === "setup" && (
        <div className="min-h-screen flex flex-col relative z-10 overflow-y-auto">
          <header className={cn("p-6 lg:px-12 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-20", isLight ? "border-slate-200 bg-white/70" : "border-white/5 bg-slate-900/50")}>
            <button onClick={onBack} className={cn("flex items-center gap-2 text-xs font-black transition-colors", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-white")}>
              <ArrowRight size={18} /> חזרה למסך הבית
            </button>
            <div className="flex flex-col items-center text-center">
              <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none mb-0.5", isLight ? "text-indigo-600" : "text-indigo-400")}>המצפן הרגשי</span>
              <span className="text-sm font-bold">עיבוד בילטרלי EMDR</span>
            </div>
            <div className="flex items-center gap-3">
              {toggleTheme && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleTheme}
                      className={cn(
                        "w-9/10 h-9/10 rounded-full border flex items-center justify-center transition-all active:scale-95 w-10 h-10",
                        isLight ? "bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      )}
                      aria-label={isLight ? "מעבר לתצוגה כהה" : "מעבר לתצוגה בהירה"}
                    >
                      {isLight ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{isLight ? "תצוגה כהה" : "תצוגה בהירה"}</TooltipContent>
                </Tooltip>
              )}
              <div className={cn("w-10 h-10 rounded-full border overflow-hidden relative", isLight ? "border-slate-200" : "border-white/10")}>
                <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
              </div>
            </div>
          </header>

          <main className="max-w-xl lg:max-w-3xl mx-auto w-full pt-8 pb-24 px-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-black tracking-tighter">כיול הגדרות הטיפול</h1>
              <p className={cn("text-sm", isLight ? "text-slate-500" : "text-slate-400")}>בחרו את מצב הטיפול הדו-צדדי והתאימו את ההגדרות למצבכם כרגע.</p>
            </div>

            {/* Segmented Tab Selectors for Mobile Ergonomics */}
            <div className={cn("grid grid-cols-2 gap-2 p-1 rounded-2xl border", isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/5")}>
              <button
                type="button"
                onClick={() => setSetupTab('focus')}
                className={cn(
                  "py-2.5 rounded-xl text-center text-xs font-black transition-all",
                  setupTab === 'focus'
                    ? "bg-indigo-600 text-white shadow-md"
                    : isLight ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"
                )}
              >
                1. מיקוד וקושי
              </button>
              <button
                type="button"
                onClick={() => setSetupTab('settings')}
                className={cn(
                  "py-2.5 rounded-xl text-center text-xs font-black transition-all",
                  setupTab === 'settings'
                    ? "bg-indigo-600 text-white shadow-md"
                    : isLight ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"
                )}
              >
                2. עיצוב וצליל
              </button>
            </div>

            {setupTab === 'focus' ? (
              /* TAB 1: FOCUS & TARGETS */
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-3">
                  <span className={cn("text-xs font-black tracking-widest uppercase pr-1", isLight ? "text-indigo-600" : "text-indigo-400")}>סוג התרגול הבילטרלי</span>
                  <div className={cn("grid grid-cols-2 gap-2 p-1.5 rounded-2xl border", isLight ? "bg-white/70 border-slate-200" : "bg-white/5 border-white/5")}>
                    <button
                      onClick={() => setTreatmentMode('desensitize')}
                      className={cn("py-3 rounded-xl text-center text-xs font-black transition-all active:scale-95", treatmentMode === 'desensitize' ? "bg-indigo-600 text-white shadow-lg" : isLight ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white")}
                    >
                      פריקה והפחתת מצוקה
                    </button>
                    <button
                      onClick={() => setTreatmentMode('resource')}
                      className={cn("py-3 rounded-xl text-center text-xs font-black transition-all active:scale-95", treatmentMode === 'resource' ? "bg-indigo-600 text-white shadow-lg" : isLight ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white")}
                    >
                      חיזוק והטמעת משאבים
                    </button>
                  </div>
                </div>

                {treatmentMode === 'desensitize' ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <span className={cn("text-xs font-black tracking-widest uppercase pr-1", isLight ? "text-indigo-600" : "text-indigo-400")}>מה מקור המצוקה כרגע?</span>
                      <div className="flex flex-wrap gap-2">
                        {["חרדה", "כעס", "הצפה", "זיכרון כואב", "מתח פיזי"].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => { setDistressCategory(cat); setCustomDistress(""); }}
                            className={cn("py-2 px-3.5 rounded-xl border text-xs font-bold transition-all", distressCategory === cat && !customDistress ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm" : isLight ? "bg-white/70 border-slate-200 text-slate-500 hover:border-slate-300" : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10")}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={customDistress}
                        onChange={(e) => { setCustomDistress(e.target.value); setDistressCategory(""); }}
                        placeholder="או תארו משהו אחר במילים שלכם..."
                        className={cn("w-full rounded-2xl p-4 text-xs font-bold focus:border-indigo-500/50 outline-none border", isLight ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400" : "bg-white/5 border-white/5 text-white placeholder:text-slate-600")}
                      />
                    </div>

                    <div className={cn("space-y-4 p-5 rounded-3xl border", isLight ? "bg-white/70 border-slate-200" : "bg-white/5 border-white/5")}>
                      <div className="flex justify-between items-center">
                        <span className={cn("text-xs font-black tracking-widest uppercase", isLight ? "text-indigo-600" : "text-indigo-400")}>דרגו את עוצמת המצוקה כעת:</span>
                        <span className={cn("text-sm font-mono font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full", isLight ? "text-indigo-600" : "text-indigo-400")}>{initialSuds} מתוך 10</span>
                      </div>
                      <Slider value={[initialSuds]} onValueChange={(vals) => setInitialSuds(vals[0])} min={1} max={10} step={1} className="py-2 cursor-pointer" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className={cn("text-xs font-black tracking-widest uppercase pr-1", isLight ? "text-indigo-600" : "text-indigo-400")}>בחרו נתיב מיקוד חיובי</span>
                    <div className="grid gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCat(cat)}
                          className={cn("p-4 rounded-3xl border text-right flex items-center justify-between transition-all duration-300", selectedCat.id === cat.id ? "bg-indigo-600/15 border-indigo-500 shadow-lg text-slate-900 dark:text-white" : isLight ? "bg-white/70 border-slate-200 text-slate-500 hover:border-slate-300" : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10")}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-colors", selectedCat.id === cat.id ? "bg-indigo-500 text-white" : isLight ? "bg-slate-100 text-slate-400" : "bg-white/5 text-slate-400")}><cat.icon size={18} /></div>
                            <div>
                              <h3 className={cn("font-bold text-xs", isLight ? "text-slate-900" : "text-white")}>{cat.title}</h3>
                              <p className={cn("text-[9px]", isLight ? "text-slate-500" : "text-slate-400")}>{cat.subtitle}</p>
                            </div>
                          </div>
                          {selectedCat.id === cat.id && <Check size={16} className={isLight ? "text-indigo-600" : "text-indigo-400"} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* TAB 2: ANIMATION, SPEEDS, SOUNDS */
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Visual Stimulus Settings */}
                <div className={cn("space-y-4 p-5 rounded-3xl border", isLight ? "bg-white/70 border-slate-200" : "bg-white/5 border-white/5")}>
                  <div className={cn("flex items-center gap-2 text-xs font-black border-b pb-3 mb-2", isLight ? "border-slate-200" : "border-white/5")}><Paintbrush size={14} className={isLight ? "text-indigo-600" : "text-indigo-400"} /><span>עיצוב הגירוי הויזואלי</span></div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-500 block">סוג האנימציה</span>
                    <div className="grid grid-cols-3 gap-2">
                      {STIMULUS_SHAPES.map((sh) => (
                        <button key={sh.id} onClick={() => setStimulusShape(sh.id as any)} className={cn("py-2 px-3 rounded-xl border text-xs font-bold transition-all", stimulusShape === sh.id ? (isLight ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-white/10 border-white/20 text-white") : isLight ? "bg-transparent border-slate-200 text-slate-500" : "bg-transparent border-white/5 text-slate-400")}>{sh.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] font-black text-slate-500 block font-bold">צבע הכדור / האלמנט</span>
                    <div className="flex gap-3">
                      {STIMULUS_COLORS.map((col) => (
                        <button key={col.id} onClick={() => setStimulusColor(col.id as any)} className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-all", stimulusColor === col.id ? cn("ring-2 ring-offset-2 scale-110", isLight ? "ring-slate-900 ring-offset-white" : "ring-white ring-offset-slate-950") : "opacity-80 hover:opacity-100")} style={{ backgroundColor: col.hex }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pacing Speed */}
                {treatmentMode === 'resource' && (
                  <div className="space-y-3">
                    <span className={cn("text-xs font-black tracking-widest uppercase pr-1", isLight ? "text-indigo-600" : "text-indigo-400")}>קצב הגירוי להטמעה (מהירות)</span>
                    <div className="grid grid-cols-3 gap-2">
                      {SPEEDS.map((sp) => (
                        <button key={sp.id} onClick={() => setSpeed(sp.id as any)} className={cn("p-2.5 rounded-2xl border text-center flex flex-col gap-1 transition-all duration-300", speed === sp.id ? "bg-indigo-600/15 border-indigo-500 text-slate-900 dark:text-white shadow-sm" : isLight ? "bg-white/70 border-slate-200 text-slate-500 hover:border-slate-300" : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10")}>
                          <span className="text-xs font-bold block">{sp.label}</span>
                          <span className="text-[8px] text-slate-500 font-mono block">{sp.desc} למחזור</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Background Ambient Music */}
                <div className="space-y-2">
                  <label className={cn("text-xs font-black tracking-widest uppercase block pr-1", isLight ? "text-indigo-600" : "text-indigo-400")}>מוזיקת רקע מרגיעה</label>
                  <select value={selectedSoundId} onChange={(e) => setSelectedSoundId(e.target.value)} className={cn("w-full rounded-2xl p-4 text-xs font-bold focus:border-indigo-500/50 outline-none border", isLight ? "bg-white border-slate-200 text-slate-900" : "bg-white/5 border-white/5 text-white")}>
                    <option value="none" className="bg-slate-900 text-slate-400">ללא מוזיקה</option>
                    {AMBIENT_SOUNDS.map((s) => <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.label}</option>)}
                  </select>
                </div>

                {/* Dynamic Bilateral Audio (Stereo Panning) Settings */}
                <div className={cn("space-y-4 p-5 rounded-3xl border", isLight ? "bg-white/70 border-slate-200" : "bg-white/5 border-white/5")}>
                  <div className="flex justify-between items-center border-b pb-3 mb-2 border-slate-200 dark:border-white/5">
                    <span className="text-xs font-black uppercase text-indigo-400">צליל בילטרלי (שמע באוזניות)</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={bilateralAudioEnabled}
                        onChange={(e) => setBilateralAudioEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {bilateralAudioEnabled && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-500 block">סוג הצליל הדו-צדדי</span>
                        <select
                          value={bilateralToneType}
                          onChange={(e) => setBilateralToneType(e.target.value as any)}
                          className={cn("w-full rounded-xl p-3 text-xs font-bold outline-none border", isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-950 border-white/5 text-white")}
                        >
                          <option value="click" className="bg-slate-900 text-white">נקישה עדינה (עבור פוקוס)</option>
                          <option value="tone" className="bg-slate-900 text-white">טון סינוס מרגיע (396Hz)</option>
                          <option value="bowl" className="bg-slate-900 text-white">קערה טיבטית מהדהדת</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-500 block">עוצמת צליל בילטרלי</span>
                          <span className="text-[10px] font-mono text-indigo-400">{Math.round(bilateralVolume * 100)}%</span>
                        </div>
                        <Slider
                          value={[bilateralVolume * 100]}
                          max={100}
                          onValueChange={(vals) => setBilateralVolume(vals[0] / 100)}
                          className="py-2 cursor-pointer"
                        />
                      </div>

                      <div className="text-[9px] font-bold text-indigo-400 bg-indigo-500/5 p-2.5 rounded-xl border border-indigo-500/10 text-center">
                        💡 מומלץ להרכיב אוזניות סטריאו כדי לחוות את אפקט תנועת השמע הדו-צדדית.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button onClick={handleStartSession} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[2rem] text-lg shadow-xl shadow-indigo-600/10 active:scale-95 transition-all flex items-center justify-center gap-3">
              <span>התחל תרגול עיבוד</span> <Play className="h-5 w-5 fill-white" />
            </Button>
          </main>
        </div>
      )}

      {sessionState === "active" && (
        <div ref={sessionContainerRef} onClick={handleScreenTap} className="min-h-screen flex flex-col relative bg-slate-950">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes bls-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
            @keyframes bls-glow-pulse { 0%, 100% { opacity: 0.35; transform: scale(0.9); } 50% { opacity: 0.75; transform: scale(1.25); } }
            @keyframes bls-ring-ping { 0% { transform: scale(0.75); opacity: 0.55; } 100% { transform: scale(2.1); opacity: 0; } }
            @keyframes bls-petal-sway { 0%, 100% { transform: rotate(var(--rot)) scale(1); } 50% { transform: rotate(calc(var(--rot) + 6deg)) scale(1.08); } }
            @keyframes bls-ring-spin { to { transform: rotate(360deg); } }
            @keyframes bls-drift-1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(6%, -8%) scale(1.15); } }
            @keyframes bls-drift-2 { 0%, 100% { transform: translate(0, 0) scale(1.1); } 50% { transform: translate(-8%, 6%) scale(0.95); } }
          ` }} />

          {isFullscreen && (
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-[120px] opacity-30" style={{ backgroundColor: activeColorHex, animation: 'bls-drift-1 18s ease-in-out infinite' }} />
              <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-[120px] opacity-20" style={{ backgroundColor: activeColorHex, animation: 'bls-drift-2 22s ease-in-out infinite' }} />
            </div>
          )}

          <div className={cn("p-8 flex justify-between items-start z-50 transition-opacity duration-500", isFullscreen && !showControls ? "opacity-0 pointer-events-none" : "opacity-100")}>
            <button
              onClick={handleExitEarly}
              className="px-4 h-12 rounded-full bg-black/70 backdrop-blur-3xl border border-white/20 flex items-center gap-2 text-white hover:text-indigo-400 hover:border-indigo-500/40 transition-all hover:scale-105 active:scale-95 shadow-lg"
              aria-label="סגור תרגול"
            >
              <X size={18} />
              <span className="text-xs font-black">סגור תרגול</span>
            </button>
            <div className="flex flex-col items-center text-center bg-black/40 backdrop-blur-3xl border border-white/5 rounded-full px-5 py-2">
              {treatmentMode === 'desensitize' ? (
                <><span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-0.5">סט {activeSet} • פריקה והפחתת מצוקה</span><span className="text-xs font-bold text-white">{desensitizePhase === 'focus' ? "שלב התמקדות" : desensitizePhase === 'processing' ? "עיבוד בילטרלי" : "בדיקת SUDs"}</span></>
              ) : (
                <><span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-0.5">הטמעת משאבים • {selectedCat.title}</span><span className="text-xs font-bold text-white">משפט {nextAffIndexRef.current === 0 ? selectedCat.affirmations.length : nextAffIndexRef.current} מתוך {selectedCat.affirmations.length}</span></>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-3xl border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all hover:scale-105 active:scale-95" aria-label={isFullscreen ? "צא ממסך מלא" : "מסך מלא"}>
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              {selectedSoundId !== "none" && (
                <Popover>
                  <PopoverTrigger asChild><button onClick={(e) => e.stopPropagation()} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-3xl border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"><Settings2 size={20} /></button></PopoverTrigger>
                  <PopoverContent className="w-64 bg-slate-950 border-white/10 rounded-[2rem] p-6 shadow-2xl" side="bottom" align="end" dir="rtl">
                    <Slider value={[droneVolume * 100]} max={100} onValueChange={(vals) => setDroneVolume(vals[0] / 100)} className="py-2" />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {!(treatmentMode === 'desensitize' && desensitizePhase === 'checkin') && !(treatmentMode === 'resource' && resourcePhase === 'breath') && (
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none px-[12%]">
              <div className="w-full relative h-20 flex items-center">
                <div className="absolute left-0 right-0 h-[1px] bg-white/5" />
                <div className="absolute transform-gpu transition-all -translate-x-1/2" style={{ transition: `left ${isStimulusMoving ? (treatmentMode === 'resource' ? 1750 : getSpeedMs() / 2) : 500}ms cubic-bezier(0.45, 0.05, 0.55, 0.95), transform 300ms`, left: getStimulusLeft() }}>
                  {stimulusShape === 'orb' && (
                    <div className="relative flex items-center justify-center transition-all duration-300" style={{ width: isSpeaking ? '76px' : '52px', height: isSpeaking ? '76px' : '52px' }}>
                      <div className="absolute rounded-full blur-2xl" style={{ inset: '-50%', backgroundColor: activeColorHex, animation: 'bls-glow-pulse 2.6s ease-in-out infinite' }} />
                      <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: activeColorHex, animation: 'bls-ring-ping 2.6s ease-out infinite' }} />
                      <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: activeColorHex, animation: 'bls-ring-ping 2.6s ease-out infinite 1.3s' }} />
                      <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, #ffffff, ${activeColorHex} 65%)`, boxShadow: `0 0 30px ${activeColorHex}, 0 0 60px ${activeColorHex}80`, animation: 'bls-breathe 2.6s ease-in-out infinite' }} />
                    </div>
                  )}
                  {stimulusShape === 'flower' && (
                    <div className="relative flex items-center justify-center transition-all duration-300" style={{ width: isSpeaking ? '88px' : '66px', height: isSpeaking ? '88px' : '66px', animation: 'bls-breathe 3s ease-in-out infinite' }}>
                      <div className="absolute rounded-full blur-2xl opacity-50" style={{ inset: '-30%', backgroundColor: activeColorHex }} />
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-[42%] h-1/2 rounded-full mix-blend-screen"
                          style={{
                            top: 0,
                            left: '50%',
                            marginLeft: '-21%',
                            transformOrigin: '50% 100%',
                            background: `linear-gradient(to top, transparent, ${activeColorHex}cc)`,
                            // @ts-ignore custom property used by bls-petal-sway keyframes
                            '--rot': `${i * 60}deg`,
                            transform: `rotate(${i * 60}deg)`,
                            animation: `bls-petal-sway 4s ease-in-out infinite`,
                            animationDelay: `${i * 0.15}s`,
                          } as React.CSSProperties}
                        />
                      ))}
                      <div className="absolute w-[34%] h-[34%] rounded-full" style={{ background: `radial-gradient(circle, #ffffff, ${activeColorHex})`, boxShadow: `0 0 18px ${activeColorHex}` }} />
                    </div>
                  )}
                  {stimulusShape === 'ring' && (
                    <div className="relative flex items-center justify-center transition-all duration-300" style={{ width: isSpeaking ? '82px' : '60px', height: isSpeaking ? '82px' : '60px', animation: 'bls-breathe 2.6s ease-in-out infinite' }}>
                      <div className="absolute rounded-full blur-2xl opacity-40" style={{ inset: '-35%', backgroundColor: activeColorHex }} />
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(${activeColorHex}, transparent, ${activeColorHex})`,
                          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
                          mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
                          animation: 'bls-ring-spin 6s linear infinite',
                        }}
                      />
                      <div className="absolute inset-[18%] rounded-full border" style={{ borderColor: `${activeColorHex}40` }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeColorHex, boxShadow: `0 0 14px ${activeColorHex}` }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center px-8 pb-32">
            {treatmentMode === 'desensitize' && (
              <>
                {desensitizePhase === 'focus' && (
                  <div className="text-center p-8 bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] border border-white/5 max-w-md w-full animate-in fade-in duration-500">
                    <h2 className="text-sm font-black text-indigo-400 tracking-widest uppercase mb-3">שלב התמקדות</h2>
                    <h3 className="text-lg text-slate-300 mb-1">התמקד/י במקור המצוקה ובמקום בו היא מורגשת בגוף:</h3>
                    <p className="text-2xl font-black text-white">{customDistress || distressCategory}</p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <Clock size={16} className="text-indigo-400 animate-pulse" />
                      <span className="text-sm font-mono font-bold text-indigo-300">{phaseTimeLeft} שניות עד לתחילת העיבוד</span>
                    </div>
                  </div>
                )}
                {desensitizePhase === 'processing' && (
                  <div className="text-center p-6 max-w-lg w-full animate-in fade-in duration-500">
                    <p className="text-slate-500 text-xs font-black tracking-widest uppercase mb-1">עיבוד בילטרלי פעיל</p>
                    <p className="text-white/40 text-sm font-medium">עקוב/י במבטך אחר הכדור הפועם מצד לצד</p>
                  </div>
                )}
                {desensitizePhase === 'checkin' && (
                  <div className="text-center p-8 bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-500">
                    <h2 className="text-2xl font-black mb-2">נשימה והערכה</h2>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      קח/י נשימה עמוקה... שחרר/י...<br />
                      ומהי רמת המצוקה כעת בסולם של 1 עד 10?
                    </p>
                    
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-1 mb-2">
                      <span>1 (רגיעה)</span>
                      <span>5 (בינוני)</span>
                      <span>10 (מצוקה קשה)</span>
                    </div>
                    
                    <div className="relative py-4 mb-6">
                      <Slider 
                        value={[currentSuds]} 
                        onValueChange={(vals) => setCurrentSuds(vals[0])} 
                        min={1} 
                        max={10} 
                        step={1} 
                        className="py-2 cursor-pointer" 
                      />
                      <div className="text-center mt-3">
                        <span className="text-4xl font-black text-indigo-400 font-mono">{currentSuds}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={() => { 
                          setSudsHistory(prev => [...prev, currentSuds]); 
                          setActiveSet(prev => prev + 1); 
                          setDesensitizePhase('focus'); 
                          setPhaseTimeLeft(5); 
                          setIsPlaying(true); 
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-xs"
                      >
                        המשך לסט הבא
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSudsHistory(prev => [...prev, currentSuds]); 
                          setIsPlaying(false);
                          setSessionState("grounding");
                        }}
                        className="border-white/10 bg-transparent text-slate-400 hover:bg-white/5 py-4 rounded-2xl font-bold text-xs"
                      >
                        סיכום וסיום
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {treatmentMode === 'resource' && (
              <>
                {resourcePhase === 'speak' && (
                  <div 
                    className="max-w-3xl w-full text-center transition-all duration-1000" 
                    style={{ opacity: showAff ? 1 : 0 }}
                  >
                    <Quote className="text-white/5 mx-auto mb-6 w-14 h-14" />
                    <h2 className="text-2xl md:text-5xl font-black leading-tight text-white">{currentAffText}</h2>
                    {isLoading && (
                      <div className="flex items-center justify-center gap-2 text-indigo-400 text-xs font-bold mt-6">
                        <Loader2 size={14} className="animate-spin" />
                        <span>מכין הקראה טיפולית...</span>
                      </div>
                    )}
                  </div>
                )}
                {resourcePhase === 'install' && (
                  <div className="max-w-2xl w-full text-center animate-in fade-in duration-700">
                    <p className="text-slate-500 text-xs font-black tracking-widest uppercase mb-4">שלב הטמעת משאב</p>
                    <h2 className="text-lg md:text-2xl font-black text-slate-300 opacity-60 leading-tight mb-8">
                      {currentAffText}
                    </h2>
                    <p className="text-white/40 text-xs font-medium">עקוב/י במבטך אחר תנועת הכדור האטית לביסוס המשאב בגוף</p>
                  </div>
                )}
                {resourcePhase === 'breath' && (
                  <div className="text-center p-8 bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-500 space-y-6">
                    <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Wind size={32} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-white">קחו נשימה עמוקה</h2>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        שאפו אוויר נקי, והרגישו את תחושת המשאב מתפשטת ומעמיקה בכל הגוף.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => {
                          setResourcePhase('speak');
                          setIsPlaying(true);
                          triggerStep();
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-xs"
                      >
                        המשך למשפט הבא
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setIsPlaying(false);
                          setSessionState('grounding');
                        }}
                        className="border-white/10 bg-transparent text-slate-400 hover:bg-white/5 py-4 rounded-2xl font-bold text-xs"
                      >
                        סיכום וסיום
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Session Control Panel */}
          {!(treatmentMode === 'desensitize' && desensitizePhase === 'checkin') && !(treatmentMode === 'resource' && resourcePhase === 'breath') && (
            <div className={cn("fixed bottom-10 left-0 right-0 flex justify-center px-6 z-50 transition-opacity duration-500", isFullscreen && !showControls ? "opacity-0 pointer-events-none" : "opacity-100")}>
              <div onClick={(e) => e.stopPropagation()} className="bg-black/60 backdrop-blur-3xl p-3 px-8 rounded-full border border-white/10 flex items-center gap-6 shadow-2xl">
                <div className="flex items-center gap-1.5 text-white/20">
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin text-indigo-400" />
                  ) : (
                    <div className="flex items-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={cn("w-0.5 rounded-full transition-all duration-300", blsSide === (i < 2 ? 'left' : 'right') ? "bg-indigo-400 shadow-[0_0_8px_indigo]" : "bg-white/10")}
                          style={{ height: isStimulusMoving ? '12px' : '4px' }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                  aria-label={isPlaying ? "השהה" : "נגן"}
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="mr-0.5" />}
                </button>

                <div className="text-right">
                  <span className="text-[9px] font-black tracking-widest uppercase text-slate-500 block">זמן שנותר</span>
                  <span className="text-xs font-bold font-mono text-white block">
                    {phaseTimeLeft > 0 ? `${phaseTimeLeft} שניות` : (isSpeaking ? "הקראה..." : "ממתין...")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {sessionState === "grounding" && (
        <div className="min-h-screen flex flex-col relative z-10 overflow-y-auto">
          <header className={cn("p-6 lg:px-12 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-20", isLight ? "border-slate-200 bg-white/70" : "border-white/5 bg-slate-900/50")}>
            <button onClick={onBack} className={cn("flex items-center gap-2 text-xs font-black transition-colors", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-white")}>
              <ArrowRight size={18} /> חזרה למסך הבית
            </button>
            <div className="flex flex-col items-center text-center">
              <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none mb-0.5", isLight ? "text-indigo-600" : "text-indigo-400")}>סיכום התרגול</span>
              <span className="text-sm font-bold">תוצאות העיבוד והקרקוע</span>
            </div>
            {toggleTheme ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheme}
                    className={cn(
                      "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95",
                      isLight ? "bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    )}
                    aria-label={isLight ? "מעבר לתצוגה כהה" : "מעבר לתצוגה בהירה"}
                  >
                    {isLight ? <Moon size={18} /> : <Sun size={18} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isLight ? "תצוגה כהה" : "תצוגה בהירה"}</TooltipContent>
              </Tooltip>
            ) : <div className="w-10 h-10" />}
          </header>

          <main className="max-w-xl lg:max-w-3xl mx-auto w-full pt-8 pb-24 px-6 space-y-8">
            {treatmentMode === 'desensitize' ? (
              <div className="space-y-6">
                <div className="text-center space-y-3 animate-in fade-in duration-700">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
                    <ShieldCheck size={40} />
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-black tracking-tighter">העיבוד הושלם</h1>
                  <p className={cn("text-sm", isLight ? "text-slate-500" : "text-slate-400")}>
                    סיימת {activeSet - 1} סבבי עיבוד בילטרלי של {customDistress || distressCategory}.
                  </p>
                </div>

                <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 space-y-6">
                {/* SUDs reduction metric card */}
                <div className={cn("p-6 rounded-3xl border space-y-4", isLight ? "bg-white/70 border-slate-200" : "bg-white/5 border-white/5")}>
                  <div className={cn("flex justify-between items-center text-xs font-black uppercase tracking-wider", isLight ? "text-slate-500" : "text-slate-400")}>
                    <span>רמת מצוקה התחלתית</span>
                    <span>רמת מצוקה כעת</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <span className={cn("text-5xl font-black font-mono", isLight ? "text-indigo-600" : "text-indigo-400")}>{initialSuds}</span>
                      <span className="text-xs text-slate-500 block mt-1">מתוך 10</span>
                    </div>
                    <div className={cn("w-16 h-[2px] relative", isLight ? "bg-slate-200" : "bg-white/10")}>
                      <div className="absolute inset-y-0 right-0 bg-indigo-500" style={{ width: '100%' }} />
                      <ChevronLeft size={16} className={cn("absolute left-0 top-1/2 -translate-y-1/2 animate-pulse", isLight ? "text-indigo-600" : "text-indigo-400")} />
                    </div>
                    <div className="text-center">
                      <span className="text-5xl font-black text-emerald-500 font-mono">{currentSuds}</span>
                      <span className="text-xs text-slate-500 block mt-1">מתוך 10</span>
                    </div>
                  </div>

                  {initialSuds > currentSuds ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-bold text-center">
                      הצלחת להפחית את רמת המצוקה ב-{initialSuds - currentSuds} דרגות! זהו הישג משמעותי לעיבוד הרגשי.
                    </div>
                  ) : (
                    <div className={cn("p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-center", isLight ? "text-indigo-600" : "text-indigo-300")}>
                      רמת המצוקה נותרה יציבה. עיבוד זיכרונות או רגשות מורכבים עשוי לדרוש מספר תרגולים נוספים.
                    </div>
                  )}
                </div>

                {/* Visual Timeline / Chart */}
                {sudsHistory.length > 1 && (
                  <div className={cn("p-6 rounded-3xl border space-y-4", isLight ? "bg-white/70 border-slate-200" : "bg-white/5 border-white/5")}>
                    <span className={cn("text-xs font-black tracking-widest uppercase block", isLight ? "text-indigo-600" : "text-indigo-400")}>גרף ירידת המצוקה לאורך הסבבים</span>
                    <div className="h-32 w-full flex items-end justify-between pt-6 px-4 relative">
                      {/* Grid lines */}
                      <div className={cn("absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b", isLight ? "border-slate-200" : "border-white/5")}>
                        <div className={cn("border-t w-full", isLight ? "border-slate-300" : "border-white/10")} />
                        <div className={cn("border-t w-full", isLight ? "border-slate-300" : "border-white/10")} />
                        <div className={cn("border-t w-full", isLight ? "border-slate-300" : "border-white/10")} />
                      </div>

                      {/* SVG line representation */}
                      <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
                        <polyline
                          fill="none"
                          stroke="#6366F1"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={sudsHistory.map((suds, index) => {
                            const x = (index / (sudsHistory.length - 1)) * 100;
                            // scale 1-10 to SVG coordinates (10 is top/0% padding, 1 is bottom/100% padding)
                            const y = 100 - ((suds - 1) / 9) * 80 - 10;
                            return `${x}%,${y}%`;
                          }).join(" ")}
                        />
                        {/* Area gradient under the line */}
                        <path
                          fill="url(#chart-gradient)"
                          opacity="0.15"
                          d={`M 0,100 ${sudsHistory.map((suds, index) => {
                            const x = (index / (sudsHistory.length - 1)) * 100;
                            const y = 100 - ((suds - 1) / 9) * 80 - 10;
                            return `L ${x}%,${y}%`;
                          }).join(" ")} L 100,100 Z`}
                        />
                        <defs>
                          <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {sudsHistory.map((suds, idx) => (
                        <div key={idx} className="flex flex-col items-center z-10" style={{ width: `${100 / sudsHistory.length}%` }}>
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border mb-1 font-mono", isLight ? "text-slate-900 bg-white border-slate-200" : "text-white bg-slate-900 border-white/10")}>{suds}</span>
                          <div className={cn("w-2.5 h-2.5 rounded-full bg-indigo-500 border", isLight ? "border-white" : "border-white")} />
                          <span className="text-[9px] text-slate-500 font-black mt-1">סבב {idx === 0 ? "התחלה" : idx}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-3 animate-in fade-in duration-700">
                  <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-500 mb-2">
                    <Smile size={40} />
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-black tracking-tighter">המשאב הוטמע בהצלחה</h1>
                  <p className={cn("text-sm", isLight ? "text-slate-500" : "text-slate-400")}>
                    ביצעת עיבוד והטמעה בילטרלית של היגדים מקטגוריית <strong className={isLight ? "text-slate-900" : "text-white"}>{selectedCat?.title}</strong>.
                  </p>
                </div>

                <div className={cn("p-6 rounded-3xl border space-y-4", isLight ? "bg-white/70 border-slate-200" : "bg-white/5 border-white/5")}>
                  <span className={cn("text-xs font-black tracking-widest uppercase block", isLight ? "text-indigo-600" : "text-indigo-400")}>היגדים שחזרת עליהם:</span>
                  <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                    {selectedCat?.affirmations.map((aff, idx) => (
                      <div key={idx} className={cn("flex items-start gap-3 p-3 rounded-2xl border text-right animate-in fade-in duration-500", isLight ? "bg-white/50 border-slate-100" : "bg-white/[0.02] border-white/5")} style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className={cn("w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 font-mono", isLight ? "text-indigo-600" : "text-indigo-400")}>{idx + 1}</div>
                        <p className={cn("text-xs font-medium", isLight ? "text-slate-700" : "text-slate-200")}>{getGenderAffirmation(aff.text)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Educational grounding message */}
            <div className={cn("p-5 rounded-3xl border text-xs leading-relaxed space-y-2", isLight ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-indigo-950/20 border-indigo-500/10 text-indigo-300")}>
              <div className={cn("flex items-center gap-2 font-bold text-sm", isLight ? "text-indigo-800" : "text-indigo-200")}>
                <Info size={16} />
                <span>הסבר נוירולוגי על התרגול:</span>
              </div>
              <p>
                גירוי דו-צדדי (Bilateral Stimulation) פועל ישירות על מערכת העצבים ומסייע באיזון שתי המיספרות המוח.
                במצב של מצוקה, הגירוי מפחית את העומס על זיכרון העבודה (Dual-Task Working Memory) ומסייע לנטרל את המטען הרגשי של החוויה המציפה.
                במצב של הטמעת משאבים, הגירוי האיטי תומך בבניית קשרים סינפטיים חדשים ומחזק את תחושת החוסן והביטחון הפנימי בגוף.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 lg:max-w-md lg:mx-auto lg:w-full">
              <Button
                onClick={handleFinishGrounding}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-sm"
              >
                התחל תרגול חדש
              </Button>

              <Button
                variant="outline"
                onClick={onBack}
                className={cn("w-full py-4 rounded-2xl font-bold text-sm bg-transparent", isLight ? "border-slate-200 text-slate-500 hover:bg-slate-100" : "border-white/10 text-slate-400 hover:bg-white/5")}
              >
                סיום וחזרה למסך הבית
              </Button>
            </div>
          </main>
        </div>
      )}

    </div>
  );
}
