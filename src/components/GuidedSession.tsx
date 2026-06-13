"use client";

import { useState } from "react";
import { ArrowRight, Check, ChevronLeft, Sun, Moon } from "lucide-react";
import { BANK, CATS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWakeLock } from "@/hooks/use-wake-lock";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GuidedSessionProps {
  catKey: string;
  practiceIdx: number;
  gender: "m" | "f";
  onBack: () => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

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
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700 transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100" : "bg-slate-950")}>
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150" />
          <div className="relative w-24 h-24 rounded-full border-4 border-indigo-500 overflow-hidden shadow-2xl">
            <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
          </div>
          <div className={cn("absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 rounded-full", isLight ? "border-white" : "border-slate-950")} />
        </div>
        <div className="space-y-4 max-w-sm">
          <h2 className={cn("text-3xl font-black", isLight ? "text-slate-900" : "text-white")}>כל הכבוד על התרגול!</h2>
          <p className={cn("font-medium", isLight ? "text-slate-500" : "text-slate-400")}>הקדשת זמן לעצמך ולוויסות הפנימי שלך. זהו צעד משמעותי לבניית חוסן.</p>
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
    <div className={cn("min-h-screen flex flex-col transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-slate-950 text-white")}>
      {/* Header */}
      <header className={cn("p-6 lg:px-12 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-20", isLight ? "border-slate-200 bg-white/70" : "border-white/5 bg-slate-900/50")}>
        <button onClick={onBack} className={cn("flex items-center gap-2 text-xs font-black transition-colors", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-white")}>
          <ArrowRight size={18} />
          יציאה
        </button>
        <div className="flex flex-col items-center">
          <span className={cn("text-[10px] font-black uppercase tracking-widest", isLight ? "text-indigo-600" : "text-indigo-400")}>{cat.label}</span>
          <span className="text-sm font-bold">{g(practice.t)}</span>
        </div>
        <div className="flex items-center gap-3">
          {toggleTheme && (
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
          )}
          <div className={cn("w-10 h-10 rounded-full border overflow-hidden relative", isLight ? "border-slate-200" : "border-white/10")}>
            <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
            <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border rounded-full", isLight ? "border-white" : "border-slate-950")} />
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-6 lg:px-12 pt-4">
        <Progress value={progress} className={cn("h-1 [&>div]:bg-indigo-500 transition-all duration-500", isLight ? "bg-slate-200" : "bg-white/5")} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-lg lg:max-w-2xl mx-auto w-full">
        <div className="space-y-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">

          <div className="flex justify-center">
             <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center border", isLight ? "bg-white border-slate-100 shadow-sm" : "bg-white/5 border-white/5")} style={{ backgroundColor: `${cat.hue}15` }}>
               <cat.icon size={40} style={{ color: cat.hue }} />
             </div>
          </div>

          <div className="text-center space-y-6">
            <div className={cn("inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest", isLight ? "text-indigo-600" : "text-indigo-400")}>
              {currentStep.type === "intro" ? "תובנה" : currentStep.type === "outro" ? "סיכום" : `שלב ${stepIdx}`}
            </div>
            <h3 className={cn("text-2xl md:text-3xl lg:text-4xl font-bold leading-tight", isLight ? "text-slate-900" : "text-slate-100")}>
              {currentStep.text}
            </h3>
          </div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="p-8 grid grid-cols-2 gap-4 max-w-lg lg:max-w-2xl mx-auto w-full">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={stepIdx === 0}
          className={cn("h-16 rounded-[1.5rem] font-bold disabled:opacity-30 bg-transparent", isLight ? "border-slate-200 text-slate-500 hover:bg-slate-100" : "border-white/10 text-slate-400 hover:bg-white/5")}
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
