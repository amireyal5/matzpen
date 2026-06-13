"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { LegalDialog } from "@/components/LegalDialogs";
import Logo from "@/components/Logo";
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

export default function LandingScreen({ onGoToAuth, onGoToAbout, theme = "light", toggleTheme }: LandingScreenProps) {
  const isLight = theme === "light";
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 overflow-y-auto selection:bg-indigo-500 selection:text-white transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-slate-950")} dir="rtl">
      {/* Background Orbs */}
      <div className={cn("fixed top-[10%] right-[10%] w-64 h-64 rounded-full blur-[100px] pointer-events-none", isLight ? "bg-indigo-200/40" : "bg-indigo-500/5")} aria-hidden="true" />
      <div className={cn("fixed bottom-[15%] left-[5%] w-96 h-96 rounded-full blur-[120px] pointer-events-none", isLight ? "bg-purple-200/30" : "bg-purple-500/5")} aria-hidden="true" />

      {toggleTheme && (
        <div className="fixed top-6 left-6 z-20">
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
        </div>
      )}

      <div className="w-full max-w-md lg:max-w-lg relative z-10 flex flex-col py-12 animate-fade-in-up flex-1">

        {/* Central Content Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10" aria-hidden="true" />

        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-10">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden p-2", isLight ? "bg-white border border-slate-200" : "bg-white/5")}>
                <Logo variant="icon" />
              </div>
              <div className="text-right">
                <span className={cn("block text-lg font-black leading-none", isLight ? "text-indigo-600" : "text-indigo-400")}>המצפן הרגשי</span>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">EMOTIONAL COMPASS</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className={cn("font-headline text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none", isLight ? "text-slate-900" : "text-slate-50")}>
              המצפן הרגשי
            </h1>
            <p className={cn("font-bold text-lg md:text-xl tracking-wide max-w-[280px] mx-auto", isLight ? "text-indigo-600" : "text-indigo-400")}>
              ארגז הכלים לחוסן ושקט נפשי
            </p>
          </div>

          <div className={cn("rounded-[2.5rem] p-8 text-center border-indigo-500/10 mt-10", isLight ? "glass-panel" : "dark-glass-panel")}>
            <div className="max-w-[320px] mx-auto">
              <p className={cn("text-sm leading-relaxed font-medium", isLight ? "text-slate-600" : "text-slate-300")}>
                שלום, אני <button onClick={onGoToAbout} className={cn("underline underline-offset-4 transition-colors font-bold", isLight ? "text-indigo-600 hover:text-indigo-700" : "text-indigo-400 hover:text-indigo-300")}>עמיר אייל</button>. יצרתי עבורכם את ה"מצפן הרגשי" כמרחב בטוח לוויסות וצמיחה, אשר זמין עבורכם בכל רגע שתזדקקו לו בין המפגשים שלנו.
              </p>
            </div>
          </div>
        </div>

        {/* Main CTA Section */}
        <div className="space-y-6 pt-12 pb-16 relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-[2rem] -z-10 scale-90" aria-hidden="true" />

          <Button
            onClick={onGoToAuth}
            className="w-full py-8 rounded-[2rem] text-2xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
          >
            בואו נתחיל
            <ArrowLeft className="size-6 transition-transform group-hover:-translate-x-1" />
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
