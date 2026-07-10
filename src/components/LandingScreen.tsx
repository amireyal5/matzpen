"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sun, Moon, Play, Pause, Wind } from "lucide-react";
import { LegalDialog } from "@/components/LegalDialogs";
import CrisisHelpDialog from "@/components/CrisisHelpDialog";
import Logo from "@/components/Logo";
import InteractiveParticles from "@/components/InteractiveParticles";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LandingScreenProps {
  onComplete: (name: string, gender: "m" | "f") => void;
  onGoToAuth: () => void;
  onGoToAbout: () => void;
  initialName?: string;
  initialGender?: "m" | "f";
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

type BreathStep = "inhale" | "hold" | "exhale";

export default function LandingScreen({ onGoToAuth, onGoToAbout, theme = "light", toggleTheme }: LandingScreenProps) {
  const isLight = theme === "light";
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Quick Breathing Space state
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathStep, setBreathStep] = useState<BreathStep>("inhale");
  const [breathCount, setBreathCount] = useState(4);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Quick Breathing Space logic
  useEffect(() => {
    if (!isBreathing) return;

    const timer = setInterval(() => {
      setBreathCount((prev) => {
        if (prev <= 1) {
          // Switch to next step
          setBreathStep((currentStep) => {
            if (currentStep === "inhale") return "hold";
            if (currentStep === "hold") return "exhale";
            return "inhale";
          });
          return 4; // 4 seconds per step
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathing]);

  const getBreathingText = () => {
    if (breathStep === "inhale") return "שאיפה... נשום פנימה 🌀";
    if (breathStep === "hold") return "החזקה... להישאר ברגע ✨";
    return "נשיפה... לשחרר מתח 🌬️";
  };

  const getScale = () => {
    if (!isBreathing) return 1.0;
    if (breathStep === "inhale") return 1.5;
    if (breathStep === "hold") return 1.5;
    return 1.0;
  };

  const toggleBreathing = () => {
    if (isBreathing) {
      setIsBreathing(false);
      setBreathStep("inhale");
      setBreathCount(4);
    } else {
      setIsBreathing(true);
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 overflow-y-auto selection:bg-indigo-500 selection:text-white transition-colors duration-500 relative", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-slate-950")} dir="rtl">
      {/* Interactive Background Particles */}
      <InteractiveParticles theme={theme} />

      {/* Background Orbs */}
      <div className={cn("fixed top-[10%] right-[10%] w-64 h-64 rounded-full blur-[100px] pointer-events-none -z-10", isLight ? "bg-indigo-200/40" : "bg-indigo-500/5")} aria-hidden="true" />
      <div className={cn("fixed bottom-[15%] left-[5%] w-96 h-96 rounded-full blur-[120px] pointer-events-none -z-10", isLight ? "bg-purple-200/30" : "bg-purple-500/5")} aria-hidden="true" />

      {toggleTheme && (
        <div className="fixed top-6 left-6 z-20">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className={cn(
                  "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95 shadow-sm backdrop-blur-md",
                  isLight ? "bg-white/80 border-slate-200 text-slate-500 hover:text-slate-900" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                )}
                aria-label={isLight ? "מעבר לתצוגה כהה" : "מעבר לתצוגה בהירה"}
              >
                {isLight ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{isLight ? "תצוגה כהה" : "תצוגה בהירה"}</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* עזרה ראשונה נפשית זמינה תמיד */}
      <div className="fixed top-6 right-6 z-20">
        <CrisisHelpDialog
          gender="m"
          theme={theme}
          trigger={
            <button
              className={cn(
                "h-10 px-4 rounded-full border flex items-center justify-center gap-1.5 transition-all active:scale-95 font-black text-xs shadow-md backdrop-blur-md",
                isLight
                  ? "bg-rose-600 border-rose-600 text-white hover:bg-rose-700 hover:border-rose-700"
                  : "bg-rose-950/60 border-rose-900/50 text-rose-300 hover:bg-rose-900/50 hover:text-white"
              )}
              aria-label="עזרה ראשונה נפשית (SOS) - זמין ללא התחברות"
            >
              <span className="animate-pulse">SOS</span>
            </button>
          }
        />
      </div>

      <div className="w-full max-w-md lg:max-w-lg relative z-10 flex flex-col py-12 animate-fade-in-up flex-1">

        {/* Central Content Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-20" aria-hidden="true" />

        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-10">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden p-2 transition-all duration-300 hover:rotate-12", isLight ? "bg-white border border-slate-200" : "bg-white/5")}>
                <Logo variant="icon" />
              </div>
              <div className="text-right">
                <span className={cn("block text-lg font-black leading-none", isLight ? "text-indigo-600" : "text-indigo-400")}>המצפן הרגשי</span>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">EMOTIONAL COMPASS</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className={cn("font-headline text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none drop-shadow-sm", isLight ? "text-slate-900" : "text-slate-50")}>
              המצפן הרגשי
            </h1>
            <p className={cn("font-bold text-lg md:text-xl tracking-wide max-w-[280px] mx-auto", isLight ? "text-indigo-600" : "text-indigo-400")}>
              ארגז הכלים לחוסן ושקט נפשי
            </p>
          </div>

          <div className={cn("rounded-[2.5rem] p-8 text-center border-indigo-500/10 mt-10 transition-all duration-500 hover:shadow-2xl", isLight ? "glass-panel" : "dark-glass-panel")}>
            <div className="max-w-[320px] mx-auto">
              <p className={cn("text-sm leading-relaxed font-medium", isLight ? "text-slate-600" : "text-slate-300")}>
                שלום, אני <button onClick={onGoToAbout} className={cn("underline underline-offset-4 transition-colors font-bold", isLight ? "text-indigo-600 hover:text-indigo-700" : "text-indigo-400 hover:text-indigo-300")}>עמיר אייל</button>. יצרתי עבורכם את ה"מצפן הרגשי" כמרחב בטוח לוויסות וצמיחה, אשר זמין עבורכם בכל רגע שתזדקקו לו בין המפגשים שלנו.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Breathing Space Card */}
        <div className={cn(
          "rounded-[2.5rem] p-8 mt-8 text-center border transition-all duration-500 relative overflow-hidden group shadow-lg",
          isLight ? "bg-white/60 border-slate-200/60" : "bg-slate-900/40 border-white/5"
        )}>
          {/* Animated subtle backdrop pulse */}
          <div className={cn(
            "absolute inset-0 -z-10 opacity-30 transition-all duration-1000",
            isBreathing 
              ? (breathStep === "inhale" ? "bg-emerald-500/20 scale-110" : breathStep === "hold" ? "bg-indigo-500/20 scale-110" : "bg-cyan-500/20 scale-95") 
              : "bg-transparent"
          )} />

          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center gap-2">
              <Wind size={16} className={isLight ? "text-indigo-600 animate-pulse" : "text-indigo-400 animate-pulse"} />
              <h3 className={cn("text-xs font-black tracking-widest uppercase", isLight ? "text-slate-500" : "text-slate-400")}>בועת נשימה להרגעה מהירה</h3>
            </div>

            {/* Breathing Bubble */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div 
                className={cn(
                  "rounded-full absolute transition-all ease-in-out flex items-center justify-center shadow-2xl shadow-indigo-500/10",
                  isBreathing 
                    ? (breathStep === "inhale" ? "bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white" : breathStep === "hold" ? "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white" : "bg-gradient-to-tr from-cyan-500 to-teal-500 text-white") 
                    : "bg-gradient-to-tr from-indigo-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-500 dark:text-slate-400"
                )}
                style={{
                  width: "90px",
                  height: "90px",
                  transform: `scale(${getScale()})`,
                  transitionDuration: isBreathing ? "4000ms" : "800ms"
                }}
              >
                {isBreathing ? (
                  <span className="text-xl font-black font-mono">{breathCount}</span>
                ) : (
                  <Wind size={36} className="opacity-80" />
                )}
              </div>

              {/* Pulsing ring around the bubble */}
              {isBreathing && (
                <div 
                  className={cn(
                    "absolute rounded-full border-2 animate-ping opacity-25",
                    breathStep === "inhale" ? "border-emerald-500" : breathStep === "hold" ? "border-indigo-500" : "border-cyan-500"
                  )}
                  style={{
                    width: "120px",
                    height: "120px",
                  }}
                />
              )}
            </div>

            <div className="space-y-2">
              <p className={cn("text-sm font-black transition-all min-h-[20px]", isLight ? "text-slate-800" : "text-slate-200")}>
                {isBreathing ? getBreathingText() : "מרגיש/ה הצפה או מתח כרגע? בוא/י ניקח נשימה יחד."}
              </p>
              <p className={cn("text-xs font-bold", isLight ? "text-slate-500" : "text-slate-400")}>
                {isBreathing ? "התמקד/י בקצב ובתנועה של הבועה" : "ללא צורך בהתחברות - תרגיל של דקה להחזרת האיזון"}
              </p>
            </div>

            <Button
              onClick={toggleBreathing}
              className={cn(
                "py-5 px-6 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 active:scale-95 transition-all",
                isBreathing 
                  ? "bg-rose-600 hover:bg-rose-700 text-white" 
                  : (isLight ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60")
              )}
            >
              {isBreathing ? (
                <>
                  <Pause size={14} />
                  לעצור נשימה
                </>
              ) : (
                <>
                  <Play size={14} className="fill-current" />
                  לנשום עכשיו
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main CTA Section */}
        <div className="space-y-6 pt-12 pb-16 relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-[2rem] -z-10 scale-90" aria-hidden="true" />

          <Button
            onClick={onGoToAuth}
            className="w-full py-8 rounded-[2rem] text-2xl font-black bg-gradient-to-r from-indigo-650 to-purple-650 hover:from-indigo-700 hover:to-purple-700 text-white shadow-2xl shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group border border-white/10"
          >
            בואו נתחיל
            <ArrowLeft className="size-6 transition-transform group-hover:-translate-x-2" />
          </Button>
        </div>

        {/* Footer */}
        <footer className={cn("text-center mt-auto py-8 space-y-6 border-t", isLight ? "border-slate-200" : "border-white/5")}>
          <div className={cn("flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest", isLight ? "text-slate-400" : "text-slate-500")}>
            <LegalDialog type="terms" trigger={<button className={cn("transition-colors", isLight ? "hover:text-slate-900" : "hover:text-white")}>תנאי שימוש</button>} />
            <span className="opacity-20">|</span>
            <LegalDialog type="disclaimer" trigger={<button className={cn("transition-colors", isLight ? "hover:text-slate-900" : "hover:text-white")}>הבהרה משפטית</button>} />
            <span className="opacity-20">|</span>
            <LegalDialog type="accessibility" trigger={<button className={cn("transition-colors", isLight ? "hover:text-slate-900" : "hover:text-white")}>נגישות</button>} />
          </div>
          <p className={cn("text-[10px] font-bold tracking-widest uppercase", isLight ? "text-slate-400" : "text-slate-600")}>
            © {currentYear} המצפן הרגשי • כל הזכויות שמורות ל<a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className={cn("underline transition-opacity", isLight ? "hover:text-slate-900" : "hover:text-white")}>עמיר אייל</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
