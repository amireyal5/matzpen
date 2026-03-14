
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn } from "lucide-react";
import { LegalDialog } from "@/components/LegalDialogs";

interface LandingScreenProps {
  onComplete: (name: string, gender: "m" | "f") => void;
  onGoToAuth: () => void;
  initialName?: string;
  initialGender?: "m" | "f";
}

export default function LandingScreen({ onGoToAuth }: LandingScreenProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-slate-900 overflow-y-auto selection:bg-indigo-500 selection:text-white" dir="rtl">
      {/* Background Orbs */}
      <div className="fixed top-[10%] right-[10%] w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="fixed bottom-[15%] left-[5%] w-96 h-96 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="w-full max-w-md relative z-10 flex flex-col gap-12 py-12 animate-fade-in-up">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden">
                <Image 
                  src="/logo.png" 
                  alt="לוגו המצפן הרגשי" 
                  width={48} 
                  height={48} 
                  className="object-cover"
                />
              </div>
              <div className="text-right">
                <span className="block text-lg font-black text-indigo-500 leading-none">המצפן הרגשי</span>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">EMOTIONAL COMPASS</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="font-headline text-5xl md:text-6xl font-black text-slate-50 tracking-tight leading-none">
              המצפן הרגשי
            </h1>
            <p className="text-indigo-400 font-bold text-xl tracking-wide">
              ארגז הכלים לחוסן ושקט נפשי
            </p>
          </div>

          <div className="dark-glass-panel rounded-[2.5rem] p-8 text-right border-indigo-500/10">
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              שלום, אני <a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors font-bold">עמיר אייל</a>. יצרתי עבורכם את ה"מצפן הרגשי" כמרחב בטוח לוויסות וצמיחה, זמין עבורכם בכל רגע שתזדקקו לו.
            </p>
          </div>
        </div>

        {/* Main CTA Section */}
        <div className="space-y-6 pt-4">
          <Button 
            onClick={onGoToAuth}
            className="w-full py-8 rounded-[2rem] text-2xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
          >
            בואו נתחיל
            <ArrowLeft className="size-6 transition-transform group-hover:-translate-x-1" />
          </Button>
          
          <p className="text-[11px] text-slate-500 text-center font-bold px-8 leading-relaxed">
            הצטרפו לאלפי משתמשים שכבר בונים חוסן נפשי יומיומי. <br/> ההרשמה מהירה ובטוחה.
          </p>
        </div>

        {/* Footer */}
        <footer className="text-center mt-auto py-8 space-y-6">
          <div className="flex justify-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <LegalDialog type="terms" trigger={<button className="hover:text-white transition-colors">תנאי שימוש</button>} />
            <span className="opacity-20">|</span>
            <LegalDialog type="disclaimer" trigger={<button className="hover:text-white transition-colors">דיסקליימר</button>} />
            <span className="opacity-20">|</span>
            <LegalDialog type="accessibility" trigger={<button className="hover:text-white transition-colors">נגישות</button>} />
          </div>
          <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
            © {currentYear} המצפן הרגשי • כל הזכויות שמורות ל<a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">עמיר אייל</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
