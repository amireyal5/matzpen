
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LegalDialog } from "@/components/LegalDialogs";

interface LandingScreenProps {
  onComplete: (name: string, gender: "m" | "f") => void;
  onGoToAuth: () => void;
  onGoToAbout: () => void;
  initialName?: string;
  initialGender?: "m" | "f";
}

export default function LandingScreen({ onGoToAuth, onGoToAbout }: LandingScreenProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-slate-950 overflow-y-auto selection:bg-indigo-500 selection:text-white" dir="rtl">
      {/* Background Orbs - General ambient light */}
      <div className="fixed top-[10%] right-[10%] w-64 h-64 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" aria-hidden="true" />
      <div className="fixed bottom-[15%] left-[5%] w-96 h-96 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="w-full max-w-md relative z-10 flex flex-col py-12 animate-fade-in-up flex-1">
        
        {/* Central Content Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10" aria-hidden="true" />

        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-12">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden">
                <Image 
                  src="/logo.svg" 
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
            <p className="text-indigo-400 font-bold text-lg md:text-xl tracking-wide max-w-[280px] mx-auto">
              ארגז הכלים לחוסן ושקט נפשי
            </p>
          </div>

          <div className="dark-glass-panel rounded-[2.5rem] p-8 text-center border-indigo-500/10 mt-10">
            <div className="max-w-[320px] mx-auto">
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                שלום, אני <button onClick={onGoToAbout} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors font-bold">עמיר אייל</button>. יצרתי עבורכם את ה"מצפן הרגשי" כמרחב בטוח לוויסות וצמיחה, זמין עבורכם בכל רגע שתזדקקו לו.
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
        <footer className="text-center mt-auto py-8 space-y-6 border-t border-white/5">
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
