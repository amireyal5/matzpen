
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FDFDFF] via-[#F7F8FC] to-[#F0F4FF]">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/20 blur-[120px] rounded-full animate-pulse" />

      <div className={`flex flex-col items-center text-center transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-4 scale-95'}`}>
        {/* Logo - Large, unconstrained by borders */}
        <div className="relative w-56 h-56 md:w-72 md:h-72 mb-8 group">
          <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700" />
          <div className="relative w-full h-full">
            <Image 
              src="/logo.png" 
              alt="המצפן הרגשי" 
              fill 
              priority
              className="object-contain animate-in fade-in zoom-in duration-1000"
            />
          </div>
        </div>

        {/* Title and Slogan */}
        <div className="space-y-3">
          <h1 className="font-headline text-5xl font-black text-slate-900 tracking-tight leading-none drop-shadow-sm">
            המצפן הרגשי
          </h1>
          <p className="text-slate-500 font-medium text-lg tracking-wide opacity-80 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-forwards">
            מרחב בטוח לוויסות וצמיחה
          </p>
        </div>
      </div>

      {/* Bottom Branding - Moved up for better proportions (Pyramid structure) */}
      <div className={`absolute bottom-24 flex flex-col items-center gap-2 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="w-8 h-[1px] bg-slate-200 mb-2" />
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
          מבית עמיר
        </p>
      </div>
    </div>
  );
}
