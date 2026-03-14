
"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />

      <div className={`flex flex-col items-center text-center transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-4 scale-95'}`}>
        {/* Logo - Large full version */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8 group">
          <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700" />
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Logo variant="full" className="animate-in fade-in zoom-in duration-1000" />
          </div>
        </div>

        {/* Title and Slogan are now part of the SVG but we can add some extra text if needed */}
        <div className="space-y-3">
          <p className="text-indigo-400/80 font-medium text-lg tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-forwards">
            מרחב בטוח לוויסות וצמיחה
          </p>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className={`absolute bottom-24 flex flex-col items-center gap-2 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="w-8 h-[1px] bg-slate-800 mb-2" />
        <a 
          href="https://www.amireyal.co.il/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-indigo-400 transition-colors"
        >
          מבית עמיר אייל
        </a>
      </div>
    </div>
  );
}
