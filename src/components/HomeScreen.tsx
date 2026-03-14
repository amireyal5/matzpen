"use client";

import { useState, useEffect } from "react";
import { CATS, BANK } from "@/lib/data";
import { Compass } from "lucide-react";

interface HomeScreenProps {
  name: string;
  onSelectCategory: (key: string) => void;
  onBack: () => void;
}

export default function HomeScreen({ name, onSelectCategory, onBack }: HomeScreenProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-xl mx-auto space-y-8 py-4 animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 tracking-wider">שלום, {name} 🌿</p>
            <h2 className="text-3xl font-headline font-black text-slate-900 leading-tight">מה תרצה לעבוד עליו?</h2>
            <p className="text-xs text-slate-400 font-medium">10 קטגוריות • 100 כרטיסיות חוסן</p>
          </div>
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <Compass size={20} />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-4">
          {CATS.map((c) => {
            const Icon = c.icon;
            const count = (BANK[c.key] || []).length;
            return (
              <button
                key={c.key}
                onClick={() => onSelectCategory(c.key)}
                className="group relative flex flex-col gap-3 p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 text-right overflow-hidden active:scale-95"
                style={{ backgroundColor: c.light }}
              >
                <div 
                  className="absolute -top-4 -left-4 w-20 h-20 rounded-full opacity-10 pointer-events-none" 
                  style={{ backgroundColor: c.hue }}
                />
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300" 
                  style={{ backgroundColor: `${c.hue}15` }}
                >
                  <Icon size={20} style={{ color: c.hue }} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-lg font-bold tracking-tight" style={{ color: c.hue }}>{c.label}</h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{c.tagLine}</p>
                </div>
                <div 
                  className="inline-flex items-center self-start text-[9px] font-black px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${c.hue}15`, color: c.hue }}
                >
                  {count} כרטיסיות
                </div>
              </button>
            );
          })}
        </div>

        <footer className="text-center py-8 opacity-80">
          <p className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">
            © {currentYear} המצפן הרגשי • כל הזכויות <a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600 transition-colors">עמיר</a> אייל
          </p>
        </footer>
      </div>
    </div>
  );
}
