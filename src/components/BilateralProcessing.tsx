
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Wind, 
  Moon, 
  ShieldCheck, 
  Quote,
  X,
  Flame,
  Brain,
  Heart,
  ChevronRight,
  Zap,
  ArrowRight,
  Loader2,
  Settings2,
  Volume2,
  Activity
} from 'lucide-react';
import { generateSpeech } from "@/ai/flows/tts-flow";
import { useWakeLock } from "@/hooks/use-wake-lock";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

/**
 * הגדרת הקטגוריות והמשפטים.
 * לכל משפט ניתן להוסיף audioUrl - אם השדה קיים, המערכת תנגן את הקובץ המוקלט במקום להשתמש ב-AI.
 */
const CATEGORIES = [
  {
    id: 'anxiety',
    title: 'ויסות חרדה',
    subtitle: 'גירוי בילטרלי 128Hz Harmonics',
    icon: Wind,
    color: 'from-blue-600/90 via-indigo-900/95 to-black',
    accent: '#60A5FA',
    affirmations: [
      { text: "אני בטוח כאן ועכשיו.", audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2Fmp3.%D7%90%D7%A0%D7%99%20%D7%91%D7%98%D7%95%D7%97%20%D7%9B%D7%90%D7%9F%20%D7%95%D7%A2%D7%9B%D7%A9%D7%99%D7%95.mp3?alt=media&token=70f8d22f-637c-4627-ab30-1b2a71626afa" },
      { text: "הנשימה שלי היא העוגן שלי.", audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2F%D7%94%D7%A0%D7%A9%D7%99%D7%9E%D7%94%20%D7%A9%D7%9C%D7%99%20%D7%94%D7%99%D7%90%20%D7%94%D7%A2%D7%95%D7%92%D7%9F%20%D7%A9%D7%9C%D7%99.mp3?alt=media&token=72105974-72f0-4d89-aece-40d23bacccab" },
      { text: "אני מאפשר למחשבות לחלוף.", audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2F%D7%90%D7%A0%D7%99%20%D7%9E%D7%90%D7%A4%D7%A9%D7%A8%20%D7%9C%D7%9E%D7%97%D7%A9%D7%91%D7%95%D7%AA%20%D7%9C%D7%97%D7%10%D7%A3.mp3?alt=media&token=f7b93f1a-c436-48b0-a170-4956aee29cc5" },
      { text: "הגוף שלי חוזר לאיזון.", audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2F%D7%94%D7%92%D7%95%D7%93%D7%A3%20%D7%A9%D7%9C%D7%99%20%D7%97%D7%95%D7%96%D7%A8%20%D7%9C%D7%90%D7%99%D7%96%D7%95%D7%9F.mp3?alt=media&token=9a142133-cc21-4114-92ee-eb71b0bbcddd" },
      { text: "השקט שבי חזק מכל סערה בחוץ.", audioUrl: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/%D7%95%D7%99%D7%A1%D7%95%D7%AA%20%D7%95%D7%97%D7%A8%D7%93%D7%94%2F%D7%94%D7%A9%D7%A7%D7%98%20%D7%A9%D7%91%D7%99%20%D7%97%D7%96%D7%A7%20%D7%9E%D7%9B%D7%9C%20%D7%A1%D7%A2%D7%A8%D7%94%20%D7%91%D7%97%D7%95%D7%A5.mp3?alt=media&token=05d601a2-2f54-4772-8b31-f416c6010eec" }
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
      { text: "אני ראוי לטוב.", audioUrl: "" },
      { text: "יש בי את הכוח להתמודד.", audioUrl: "" },
      { text: "אני סומך על עצמי.", audioUrl: "" },
      { text: "הערך שלי יציב וקיים.", audioUrl: "" },
      { text: "אני בוחר להאמין ביכולות שלי היום.", audioUrl: "" }
    ],
    voiceTone: "בטון חם, יציב ומעודד. זרימה אטית.",
    blsSpeed: 5000
  },
  {
    id: 'anger',
    title: 'שחרור כעס ותסכול',
    subtitle: 'פריקה וקרקע לרגשות עזים',
    icon: Flame,
    color: 'from-rose-900 via-red-950 to-black',
    accent: '#F43F5E',
    affirmations: [
      { text: "מותר לי להרגיש את מה שאני מרגיש.", audioUrl: "" },
      { text: "הכעס עובר דרכי ויוצא החוצה.", audioUrl: "" },
      { text: "אני בוחר להגיב מתוך רוגע.", audioUrl: "" },
      { text: "אני משחרר את המתח מהגוף.", audioUrl: "" },
      { text: "אני מוצא שלווה בתוך המרחב הפנימי שלי.", audioUrl: "" }
    ],
    voiceTone: "בטון מקורקע, יציב אך אטי וזורם.",
    blsSpeed: 4500
  },
  {
    id: 'focus',
    title: 'מיקוד וריכוז (Flow)',
    subtitle: 'סנכרון גלי מוח לעבודה',
    icon: Brain,
    color: 'from-emerald-900 via-teal-950 to-black',
    accent: '#10B981',
    affirmations: [
      { text: "התודעה שלי צלולה וממוקדת.", audioUrl: "" },
      { text: "אני נוכח במשימה שלפניי.", audioUrl: "" },
      { text: "היצירתיות זורמת ממני בקלות.", audioUrl: "" },
      { text: "אני שקט ובשליטה.", audioUrl: "" },
      { text: "תשומת הלב שלי חדה ונינוחה.", audioUrl: "" }
    ],
    voiceTone: "בטון ברור, קצבי ואטי.",
    blsSpeed: 4000
  },
  {
    id: 'compassion',
    title: 'חמלה עצמית',
    subtitle: 'חיזוק הקול הפנימי המיטיב',
    icon: Heart,
    color: 'from-pink-900 via-fuchsia-950 to-black',
    accent: '#EC4899',
    affirmations: [
      { text: "אני נותן לעצמי רשות להיות אנושי.", audioUrl: "" },
      { text: "אני מתייחס לעצמי כאל חבר טוב.", audioUrl: "" },
      { text: "זה בסדר לא להיות בסדר לפעמים.", audioUrl: "" },
      { text: "אני סולח לעצמי על העבר.", audioUrl: "" },
      { text: "אני עוטף את עצמי בהבנה ובחום.", audioUrl: "" }
    ],
    voiceTone: "בטון רך מאוד, אוהב ועוטף. זרימה אטית.",
    blsSpeed: 6000
  },
  {
    id: 'sleep',
    title: 'שינה עמוקה',
    subtitle: 'שחרור לקראת מנוחה',
    icon: Moon,
    color: 'from-purple-900 via-slate-900 to-black',
    accent: '#A78BFA',
    affirmations: [
      { text: "אני משחרר את היום.", audioUrl: "" },
      { text: "זה הזמן שלי לנוח.", audioUrl: "" },
      { text: "המיטה שלי היא מקום שקט.", audioUrl: "" },
      { text: "אני נרדם בביטחון.", audioUrl: "" },
      { text: "המחשבות נרגעות והגוף מרפה אל תוך השינה.", audioUrl: "" }
    ],
    voiceTone: "בטון נמוך מאוד, לחישתי ואטי. כמו שיר ערש.",
    blsSpeed: 7000 
  }
];

interface BilateralProcessingProps {
  gender: "m" | "f";
  onBack: () => void;
}

export default function BilateralProcessing({ gender, onBack }: BilateralProcessingProps) {
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAffText, setCurrentAffText] = useState("");
  const [showAff, setShowAff] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [blsSide, setBlsSide] = useState<'left' | 'right'>('right');
  const [isLoading, setIsLoading] = useState(false);
  
  useWakeLock(isPlaying);
  
  const [droneVolume, setDroneVolume] = useState(0.6);
  const [droneFreq, setDroneFrequency] = useState(128);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const musicGainNodeRef = useRef<GainNode | null>(null); 
  const masterGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const activeOscillators = useRef<OscillatorNode[]>([]);
  const affIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const blsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      
      masterGainRef.current = audioCtxRef.current!.createGain();
      musicGainNodeRef.current = audioCtxRef.current!.createGain();
      pannerRef.current = audioCtxRef.current!.createStereoPanner();
      filterNodeRef.current = audioCtxRef.current!.createBiquadFilter();
      
      filterNodeRef.current.type = 'lowpass';
      filterNodeRef.current.frequency.setValueAtTime(800, audioCtxRef.current!.currentTime);
      filterNodeRef.current.Q.setValueAtTime(0.7, audioCtxRef.current!.currentTime);

      musicGainNodeRef.current!.connect(filterNodeRef.current);
      filterNodeRef.current.connect(pannerRef.current!);
      pannerRef.current!.connect(masterGainRef.current!);
      masterGainRef.current!.connect(audioCtxRef.current!.destination);
    }
  };

  const clearCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.onended = null;
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }
  };

  const stopAll = () => {
    activeOscillators.current.forEach(osc => {
      try { 
        osc.stop(); 
      } catch(e) {}
    });
    activeOscillators.current = [];
    clearCurrentAudio();
    if (affIntervalRef.current) clearInterval(affIntervalRef.current);
    if (blsIntervalRef.current) clearInterval(blsIntervalRef.current);
  };

  const playBackgroundDrone = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || !musicGainNodeRef.current) return;

    activeOscillators.current.forEach(o => { try { o.stop(); } catch(e) {} });
    activeOscillators.current = [];

    const baseFreq = droneFreq; 
    const harmonicRatios = [1, 2, 4, 0.5];
    const gains = [0.5, 0.3, 0.1, 0.1];
    
    harmonicRatios.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(baseFreq * ratio, ctx.currentTime);
      
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(gains[i] * droneVolume, ctx.currentTime + 4);
      
      osc.connect(g).connect(musicGainNodeRef.current!);
      osc.start();
      activeOscillators.current.push(osc);
    });
  };

  useEffect(() => {
    if (musicGainNodeRef.current && audioCtxRef.current) {
      musicGainNodeRef.current.gain.setTargetAtTime(droneVolume, audioCtxRef.current.currentTime, 0.2);
    }
  }, [droneVolume]);

  useEffect(() => {
    if (activeOscillators.current.length > 0 && audioCtxRef.current) {
      const harmonicRatios = [1, 2, 4, 0.5];
      activeOscillators.current.forEach((osc, i) => {
        osc.frequency.setTargetAtTime(droneFreq * harmonicRatios[i], audioCtxRef.current!.currentTime, 1.0);
      });
    }
  }, [droneFreq]);

  const speakAffirmation = async (aff: { text: string, audioUrl?: string }) => {
    if (!audioCtxRef.current || !selectedCat) return;
    
    setIsSpeaking(true);
    setIsLoading(true);

    try {
      // הנמכת מוזיקת הרקע בזמן הדיבור
      if (musicGainNodeRef.current) {
        musicGainNodeRef.current.gain.linearRampToValueAtTime(droneVolume * 0.15, audioCtxRef.current.currentTime + 1.5);
      }

      let audioSrc = "";

      if (aff.audioUrl) {
        // שימוש בקובץ שהועלה
        audioSrc = aff.audioUrl;
      } else {
        // שימוש ב-AI אם אין קובץ
        const { audioUri } = await generateSpeech({ 
          text: `${selectedCat.voiceTone}: ${aff.text}`, 
          gender 
        });
        audioSrc = audioUri;
      }
      
      const audio = new Audio(audioSrc);
      currentAudioRef.current = audio;

      const source = audioCtxRef.current.createMediaElementSource(audio);
      source.connect(pannerRef.current!); 

      audio.onended = () => {
        setIsSpeaking(false);
        if (musicGainNodeRef.current && audioCtxRef.current) {
          musicGainNodeRef.current.gain.linearRampToValueAtTime(droneVolume, audioCtxRef.current.currentTime + 4);
        }
      };
      
      audio.play();
      setIsLoading(false);
    } catch (error) {
      console.error("Audio Pipeline Error:", error);
      setIsSpeaking(false);
      setIsLoading(false);
      if (musicGainNodeRef.current && audioCtxRef.current) {
        musicGainNodeRef.current.gain.linearRampToValueAtTime(droneVolume, audioCtxRef.current.currentTime + 1.0);
      }
    }
  };

  const triggerStep = () => {
    if (!selectedCat || !isPlaying) return;
    
    const randomAffObj = selectedCat.affirmations[Math.floor(Math.random() * selectedCat.affirmations.length)];
    
    setCurrentAffText(randomAffObj.text);
    setShowAff(true);
    speakAffirmation(randomAffObj);
    
    setTimeout(() => {
        setShowAff(false);
    }, 18000); 
  };

  useEffect(() => {
    if (isPlaying && selectedCat) {
      initAudio();
      stopAll();
      playBackgroundDrone();
      
      triggerStep();
      
      const tickDuration = selectedCat.blsSpeed / 2;

      blsIntervalRef.current = setInterval(() => {
        setBlsSide(prev => {
          const newSide = prev === 'right' ? 'left' : 'right';
          if (pannerRef.current && audioCtxRef.current) {
            pannerRef.current.pan.linearRampToValueAtTime(
                newSide === 'right' ? 0.85 : -0.85, 
                audioCtxRef.current.currentTime + (tickDuration / 1000)
            );
          }
          return newSide;
        });
      }, tickDuration);

      affIntervalRef.current = setInterval(triggerStep, 35000); 
      
    } else {
      stopAll();
      setShowAff(false);
    }
    
    return () => stopAll();
  }, [isPlaying, selectedCat]);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-right overflow-hidden select-none" dir="rtl">
      
      <div className={cn(
        "fixed inset-0 transition-all duration-[5000ms] ease-in-out",
        selectedCat ? "opacity-100" : "opacity-0"
      )}>
        <div className={cn("absolute inset-0 bg-gradient-to-br", selectedCat?.color)} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen" />
      </div>

      {!selectedCat ? (
        <div className="min-h-screen flex flex-col">
          <header className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md relative z-20">
            <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white transition-colors">
              <ArrowRight size={18} />
              חזרה
            </button>
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">מרחב העיבוד</span>
              <span className="text-sm font-bold text-white">Bilateral Processing</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden relative">
              <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
            </div>
          </header>

          <main className="max-w-xl mx-auto pt-16 pb-12 px-6 relative z-10 overflow-y-auto flex-1">
            <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
              <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">המצפן הטיפולי</h1>
              <p className="text-white/40 text-sm font-medium italic">עיבוד רגשי בילטרלי הרמוני (128Hz-512Hz) לסנכרון שתי המיספרות המוח.</p>
            </header>

            <div className="grid gap-4 mb-20">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { 
                    setSelectedCat(cat); 
                    setIsPlaying(true); 
                  }}
                  className="group bg-white/[0.03] backdrop-blur-3xl p-6 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all duration-500 text-right flex items-center justify-between shadow-2xl active:scale-[0.98]"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:bg-white/10 transition-all">
                      <cat.icon className="size-6" style={{ color: cat.accent }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">{cat.title}</h3>
                      <p className="text-white/30 text-[10px] tracking-widest uppercase">{cat.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-white/10 group-hover:text-white/60 transition-transform group-hover:translate-x-[-5px]" size={20} />
                </button>
              ))}
            </div>
          </main>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col relative">
          
          <div className="p-8 flex justify-between items-start z-50">
             <button onClick={() => { setSelectedCat(null); setIsPlaying(false); }} className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-3xl border border-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
              <X size={20} />
            </button>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-3xl border border-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
                  <Settings2 size={20} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-slate-900/90 backdrop-blur-xl border-white/10 rounded-[2rem] p-6 shadow-2xl" side="bottom" align="end">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-white/60">
                      <span className="text-[10px] font-black uppercase tracking-widest">עוצמת צליל רקע</span>
                      <Volume2 size={14} />
                    </div>
                    <Slider 
                      value={[droneVolume * 100]} 
                      max={100} 
                      step={1} 
                      onValueChange={(vals) => setDroneVolume(vals[0] / 100)}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-white/60">
                      <span className="text-[10px] font-black uppercase tracking-widest">תדר בסיס (Hz): {droneFreq}</span>
                      <Activity size={14} />
                    </div>
                    <Slider 
                      value={[droneFreq]} 
                      min={64}
                      max={512} 
                      step={1} 
                      onValueChange={(vals) => setDroneFrequency(vals[0])}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="text-left absolute left-1/2 -translate-x-1/2 top-10 pointer-events-none">
               <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] block mb-1">Active Processing</span>
               <div className="flex items-center gap-2 justify-center">
                 <div className={cn(
                   "w-1.5 h-1.5 rounded-full transition-all duration-500",
                   isSpeaking ? "bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]" : "bg-white/10"
                 )} />
                 <span className="text-white/40 text-[10px] font-bold">{selectedCat.title}</span>
               </div>
            </div>
          </div>

          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none">
             <div 
               className={cn(
                 "w-10 h-10 rounded-full bg-white/40 blur-md shadow-[0_0_40px_rgba(255,255,255,0.5)] absolute transform-gpu"
               )}
               style={{ 
                 transition: `left ${selectedCat.blsSpeed / 2}ms cubic-bezier(0.45, 0.05, 0.55, 0.95), opacity 2000ms, transform 1000ms`,
                 left: blsSide === 'left' ? '12%' : '88%',
                 opacity: showAff ? 0.7 : 0.15,
                 scale: isSpeaking ? '2.5' : '1',
                 boxShadow: isSpeaking ? `0 0 60px ${selectedCat.accent}` : 'none'
               }}
             />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 pb-32">
            <div className={cn(
              "max-w-4xl w-full text-center transition-all duration-[3000ms]",
              showAff ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-3xl"
            )}>
               <Quote className="text-white/5 mx-auto mb-8 w-16 h-16" />
               <h2 className="text-white text-3xl md:text-6xl font-black leading-tight tracking-tight px-4 drop-shadow-2xl">
                 {currentAffText}
               </h2>
            </div>
          </div>

          <div className="fixed bottom-10 left-0 right-0 flex justify-center px-6 z-50">
            <div className="bg-black/60 backdrop-blur-3xl p-3 px-8 rounded-full border border-white/10 flex items-center gap-8 shadow-2xl">
               <div className="flex items-center gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-0.5 rounded-full transition-all duration-300",
                        blsSide === (i < 2 ? 'left' : 'right') ? "bg-indigo-400 shadow-[0_0_8px_indigo]" : "bg-white/10"
                      )}
                      style={{ height: isPlaying ? '14px' : '4px' }}
                    />
                  ))}
               </div>

               <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
               >
                 {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="mr-1" />}
               </button>

               <div className="flex items-center gap-2 text-white/20">
                 {isLoading ? <Loader2 size={14} className="animate-spin text-indigo-400" /> : <Zap size={14} className={isSpeaking ? 'text-indigo-400' : ''} />}
                 <span className="text-[9px] font-black tracking-widest uppercase">Pure Harmonic Flow</span>
               </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
