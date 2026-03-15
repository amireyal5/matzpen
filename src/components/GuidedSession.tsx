"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Check, ChevronLeft, Volume2, RotateCcw, Loader2 } from "lucide-react";
import { BANK, CATS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWakeLock } from "@/hooks/use-wake-lock";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { generateSpeech } from "@/ai/flows/tts-flow";

interface GuidedSessionProps {
  catKey: string;
  practiceIdx: number;
  gender: "m" | "f";
  onBack: () => void;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

export default function GuidedSession({ catKey, practiceIdx, gender, onBack }: GuidedSessionProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    // Auto-play audio when step changes
    handlePlayAudio(currentStep.text);
    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, [stepIdx]);

  const handlePlayAudio = async (text: string) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    setIsLoadingAudio(true);
    try {
      const { audioUri } = await generateSpeech({ text, gender });
      const audio = new Audio(audioUri);
      setCurrentAudio(audio);
      
      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoadingAudio(false);
      };
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoadingAudio(false);
      };
      
      audio.play();
    } catch (err) {
      console.error("Audio generation failed", err);
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

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150" />
          <div className="relative w-24 h-24 rounded-full border-4 border-indigo-500 overflow-hidden shadow-2xl">
            <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-slate-950 rounded-full" />
        </div>
        <div className="space-y-4 max-w-sm">
          <h2 className="text-3xl font-black text-white">כל הכבוד על התרגול!</h2>
          <p className="text-slate-400 font-medium">הקדשת זמן לעצמך ולוויסות הפנימי שלך. זהו צעד משמעותי לבניית חוסן.</p>
        </div>
        <Button 
          onClick={onBack}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-8 px-12 rounded-[2rem] text-xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          חזרה למסך הבית
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white transition-colors">
          <ArrowRight size={18} />
          יציאה
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{cat.label}</span>
          <span className="text-sm font-bold">{g(practice.t)}</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden relative">
          <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-950 rounded-full" />
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <Progress value={progress} className="h-1 bg-white/5 [&>div]:bg-indigo-500 transition-all duration-500" />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-lg mx-auto w-full">
        <div className="space-y-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex justify-center">
             <div className={cn(
               "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500",
               (isPlaying || isLoadingAudio) ? "scale-110 shadow-2xl shadow-indigo-500/20" : "scale-100"
             )} style={{ backgroundColor: `${cat.hue}15` }}>
               <cat.icon size={40} style={{ color: cat.hue }} />
             </div>
          </div>

          <div className="text-center space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              {currentStep.type === "intro" ? "תובנה" : currentStep.type === "outro" ? "סיכום" : `שלב ${stepIdx}`}
            </div>
            <h3 className="text-2xl md:text-3xl font-bold leading-tight text-slate-100">
              {currentStep.text}
            </h3>
          </div>

          <div className="flex justify-center gap-4">
            <button 
              onClick={() => handlePlayAudio(currentStep.text)}
              disabled={isLoadingAudio}
              className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {isLoadingAudio ? <Loader2 size={24} className="animate-spin" /> : isPlaying ? <RotateCcw size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="p-8 grid grid-cols-2 gap-4 max-w-lg mx-auto w-full">
        <Button 
          variant="outline"
          onClick={handlePrev}
          disabled={stepIdx === 0}
          className="border-white/10 bg-transparent text-slate-400 h-16 rounded-[1.5rem] font-bold hover:bg-white/5 disabled:opacity-30"
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
