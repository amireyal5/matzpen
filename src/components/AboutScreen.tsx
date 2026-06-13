
"use client";

import { ArrowLeft, ExternalLink, ShieldCheck, BrainCircuit, Zap, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AboutScreenProps {
  onBack: () => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

export default function AboutScreen({ onBack, theme = "light", toggleTheme }: AboutScreenProps) {
  const isLight = theme === "light";
  const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 selection:bg-indigo-500 overflow-y-auto transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-slate-950 text-slate-50")} dir="rtl">
      {/* Background Decor */}
      <div className={cn("fixed top-0 right-0 w-96 h-96 blur-[120px] rounded-full pointer-events-none", isLight ? "bg-indigo-200/40" : "bg-indigo-600/10")} />
      <div className={cn("fixed bottom-0 left-0 w-96 h-96 blur-[120px] rounded-full pointer-events-none", isLight ? "bg-purple-200/30" : "bg-purple-600/10")} />

      <div className="w-full max-w-xl lg:max-w-3xl relative z-10 py-12 space-y-12">
        {/* Header Navigation */}
        <div className="w-full flex items-center justify-between mb-8">
          {/* Logo Section (Right in RTL) */}
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1.5 border", isLight ? "bg-white border-slate-200" : "bg-white/5 border-white/5")}>
              <Logo variant="icon" />
            </div>
            <div className="text-right">
              <span className={cn("block text-xs font-black leading-none", isLight ? "text-indigo-600" : "text-indigo-400")}>המצפן הרגשי</span>
              <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">EMOTIONAL COMPASS</span>
            </div>
          </div>

          {/* Right-side controls (Left in RTL) */}
          <div className="flex items-center gap-3">
            {toggleTheme && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheme}
                    className={cn(
                      "w-9 h-9 rounded-full border flex items-center justify-center transition-all active:scale-95",
                      isLight ? "bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    )}
                    aria-label={isLight ? "מעבר לתצוגה כהה" : "מעבר לתצוגה בהירה"}
                  >
                    {isLight ? <Moon size={16} /> : <Sun size={16} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isLight ? "תצוגה כהה" : "תצוגה בהירה"}</TooltipContent>
              </Tooltip>
            )}
            <button
              onClick={onBack}
              className={cn("flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-colors group", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-400 hover:text-white")}
            >
              <span>חזרה</span>
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-110" />
            <div className={cn("relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-[3rem] border-4 overflow-hidden shadow-2xl", isLight ? "border-white" : "border-white/10")}>
              <Image
                src={PROFESSIONAL_PHOTO_URL}
                alt="עמיר אייל"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className={cn("text-3xl md:text-4xl lg:text-5xl font-black font-headline leading-tight", isLight ? "text-slate-900" : "text-white")}>
              ברוכים הבאים למצפן הרגשי
            </h1>
            <p className={cn("text-lg md:text-xl font-bold leading-relaxed max-w-md mx-auto", isLight ? "text-indigo-600" : "text-indigo-300")}>
              שמי עמיר אייל, פסיכותרפיסט (MSW), מומחה CBT וטיפול גוף-נפש (SE).
            </p>
          </div>

          <div className={cn("rounded-[2.5rem] p-8 text-right border-indigo-500/10", isLight ? "glass-panel" : "dark-glass-panel")}>
            <p className={cn("text-sm md:text-base leading-relaxed font-medium", isLight ? "text-slate-600" : "text-slate-300")}>
              עם למעלה מ-20 שנות ניסיון בליווי אנשים למציאת שקט וויסות פנימי, פיתחתי את "המצפן הרגשי" מתוך הרצון להנגיש <span className={cn("font-bold", isLight ? "text-slate-900" : "text-white")}>כלי חוסן מעשיים</span> לכולם. זהו <span className={cn("font-bold", isLight ? "text-slate-900" : "text-white")}>מרחב דיגיטלי בטוח</span> שנועד ללוות אתכם ברגעים שבין המפגשים או ככלי עצמאי לוויסות.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid gap-4">
          <div className="flex items-center gap-2 mb-2 pr-2">
            <div className="w-6 h-1 bg-indigo-500 rounded-full" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">מה תמצאו כאן?</h2>
          </div>

          <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
            {[
              {
                icon: ShieldCheck,
                title: "ויסות בשפת הגוף",
                desc: "תרגילים מבוססי SE לשחרור מתח ממערכת העצבים.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10"
              },
              {
                icon: BrainCircuit,
                title: "חיווט מחדש של המחשבה",
                desc: "כלים מעשיים מעולם ה-CBT לשינוי דפוסי חשיבה מעכבים.",
                color: "text-amber-400",
                bg: "bg-amber-500/10"
              },
              {
                icon: Zap,
                title: "ביטחון בהישג יד",
                desc: "טכנולוגיה שנועדה להעניק שליטה וחוסן בכל זמן ומכל מקום.",
                color: "text-indigo-400",
                bg: "bg-indigo-500/10"
              }
            ].map((item, i) => (
              <div key={i} className={cn("flex gap-5 p-6 rounded-[2rem] border transition-all group lg:flex-col lg:items-start", isLight ? "bg-white/70 border-slate-200 hover:border-indigo-300 hover:bg-white" : "bg-slate-900/50 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/80")}>
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", item.bg)}>
                  <item.icon className={item.color} size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className={cn("font-bold", isLight ? "text-slate-900" : "text-slate-50")}>{item.title}</h3>
                  <p className={cn("text-xs leading-relaxed font-medium", isLight ? "text-slate-500" : "text-slate-400")}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className={cn("text-center space-y-8 pt-8 border-t", isLight ? "border-slate-200" : "border-white/5")}>
          <div className="space-y-3">
            <h3 className={cn("text-xl font-bold", isLight ? "text-slate-900" : "text-white")}>רוצים להכיר אותי ואת הגישה שלי לעומק?</h3>
            <p className={cn("text-sm leading-relaxed max-w-sm mx-auto", isLight ? "text-slate-500" : "text-slate-400")}>
              אני מזמין אתכם לקרוא עוד על הניסיון המקצועי שלי, על שיטות הטיפול ועל הדרך שבה אני מלווה אנשים בתהליכי שינוי.
            </p>
          </div>

          <Button
            asChild
            className="w-full py-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg transition-all shadow-xl shadow-indigo-600/10 active:scale-95"
          >
            <a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
              למידע נוסף באתר הבית של עמיר אייל
              <ExternalLink size={20} />
            </a>
          </Button>
        </div>

        {/* Footer Credit */}
        <footer className="text-center pt-8 pb-12">
          <p className={cn("text-[10px] font-bold tracking-widest uppercase", isLight ? "text-slate-400" : "text-slate-600")}>
            © {new Date().getFullYear()} המצפן הרגשי • פותח על ידי <a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">עמיר אייל</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
