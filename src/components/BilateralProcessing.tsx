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
import CrisisHelpDialog from "@/components/CrisisHelpDialog";

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
        text: "אני בטוח כאן ועכשיו", 
        audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2Fmp3.%D7%90%D7%A0%D7%99%20%D7%91%D7%98%D7%95%D7%97%20%D7%9B%D7%90%D7%9F%20%D7%95%D7%A2%D7%9B%D7%A9%D7%99%D7%95.mp3?alt=media&token=70f8d22f-637c-4627-ab30-1b2a71626afa" 
      },
      { 
        text: "הנשימה שלי היא העוגן שלי", 
        audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2F%D7%94%D7%A0%D7%A9%D7%99%D7%9E%D7%94%20%D7%A9%D7%9C%D7%99%20%D7%94%D7%99%D7%90%20%D7%94%D7%A2%D7%95%D7%92%D7%9F%20%D7%A9%D7%9C%D7%99.mp3?alt=media&token=72105974-72f0-4d89-aece-40d23bacccab" 
      },
      { 
        text: "אני מאפשר למחשבות לחלוף", 
        audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2F%D7%90%D7%A0%D7%99%20%D7%9E%D7%90%D7%A4%D7%A9%D7%A8%20%D7%9C%D7%9E%D7%97%D7%A9%D7%91%D7%95%D7%AA%20%D7%9C%D7%97%D7%9C%D7%95%D7%A3.mp3?alt=media&token=f7b93f1a-c436-48b0-a170-4956aee29cc5" 
      },
      { 
        text: "הגוף שלי חוזר לאיזון", 
        audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2F%D7%94%D7%92%D7%95%D7%93%D7%A3%20%D7%A9%D7%9C%D7%99%20%D7%97%D7%95%D7%96%D7%A8%20%D7%9C%D7%90%D7%99%D7%96%D7%95%D7%9F.mp3?alt=media&token=9a142133-cc21-4114-92ee-eb71b0bbcddd" 
      },
      { 
        text: "השקט שבי חזק מכל סערה בחוץ", 
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
      { text: "יש בי את הכוח להתמודד", audioUrl: "" },
      { text: "אני סומך על עצמי", audioUrl: "" },
      { text: "הערך שלי יציב וקיים", audioUrl: "" },
      { text: "אני בוחר להאמין ביכולות שלי היום", audioUrl: "" }
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
      { text: "אני נמצא במקום בטוח עכשיו", audioUrl: "" },
      { text: "מה שהיה שייך לעבר, כעת אני בטוח", audioUrl: "" },
      { text: "הגוף שלי זוכר אך כעת אני מנהל אותו", audioUrl: "" },
      { text: "הנשימה מחזירה אותי לרגע הזה", audioUrl: "" }
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

const FOCUS_PHASE_DURATION = 12;

const TIMERS = [
  { id: 60, label: 'דקה אחת' },
  { id: 180, label: '3 דקות' },
  { id: 300, label: '5 דקות' },
  { id: 0, label: 'ללא הגבלה' }
];

interface DistressPreset {
  color: 'cyan' | 'green' | 'amber' | 'indigo';
  speed: 'slow' | 'medium' | 'fast';
  soundId: string;
  focusInstructions: string;
  explanation: string;
}

const DISTRESS_PRESETS: Record<string, DistressPreset> = {
  "חרדה": {
    color: "cyan",
    speed: "medium",
    soundId: "ambient-calm",
    focusInstructions: "התמקד/י בחרדה ובמקום בו היא מכווצת את הגוף (כמו הבטן או החזה). נשום/נשמי רך ועמוק.",
    explanation: "כיול מותאם לחרדה: צבע כחול-ציאן מרגיע, קצב ויסות בינוני וצליל גלי ים מקרקעים."
  },
  "כעס": {
    color: "indigo",
    speed: "fast",
    soundId: "none",
    focusInstructions: "התמקד/י בכעס, בתחושת החום או המתיחות (בלסת, באגרופים). אפשר/י לאנרגיה של הכעס לזרום החוצה במעקב מהיר.",
    explanation: "כיול מותאם לכעס: צבע אינדיגו עמוק לקירור, קצב מהיר לפריקת האנרגיה הגבוהה וצליל שקט."
  },
  "הצפה": {
    color: "green",
    speed: "slow",
    soundId: "ambient-calm",
    focusInstructions: "התמקד/י בתחושת הבלבול או ההצפה, בדומה לענן סמיך. אפשר/י לעיניים להינעל על הכדור האטי ולהתקרקע.",
    explanation: "כיול מותאם להצפה: צבע ירוק מרפא, קצב אטי להאטת המחשבות ומוזיקת רקע שלווה."
  },
  "זיכרון כואב": {
    color: "indigo",
    speed: "medium",
    soundId: "ambient-calm",
    focusInstructions: "התמקד/י בתמונת הזיכרון ובתחושה שהיא מעוררת כעת. עקוב/י אחר הכדור ואפשר/י למוח לעבד את התמונה מחדש.",
    explanation: "כיול מותאם לזיכרון כואב: צבע אינדיגו מעודד עיבוד עמוק, קצב בינוני וצליל קערה מהדהד."
  },
  "מתח פיזי": {
    color: "green",
    speed: "slow",
    soundId: "ambient-calm",
    focusInstructions: "התמקד/י באזור המתוח בגוף (צוואר, שכמות, גב). נשום/נשמי אל המקום המתוח תוך מעקב אטי אחר התנועה.",
    explanation: "כיול מותאם למתח פיזי: צבע ירוק-טבע מרגיע, קצב אטי להרפיית שרירים ושמע עמוק."
  }
};

const DEFAULT_PRESET: DistressPreset = {
  color: "cyan",
  speed: "medium",
  soundId: "ambient-calm",
  focusInstructions: "התמקד/י במצוקה ובמקום בו היא מורגשת בגוף. נשום/נשמי אליה בעדינות.",
  explanation: "כיול כללי: צבע כחול-ציאן מנקה, קצב ויסות בינוני ומוזיקת רקע מרגיעה."
};

interface BilateralProcessingProps {
  gender: "m" | "f";
  onBack: () => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

type SessionState = "entrance" | "setup" | "active" | "grounding";

export default function BilateralProcessing({ gender, onBack, theme = "light", toggleTheme }: BilateralProcessingProps) {
  const isLight = theme === "light";
  const [sessionState, setSessionState] = useState<SessionState>("setup");

  // טעינת הגדרות שמורות ב-localStorage בעת כניסה
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Force desensitize mode
      setTreatmentMode('desensitize');
      const savedSpeed = localStorage.getItem("bls_speed");
      if (savedSpeed) setSpeed(savedSpeed as any);
      const savedShape = localStorage.getItem("bls_stimulusShape");
      if (savedShape) setStimulusShape(savedShape as any);
      const savedColor = localStorage.getItem("bls_stimulusColor");
      if (savedColor) setStimulusColor(savedColor as any);
      const savedSound = localStorage.getItem("bls_selectedSoundId");
      if (savedSound) setSelectedSoundId(savedSound);
      const savedAudioEnabled = localStorage.getItem("bls_bilateralAudioEnabled");
      if (savedAudioEnabled) setBilateralAudioEnabled(savedAudioEnabled === "true");
      const savedToneType = localStorage.getItem("bls_bilateralToneType");
      if (savedToneType) setBilateralToneType(savedToneType as any);
      const savedVolume = localStorage.getItem("bls_bilateralVolume");
      if (savedVolume) setBilateralVolume(parseFloat(savedVolume));
      const savedDistress = localStorage.getItem("bls_distressCategory");
      if (savedDistress) setDistressCategory(savedDistress);
      const savedSuds = localStorage.getItem("bls_initialSuds");
      if (savedSuds) setInitialSuds(parseInt(savedSuds, 10));
      const consented = localStorage.getItem("bls_desensitizeConsented");
      if (consented === "true") setHasConsentedDesensitize(true);

      const hasUsed = localStorage.getItem("bls_hasUsedBefore");
      if (hasUsed === "true") {
        setSessionState("entrance");
      }
    }
  }, []);
  const [selectedCat, setSelectedCat] = useState<Category>(CATEGORIES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAffText, setCurrentAffText] = useState("");
  const [showAff, setShowAff] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [blsSide, setBlsSide] = useState<'left' | 'right' | 'center'>('center');
  const [isLoading, setIsLoading] = useState(false);
  
  // ברירת מחדל בטוחה: משתמשים חדשים מתחילים בהטמעת משאבים, לא בעיבוד ישיר.
  // localStorage.bls_treatmentMode (למטה) דורס את זה עבור משתמשים חוזרים.
  const [treatmentMode, setTreatmentMode] = useState<'desensitize' | 'resource'>('desensitize');
  const [hasConsentedDesensitize, setHasConsentedDesensitize] = useState(false);
  const [desensitizeConsentChecked, setDesensitizeConsentChecked] = useState(false);
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
        .replace("אני בטוח", "אני בטוחה")
        .replace("כעת אני בטוח", "כעת אני בטוחה")
        .replace("אני נמצא", "אני נמצאת")
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

  const handleSelectDistressCategory = (cat: string) => {
    setDistressCategory(cat);
    setCustomDistress("");
    const preset = DISTRESS_PRESETS[cat] || DEFAULT_PRESET;
    setStimulusColor(preset.color);
    setSpeed(preset.speed);
    setSelectedSoundId(preset.soundId);
  };

  const handleStartSession = () => {
    // מסך "עיבוד" ראשון-אי-פעם דורש אישור מודע לפני שהוא נפתח (ראו checkbox בטאב המיקוד)
    if (treatmentMode === 'desensitize' && !hasConsentedDesensitize && !desensitizeConsentChecked) {
      return;
    }

    // שמירת הגדרות ב-localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("bls_treatmentMode", treatmentMode);
      localStorage.setItem("bls_speed", speed);
      localStorage.setItem("bls_stimulusShape", stimulusShape);
      localStorage.setItem("bls_stimulusColor", stimulusColor);
      localStorage.setItem("bls_selectedSoundId", selectedSoundId);
      localStorage.setItem("bls_bilateralAudioEnabled", bilateralAudioEnabled ? "true" : "false");
      localStorage.setItem("bls_bilateralToneType", bilateralToneType);
      localStorage.setItem("bls_bilateralVolume", bilateralVolume.toString());
      localStorage.setItem("bls_distressCategory", distressCategory);
      localStorage.setItem("bls_initialSuds", initialSuds.toString());
      localStorage.setItem("bls_hasUsedBefore", "true");
      if (treatmentMode === 'desensitize') {
        localStorage.setItem("bls_desensitizeConsented", "true");
        setHasConsentedDesensitize(true);
      }
    }

    setSessionState("active");
    setIsPlaying(true);
    if (treatmentMode === 'desensitize') {
      setDesensitizePhase('focus');
      setPhaseTimeLeft(FOCUS_PHASE_DURATION);
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

  const handleExitEarly = () => {
    setIsPlaying(false);
    if (treatmentMode === 'desensitize') {
      setDesensitizePhase('checkin');
    } else {
      setSessionState("grounding");
    }
  };

  const handleSkipFocus = () => {
    setDesensitizePhase('processing');
    setPhaseTimeLeft(35);
  };
  const handleFinishGrounding = () => {
    if (typeof window !== "undefined" && localStorage.getItem("bls_hasUsedBefore") === "true") {
      setSessionState("entrance");
    } else {
      setSessionState("setup");
    }
  };
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
        // nextAffIndexRef כבר קודם למשפט הבא בתוך triggerStep() כשהמשפט הנוכחי הושמע.
        // אם הוא לא חזר ל-0, עדיין נותרו משפטים בסבב הנוכחי - להמשיך אוטומטית למשפט הבא
        // בלי לעצור ולדרוש מהמשתמש/ת ללחוץ בכל פעם מחדש.
        if (nextAffIndexRef.current !== 0) {
          setResourcePhase('speak');
          triggerStep();
        } else {
          setResourcePhase('breath');
          setIsPlaying(false);
        }
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

  const getSudsColorClass = (val: number, active: boolean) => {
    if (active) {
      if (val <= 2) return "bg-emerald-600/95 border-emerald-400 text-white shadow-lg shadow-emerald-600/35 scale-110";
      if (val <= 4) return "bg-teal-600/95 border-teal-400 text-white shadow-lg shadow-teal-600/35 scale-110";
      if (val <= 6) return "bg-amber-600/95 border-amber-400 text-white shadow-lg shadow-amber-600/35 scale-110";
      if (val <= 8) return "bg-orange-600/95 border-orange-400 text-white shadow-lg shadow-orange-600/35 scale-110";
      return "bg-red-600/95 border-red-400 text-white shadow-lg shadow-red-600/35 scale-110";
    }
    return "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20";
  };

  const getSudsLabel = (val: number) => {
    if (val <= 2) return "רגיעה מלאה / כמעט ללא מצוקה";
    if (val <= 4) return "מצוקה קלה ומורגשת";
    if (val <= 6) return "מצוקה בינונית, מורגשת אך נסבלת";
    if (val <= 8) return "מצוקה גבוהה, מפריעה לריכוז";
    return "מצוקה קשה מאוד, הצפה רגשית";
  };

  const adjustGender = (text: string) => {
    if (gender === 'f') {
      return text
        .replace(/התמקד\/י/g, "התמקדי")
        .replace(/עקוב\/י/g, "עקבי")
        .replace(/קח\/י/g, "קחי")
        .replace(/שחרר\/י/g, "שחררי")
        .replace(/מצא\/ו/g, "מצאי")
        .replace(/הקשב\/י/g, "הקשיבי")
        .replace(/שים\/י/g, "שימי")
        .replace(/נסה\/י/g, "נסי")
        .replace(/קרב\/י/g, "קרבי")
        .replace(/בחר\/י/g, "בחרי")
        .replace(/התאמ\/י/g, "התאימי")
        .replace(/התכונן\/י/g, "התכונני")
        .replace(/הרכב\/י/g, "הרכיבי")
        .replace(/תרגל\/י/g, "תרגלי")
        .replace(/אפשר\/י/g, "אפשרי")
        .replace(/נשום\/נשמי/g, "נשמי")
        .replace(/מבין\/ה/g, "מבינה")
        .replace(/מעבד\/ת/g, "מעבדת")
        .replace(/המטפל\/ת/g, "המטפלת")
        .replace(/מרגיש\/ה/g, "מרגישה")
        .replace(/מוכן\/ה/g, "מוכנה")
        .replace(/רוצה\/ה/g, "רוצה");
    }
    return text
      .replace(/התמקד\/י/g, "התמקד")
      .replace(/עקוב\/י/g, "עקוב")
      .replace(/קח\/י/g, "קח")
      .replace(/שחרר\/י/g, "שחרר")
      .replace(/מצא\/ו/g, "מצא")
      .replace(/הקשב\/י/g, "הקשב")
      .replace(/שים\/י/g, "שים")
      .replace(/נסה\/י/g, "נסה")
      .replace(/קרב\/י/g, "קרב")
      .replace(/בחר\/י/g, "בחר")
      .replace(/התאמ\/י/g, "התאם")
      .replace(/התכונן\/י/g, "התכונן")
      .replace(/הרכב\/י/g, "הרכב")
      .replace(/תרגל\/י/g, "תרגל")
      .replace(/אפשר\/י/g, "אפשר")
      .replace(/נשום\/נשמי/g, "נשום")
      .replace(/מבין\/ה/g, "מבין")
      .replace(/מעבד\/ת/g, "מעבד")
      .replace(/המטפל\/ת/g, "המטפל")
      .replace(/מרגיש\/ה/g, "מרגיש")
      .replace(/מוכן\/ה/g, "מוכן")
      .replace(/רוצה\/ה/g, "רוצה");
  };

  const getSudsNextStepExplanation = () => {
    const diff = initialSuds - currentSuds;
    const isFemale = gender === 'f';
    if (currentSuds <= 3) {
      if (diff > 0) {
        return (
          <div className="space-y-2 text-right" dir="rtl">
            <h4 className="font-black text-sm text-emerald-500 flex items-center gap-1.5 justify-start">🌈 רגיעה טובה ומוצלחת</h4>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              הצלחת להפחית את רמת המצוקה לרמה נמוכה של {currentSuds} מתוך 10! 
              מערכת העצבים שלך כעת במצב בטוח ורגוע יותר.
            </p>
            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 pt-1">
              💡 מה מומלץ לעשות כעת?
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 text-slate-600 dark:text-slate-400 pr-1">
              <li>{isFemale ? "שתי" : "שתה"} כוס מים קרים כדי לסייע לגוף להתקרקע.</li>
              <li>{isFemale ? "עשי" : "עשה"} פעילות קלה ומסיחת דעת (כמו שמיעת מוזיקה או הליכה קצרה).</li>
              <li>{isFemale ? "תוכלי" : "תוכל"} לחזור למסך הבית להמשך שגרה רגועה.</li>
            </ul>
          </div>
        );
      } else {
        return (
          <div className="space-y-2 text-right" dir="rtl">
            <h4 className="font-black text-sm text-emerald-500 flex items-center gap-1.5 justify-start">🌸 רגיעה ויציבות</h4>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              רמת המצוקה שלך נמוכה ויציבה ({currentSuds} מתוך 10). 
              הגוף והנפש נמצאים כעת במצב של יציבות.
            </p>
            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 pt-1">
              💡 מה מומלץ לעשות כעת?
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 text-slate-600 dark:text-slate-400 pr-1">
              <li>{isFemale ? "תוכלי" : "תוכל"} להשתמש בכלי "עזרה בשינה" או "מוזיקה מרגיעה" כדי להמשיך להזין את תחושת השלווה.</li>
              <li>{isFemale ? "חזרי" : "חזור"} למסך הבית מתי {isFemale ? "שתרצי" : "שתרצה"}.</li>
            </ul>
          </div>
        );
      }
    } else {
      // currentSuds > 3 (still experiencing distress)
      if (diff > 0) {
        return (
          <div className="space-y-2 text-right" dir="rtl">
            <h4 className="font-black text-sm text-amber-500 flex items-center gap-1.5 justify-start">⚡ התקדמות בעיבוד (מצוקה מתונה)</h4>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              הצלחת להפחית את המצוקה מ-{initialSuds} ל-{currentSuds}, אך עדיין קיימת תחושת אי-נוחות מסוימת בגוף. 
              זהו תהליך טבעי של עיבוד זיכרון או רגש מציף.
            </p>
            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 pt-1">
              💡 מה מומלץ לעשות כעת?
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 text-slate-600 dark:text-slate-400 pr-1">
              <li><strong>מומלץ לבצע סבב נוסף:</strong> {isFemale ? "לחצי" : "לחץ"} על "התחל תרגול חדש" ו{isFemale ? "עשי" : "עשה"} עוד 1-2 סבבים כדי להמשיך להמיס את שארית המצוקה.</li>
              <li>אם {isFemale ? "את מרגישה" : "אתה מרגיש"} עייפות פיזית, {isFemale ? "עצרי" : "עצור"} כאן, {isFemale ? "שתי" : "שתה"} מים, ו{isFemale ? "תני" : "תן"} לחוויה להתאזן בגוף באופן טבעי.</li>
            </ul>
          </div>
        );
      } else {
        return (
          <div className="space-y-2 text-right" dir="rtl">
            <h4 className="font-black text-sm text-red-500 flex items-center gap-1.5 justify-start">⚠️ המצוקה עדיין פעילה</h4>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              רמת המצוקה נותרה גבוהה ({currentSuds} מתוך 10). 
              במקרים של הצפה חזקה, המוח זקוק לזמן נוסף וקצב איטי/עקבי כדי לפרק את הזיכרון או הרגש.
            </p>
            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 pt-1">
              💡 מה מומלץ לעשות כעת?
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 text-slate-600 dark:text-slate-400 pr-1">
              <li><strong>בצעו סבב נוסף של פריקה:</strong> {isFemale ? "לחצי" : "לחץ"} על "התחל תרגול חדש" ו{isFemale ? "הקפידי" : "הקפד"} לעקוב אחרי הכדור במבט רציף.</li>
              <li><strong>שינוי מהירות/שמע:</strong> אם המהירות הנוכחית מהירה מדי, {isFemale ? "היכנסי" : "היכנס"} להגדרות והנמיכו את המהירות ל-"בינוני" או "אטי".</li>
              <li>אם {isFemale ? "את מרגישה" : "אתה מרגיש"} הצפה מוחלטת, {isFemale ? "עברי" : "עבור"} למסך הבית ו{isFemale ? "הפעילי" : "הפעל"} את כלי **"עזרה ראשונה - תרגילי קרקוע (5-4-3-2-1)"** למטה כדי לחזור לגוף.</li>
            </ul>
          </div>
        );
      }
    }
  };

  const getStimulusLeft = () => blsSide === 'left' ? '0%' : blsSide === 'right' ? '100%' : '50%';

  return (
    <div className={cn("min-h-screen font-sans text-right overflow-hidden select-none transition-colors duration-500", sessionState === "setup" || sessionState === "grounding" || sessionState === "entrance" ? (isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-slate-950 text-white") : "bg-slate-950 text-white")} dir="rtl">
      {sessionState === "active" && (
        <AmbientVideoBackground
          src={AMBIENT_VIDEOS[1]}
          className="fixed inset-0"
          overlayClassName="transition-all duration-[3000ms]"
          overlayStyle={{ background: `linear-gradient(to bottom right, ${activeColorHex}40, black)`, opacity: 0.55 }}
        />
      )}

      {sessionState === "entrance" && (
        <div className="min-h-screen flex flex-col relative z-10 overflow-y-auto animate-in fade-in duration-300">
          <header className={cn("p-6 lg:px-12 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-20", isLight ? "border-slate-200 bg-white/70" : "border-white/5 bg-slate-900/50")}>
            <button onClick={onBack} className={cn("flex items-center gap-2 text-xs font-black transition-colors", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-white")}>
              <ArrowRight size={18} /> חזרה למסך הבית
            </button>
            <div className="flex flex-col items-center text-center">
              <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none mb-0.5", isLight ? "text-indigo-600" : "text-indigo-400")}>המצפן הרגשי</span>
              <span className="text-sm font-bold">עיבוד בילטרלי EMDR</span>
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

          <main className="max-w-xl mx-auto w-full flex-1 flex flex-col items-center justify-center pt-8 pb-24 px-6 text-center space-y-12">
            <div className="space-y-4">
              <div className="relative inline-flex p-5 rounded-full bg-indigo-500/10 text-indigo-500 mb-2 border border-indigo-500/20 shadow-2xl">
                <Zap size={44} className="animate-pulse" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tighter">לנקות את הראש</h1>
              <p className={cn("text-xs font-bold leading-relaxed max-w-sm mx-auto", isLight ? "text-slate-500" : "text-slate-400")}>
                {adjustGender("תרגול גירוי דו-צדדי (EMDR) המותאם עבורך. מצא/ו תנוחה נוחה, הרכב/י אוזניות ועקוב/י אחר הכדור כדי להרגיע את מערכת העצבים.")}
              </p>
            </div>

            <div className="w-full space-y-6">
              <div className="space-y-3 text-right" dir="rtl">
                <span className={cn("text-xs font-black tracking-widest uppercase pr-1", isLight ? "text-indigo-600" : "text-indigo-400")}>מה מקור המצוקה כעת?</span>
                <div className="flex flex-wrap gap-2 justify-start">
                  {["חרדה", "כעס", "הצפה", "זיכרון כואב", "מתח פיזי"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleSelectDistressCategory(cat)}
                      className={cn("py-2 px-3.5 rounded-xl border text-xs font-bold transition-all active:scale-95", 
                        distressCategory === cat && !customDistress 
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-600 dark:text-white shadow-sm" 
                          : isLight 
                            ? "bg-white/70 border-slate-200 text-slate-500 hover:border-slate-300" 
                            : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {distressCategory && DISTRESS_PRESETS[distressCategory] && (
                  <div className={cn("p-3.5 rounded-2xl text-[10px] font-bold leading-relaxed border transition-all duration-300 animate-in fade-in text-right", isLight ? "bg-indigo-50/50 border-indigo-100 text-indigo-700" : "bg-indigo-950/10 border-indigo-500/10 text-indigo-300")}>
                    💡 {DISTRESS_PRESETS[distressCategory].explanation}
                  </div>
                )}
                <input
                  type="text"
                  value={customDistress}
                  onChange={(e) => { setCustomDistress(e.target.value); setDistressCategory(""); }}
                  placeholder="או תארו משהו אחר במילים שלכם..."
                  className={cn("w-full rounded-2xl p-4 text-xs font-bold focus:border-indigo-500/50 outline-none border", isLight ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400" : "bg-white/5 border-white/5 text-white placeholder:text-slate-650")}
                />
              </div>

              <div className="w-full space-y-4">
                <Button 
                  onClick={handleStartSession} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[2rem] text-lg shadow-xl shadow-indigo-600/15 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <span>התחל תרגול</span>
                  <Play className="h-5 w-5 fill-white" />
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => setSessionState("setup")} 
                  className={cn(
                    "w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest bg-transparent border-2 transition-all active:scale-95",
                    isLight 
                      ? "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900" 
                      : "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span>⚙️ הגדרות תרגול</span>
                </Button>
              </div>
            </div>
          </main>
        </div>
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
                <div className="space-y-6">
                  <div className={cn("space-y-4 p-5 rounded-3xl border", isLight ? "bg-white/70 border-slate-200" : "bg-white/5 border-white/5")}>
                    <div className="flex justify-between items-center">
                      <span className={cn("text-xs font-black tracking-widest uppercase", isLight ? "text-indigo-600" : "text-indigo-400")}>דרגו את עוצמת המצוקה כעת:</span>
                      <span className={cn("text-sm font-mono font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full", isLight ? "text-indigo-600" : "text-indigo-400")}>{initialSuds} מתוך 10</span>
                    </div>
                    <Slider value={[initialSuds]} onValueChange={(vals) => setInitialSuds(vals[0])} min={1} max={10} step={1} className="py-2 cursor-pointer" />
                  </div>

                  {!hasConsentedDesensitize && (
                    <label
                      className={cn(
                        "flex items-start gap-3 p-5 rounded-3xl border cursor-pointer transition-all",
                        isLight ? "bg-amber-50 border-amber-200" : "bg-amber-950/10 border-amber-500/20"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={desensitizeConsentChecked}
                        onChange={(e) => setDesensitizeConsentChecked(e.target.checked)}
                        className="mt-1 w-5 h-5 shrink-0 accent-indigo-600 cursor-pointer"
                      />
                      <span className={cn("text-xs leading-relaxed font-bold", isLight ? "text-amber-900" : "text-amber-200")}>
                        {adjustGender("אני מבין/ה שמצב \"עיבוד\" מיועד לחומר שכבר עלה בטיפול. אני מעבד/ת כאן נושא שכבר דיברתי עליו עם המטפל/ת שלי, ומרגיש/ה מוכן/ה להתמודד איתו לבד כעת. אם המצוקה גבוהה מדי — מומלץ לפנות לעזרה מיידית.")}
                      </span>
                    </label>
                  )}
                </div>              </div>
            ) : (
              /* TAB 2: ANIMATION, SPEEDS, SOUNDS */
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Visual Stimulus Settings */}
                <div className={cn("space-y-4 p-5 rounded-3xl border", isLight ? "bg-white/70 border-slate-200" : "bg-white/5 border-white/5")}>
                  <div className={cn("flex items-center gap-2 text-xs font-black border-b pb-3 mb-2", isLight ? "border-slate-200" : "border-white/5")}><Paintbrush size={14} className={isLight ? "text-indigo-600" : "text-indigo-400"} /><span>עיצוב הגירוי הויזואלי</span></div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-500 block">סוג האנימציה</span>
                    <div className="grid grid-cols-3 gap-2">
                      {STIMULUS_SHAPES.map((sh) => (
                        <button key={sh.id} onClick={() => setStimulusShape(sh.id as any)} className={cn("py-2 px-3 rounded-xl border text-xs font-bold transition-all", stimulusShape === sh.id ? (isLight ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-white/10 border-white/20 text-white") : isLight ? "bg-transparent border-slate-200 text-slate-500" : "bg-transparent border-white/5 text-slate-400")}>{sh.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-black text-slate-500 block font-bold">צבע הכדור / האלמנט</span>
                    <div className="flex gap-3">
                      {STIMULUS_COLORS.map((col) => (
                        <button key={col.id} onClick={() => setStimulusColor(col.id as any)} className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-all", stimulusColor === col.id ? cn("ring-2 ring-offset-2 scale-110", isLight ? "ring-slate-900 ring-offset-white" : "ring-white ring-offset-slate-950") : "opacity-80 hover:opacity-100")} style={{ backgroundColor: col.hex }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pacing Speed */}
                <div className="space-y-3">
                  <span className={cn("text-xs font-black tracking-widest uppercase pr-1", isLight ? "text-indigo-600" : "text-indigo-400")}>קצב הגירוי הבילטרלי (מהירות)</span>
                  <div className="grid grid-cols-3 gap-2">
                    {SPEEDS.map((sp) => (
                      <button key={sp.id} onClick={() => setSpeed(sp.id as any)} className={cn("p-2.5 rounded-2xl border text-center flex flex-col gap-1 transition-all duration-300", speed === sp.id ? "bg-indigo-600/15 border-indigo-500 text-slate-900 dark:text-white shadow-sm" : isLight ? "bg-white/70 border-slate-200 text-slate-500 hover:border-slate-300" : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10")}>
                        <span className="text-xs font-bold block">{sp.label}</span>
                        <span className="text-[8px] text-slate-500 font-mono block">{sp.desc} למחזור</span>
                      </button>
                    ))}
                  </div>
                </div>

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
                        <span className="text-[10px] font-black text-slate-500 block">סוג הצליל הדו-צדדי</span>
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
                          <span className="text-[10px] font-black text-slate-500 block">עוצמת צליל בילטרלי</span>
                          <span className="text-[10px] font-mono text-indigo-400">{Math.round(bilateralVolume * 100)}%</span>
                        </div>
                        <Slider
                          value={[bilateralVolume * 100]}
                          max={100}
                          onValueChange={(vals) => setBilateralVolume(vals[0] / 100)}
                          className="py-2 cursor-pointer"
                        />
                      </div>

                      <div className="text-[10px] font-bold text-indigo-400 bg-indigo-500/5 p-2.5 rounded-xl border border-indigo-500/10 text-center">
                        💡 מומלץ להרכיב אוזניות סטריאו כדי לחוות את אפקט תנועת השמע הדו-צדדית.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(() => {
              const isGated = treatmentMode === 'desensitize' && !hasConsentedDesensitize && !desensitizeConsentChecked;
              return (
                <Button
                  onClick={handleStartSession}
                  disabled={isGated}
                  className={cn(
                    "w-full text-white font-black py-6 rounded-[2rem] text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3",
                    isGated
                      ? "bg-slate-400 hover:bg-slate-400 shadow-none cursor-not-allowed opacity-60"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10"
                  )}
                >
                  <span>{isGated ? "סמנו את האישור כדי להמשיך" : treatmentMode === 'desensitize' ? "התחל תרגול עיבוד" : "התחל תרגול הטמעה"}</span>
                  {!isGated && <Play className="h-5 w-5 fill-white" />}
                </Button>
              );
            })()}
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
                <><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-0.5">סט {activeSet} • פריקה והפחתת מצוקה</span><span className="text-xs font-bold text-white">{desensitizePhase === 'focus' ? "שלב התמקדות" : desensitizePhase === 'processing' ? "עיבוד בילטרלי" : "בדיקת SUDs"}</span></>
              ) : (
                <><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-0.5">הטמעת משאבים • {selectedCat.title}</span><span className="text-xs font-bold text-white">משפט {nextAffIndexRef.current === 0 ? selectedCat.affirmations.length : nextAffIndexRef.current} מתוך {selectedCat.affirmations.length}</span></>
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
                  <div className="text-center p-8 bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/10 max-w-md w-full animate-in fade-in duration-500 shadow-2xl text-right" dir="rtl">
                    <h2 className="text-xs font-black text-indigo-400 tracking-widest uppercase mb-4 text-center">שלב התמקדות גופנית</h2>
                    
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {adjustGender("המפתח לעיבוד בילטרלי אפקטיבי הוא חיבור לתחושה הפיזית. שים/י לב היכן הרגש מורגש בגוף ברגע זה.")}
                    </p>

                    <div className="p-5 rounded-3xl border mb-5 space-y-2 bg-indigo-950/20 border-indigo-500/10">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-400">
                        {customDistress || distressCategory || "מצוקה"}
                      </span>
                      <p className="text-sm font-bold text-white leading-relaxed pt-1">
                        {(() => {
                          const preset = DISTRESS_PRESETS[distressCategory] || DEFAULT_PRESET;
                          return adjustGender(preset.focusInstructions);
                        })()}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                      <Clock size={16} className="text-indigo-400 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-indigo-300">
                        {phaseTimeLeft} {adjustGender("שניות עד לתחילת העיבוד... התכונן/י")}
                      </span>
                    </div>

                    <div className="mt-5">
                      <Button 
                        onClick={handleSkipFocus}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl text-xs shadow-lg active:scale-95 transition-all"
                      >
                        התחל בעיבוד כעת (דלג)
                      </Button>
                    </div>
                  </div>
                )}
                {desensitizePhase === 'processing' && (
                  <div className="text-center p-6 max-w-lg w-full animate-in fade-in duration-500">
                    <p className="text-slate-500 text-xs font-black tracking-widest uppercase mb-1">עיבוד בילטרלי פעיל</p>
                    <p className="text-white/40 text-sm font-medium">{adjustGender("עקוב/י במבטך אחר הכדור הפועם מצד לצד")}</p>
                  </div>
                )}
                {desensitizePhase === 'checkin' && (
                  <div className="text-center p-8 bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-500">
                    <h2 className="text-2xl font-black mb-2">נשימה והערכה</h2>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      {adjustGender("קח/י נשימה עמוקה... שחרר/י...")}<br />
                      ומהי רמת המצוקה כעת בסולם של 1 עד 10?
                    </p>
                    
                    <div className="grid grid-cols-5 gap-2.5 mb-5 justify-items-center">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCurrentSuds(num)}
                          className={cn(
                            "w-11 h-11 rounded-full border text-sm font-black transition-all flex items-center justify-center active:scale-95",
                            getSudsColorClass(num, currentSuds === num)
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <div className={cn(
                      "text-center mb-6 p-3 rounded-2xl text-[11px] font-black transition-all duration-300",
                      currentSuds <= 2 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      currentSuds <= 4 ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" :
                      currentSuds <= 6 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      currentSuds <= 8 ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                      "bg-red-500/10 text-red-400 border border-red-500/20"
                    )}>
                      רמה {currentSuds}: {getSudsLabel(currentSuds)}
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={() => { 
                          setSudsHistory(prev => [...prev, currentSuds]); 
                          setActiveSet(prev => prev + 1); 
                          setDesensitizePhase('focus'); 
                          setPhaseTimeLeft(FOCUS_PHASE_DURATION); 
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
                    <p className="text-white/40 text-xs font-medium">{adjustGender("עקוב/י במבטך אחר תנועת הכדור האטית לביסוס המשאב בגוף")}</p>
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
                        סיימתם סבב מלא על כל המשפטים. שאפו אוויר נקי, והרגישו את תחושת המשאב מתפשטת ומעמיקה בכל הגוף.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setResourcePhase('speak');
                          setIsPlaying(true);
                          nextAffIndexRef.current = 0;
                          triggerStep();
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-xs"
                      >
                        עוד סבב הטמעה
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
                  className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shrink-0"
                  aria-label={isPlaying ? "השהה" : "נגן"}
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="mr-0.5" />}
                </button>

                {treatmentMode === 'desensitize' && desensitizePhase === 'processing' && (
                  <button
                    onClick={() => {
                      setDesensitizePhase('checkin');
                      setIsPlaying(false);
                      setPhaseTimeLeft(0);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2.5 rounded-full text-[10px] transition-all active:scale-95 shadow-lg shadow-indigo-600/20 shrink-0"
                  >
                    סיום סבב
                  </button>
                )}

                <div className="text-right">
                  <span className="text-[10px] font-black tracking-widest uppercase text-slate-500 block">זמן שנותר</span>
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
                      <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                          fill="none"
                          stroke="#6366F1"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                          points={sudsHistory.map((suds, index) => {
                            const x = (index / (sudsHistory.length - 1)) * 100;
                            const y = 100 - ((suds - 1) / 9) * 80 - 10;
                            return `${x},${y}`;
                          }).join(" ")}
                        />
                        {/* Area gradient under the line */}
                        <path
                          fill="url(#chart-gradient)"
                          opacity="0.15"
                          d={`M 0,100 ${sudsHistory.map((suds, index) => {
                            const x = (index / (sudsHistory.length - 1)) * 100;
                            const y = 100 - ((suds - 1) / 9) * 80 - 10;
                            return `L ${x},${y}`;
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
                          <span className="text-[10px] text-slate-500 font-black mt-1">סבב {idx === 0 ? "התחלה" : idx}</span>
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

            {treatmentMode === 'desensitize' && (
              <div className={cn("p-6 rounded-3xl border space-y-3 shadow-md",
                currentSuds <= 3 
                  ? (isLight ? "bg-emerald-500/5 border-emerald-500/20 text-slate-800" : "bg-emerald-950/10 border-emerald-500/10 text-slate-200")
                  : currentSuds <= 6
                    ? (isLight ? "bg-amber-500/5 border-amber-500/20 text-slate-800" : "bg-amber-950/10 border-amber-500/10 text-slate-200")
                    : (isLight ? "bg-rose-500/5 border-rose-500/20 text-slate-800" : "bg-rose-950/10 border-rose-500/10 text-slate-200")
              )}>
                {getSudsNextStepExplanation()}
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
              {treatmentMode === 'desensitize' && currentSuds > 6 && (
                <CrisisHelpDialog
                  gender={gender}
                  theme={theme}
                  trigger={
                    <button
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm border-2 transition-all active:scale-95",
                        isLight ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100" : "bg-rose-950/30 border-rose-500/40 text-rose-300 hover:bg-rose-950/50"
                      )}
                    >
                      <Info size={16} />
                      {adjustGender("המצוקה עדיין גבוהה — רוצה/ה לדבר עם מישהו עכשיו?")}
                    </button>
                  }
                />
              )}

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
