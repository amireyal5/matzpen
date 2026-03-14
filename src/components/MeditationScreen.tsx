"use client";

import { useState } from "react";
import { ArrowRight, Flower2, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MeditationScreenProps {
  onBack: () => void;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

export default function MeditationScreen({ onBack }: MeditationScreenProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white transition-colors">
          <ArrowRight size={18} />
          חזרה
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">מרחב השקט</span>
          <span className="text-sm font-bold">מדיטציה ומיינדפולנס</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden relative">
          <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-lg mx-auto w-full space-y-12">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse" />
          <div className="relative w-40 h-40 rounded-[3rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-2xl">
            <Flower2 size={80} className="animate-in fade-in zoom-in duration-1000" />
          </div>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-4xl font-black tracking-tight leading-tight">מרחב המדיטציה נבנה כעת</h2>
          <p className="text-slate-400 font-medium leading-relaxed max-w-xs mx-auto text-lg">
            אני מכין עבורכם סדרת מדיטציות מונחות בקולי, שיעזרו לכם למצוא שקט עמוק וחיבור פנימי בכל רגע שתזדקקו לו.
          </p>
        </div>

        <div className="w-full grid gap-4">
          <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex items-center gap-6 group hover:bg-white/10 transition-all cursor-not-allowed opacity-60">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Play size={20} className="fill-current" />
            </div>
            <div className="text-right">
              <span className="block font-bold text-white">נשימה מונחית לשלווה</span>
              <span className="block text-xs text-slate-500">10 דקות • עמיר אייל</span>
            </div>
          </div>
          
          <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 flex items-center gap-6 group hover:bg-white/10 transition-all cursor-not-allowed opacity-60">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Play size={20} className="fill-current" />
            </div>
            <div className="text-right">
              <span className="block font-bold text-white">סריקת גוף להרפיה עמוקה</span>
              <span className="block text-xs text-slate-500">15 דקות • עמיר אייל</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 max-w-lg mx-auto w-full">
        <Button 
          onClick={onBack}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-16 rounded-[1.5rem] text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Sparkles size={20} />
          חזרה בינתיים לכלים הקיימים
        </Button>
      </footer>
    </div>
  );
}
