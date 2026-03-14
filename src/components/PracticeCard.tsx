
"use client";

import { Heart, CheckCircle2, Volume2, RotateCcw, Zap, ListChecks, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIP_MAP } from "@/lib/data";

interface PracticeCardProps {
  card: any;
  idx: number;
  total: number;
  isFlipped: boolean;
  onFlip: (flipped: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onPlayAudio: () => void;
  isLoadingAudio: boolean;
  isPlaying: boolean;
  gender: "m" | "f";
  category: any;
  backTab: "why" | "steps" | "tip";
  onTabChange: (tab: "why" | "steps" | "tip") => void;
  onShowIntro: () => void;
}

export default function PracticeCard({
  card, idx, total, isFlipped, onFlip, isFavorite, onToggleFavorite,
  isCompleted, onToggleComplete, onPlayAudio, isLoadingAudio, isPlaying,
  gender, category, backTab, onTabChange, onShowIntro
}: PracticeCardProps) {
  
  const g = (obj: any) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return gender === "f" ? (obj.f || obj.m) : (obj.m || obj.f);
  };

  const CatIcon = category.icon;

  // Outer wrapper classes shared by both sides to ensure consistent "lying on background" look
  // Added overflow-hidden and matching rounded corners to prevent bleed
  const cardShellClasses = "absolute inset-0 bg-white rounded-[45px] flex flex-col overflow-hidden shadow-2xl shadow-slate-300/60 backface-hidden border border-white isolate";

  return (
    <div className="w-full h-[540px] md:h-[600px] perspective-1000 relative">
      <div 
        onClick={() => onFlip(!isFlipped)}
        className={cn(
          "relative w-full h-full transition-transform duration-[800ms] preserve-3d cursor-pointer",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* FRONT SIDE */}
        <div className={cardShellClasses}>
          {/* Header (40% height) - Added rounded-t to match card shape */}
          <div 
            className="h-[40%] w-full relative flex flex-col items-center justify-center p-8 text-white overflow-hidden rounded-t-[45px]"
            style={{ background: `linear-gradient(135deg, ${category.gFrom}, ${category.gTo})` }}
          >
            {/* Top Row: Actions */}
            <div className="absolute top-6 inset-x-6 flex justify-between items-center z-10">
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all backdrop-blur-md border border-white/20", 
                  isFavorite ? "bg-white text-rose-500 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Heart className={cn("size-5", isFavorite ? "fill-current" : "")} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all backdrop-blur-md border border-white/20", 
                  isCompleted ? "bg-white text-emerald-500 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <CheckCircle2 className={cn("size-5", isCompleted ? "fill-current" : "")} />
              </button>
            </div>

            {/* Center: Category Icon Bubble */}
            <div 
              onClick={(e) => { e.stopPropagation(); onShowIntro(); }}
              className="relative group/icon outline-none"
            >
              <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 animate-pulse-soft" />
              <div className="relative w-20 h-20 rounded-[2.2rem] bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl transition-transform group-hover/icon:scale-110">
                <CatIcon className="size-10 text-white" />
              </div>
            </div>
            
            <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{category.label}</span>
          </div>

          {/* White Area (60% height) */}
          <div className="flex-1 relative flex flex-col items-center justify-between p-8 md:p-12 text-center bg-white">
            {/* Watermark Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.03] pointer-events-none select-none z-0">
              <svg viewBox="70 80 180 123" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M70 170C70 120.294 110.294 80 160 80C209.706 80 250 120.294 250 170H205C205 145.147 184.853 125 160 125C135.147 125 115 145.147 115 170H70Z" fill={category.hue} />
                <rect x="70" y="185" width="180" height="18" fill={category.hue} />
              </svg>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center">
              <h3 className="font-headline text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight px-2">
                {g(card.t)}
              </h3>
            </div>

            {/* CTA Button */}
            <div 
              className="w-full py-5 rounded-[2rem] flex items-center justify-center gap-3 text-white font-black text-base md:text-lg transition-all active:scale-[0.97] shadow-xl hover:shadow-2xl relative z-10"
              style={{ 
                background: `linear-gradient(135deg, ${category.gFrom}, ${category.gTo})`,
                boxShadow: `0 15px 35px ${category.hue}30` 
              }}
            >
              <Zap className="size-5" />
              {gender === 'f' ? 'איך את עושה את זה?' : 'איך עושים את זה?'}
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className={cn(cardShellClasses, "rotate-y-180")}>
          {/* Header (25% height) - Added rounded-t to match card shape */}
          <div 
            className="h-[25%] w-full relative flex flex-col items-center justify-center p-6 text-white overflow-hidden shrink-0 rounded-t-[45px]"
            style={{ background: `linear-gradient(135deg, ${category.gFrom}, ${category.gTo})` }}
          >
            <div className="w-full flex justify-between items-start relative z-10">
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">{category.label}</span>
                <h4 className="font-headline text-base md:text-lg font-black text-white leading-tight line-clamp-2 max-w-[200px]">{g(card.t)}</h4>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onPlayAudio(); }}
                disabled={isLoadingAudio}
                className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all active:scale-90"
              >
                {isLoadingAudio ? <Loader2 className="size-5 animate-spin" /> : (isPlaying ? <RotateCcw className="size-5" /> : <Volume2 className="size-5" />)}
              </button>
            </div>
          </div>

          {/* Sub-Tabs Navigation */}
          <div className="bg-white px-4 pt-2 border-b border-slate-100 -mt-4 rounded-t-[35px] relative z-20 flex shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            {[
              { id: "why", label: "תובנה", icon: Zap },
              { id: "steps", label: "שלבים", icon: ListChecks },
              { id: "tip", label: "טיפ", icon: Check }
            ].map((tab) => {
              const active = backTab === tab.id;
              const TIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={(e) => { e.stopPropagation(); onTabChange(tab.id as any); }}
                  className={cn(
                    "flex-1 py-5 flex flex-col items-center gap-1.5 transition-all relative",
                    active ? "text-slate-900" : "text-slate-300 hover:text-slate-400"
                  )}
                >
                  <TIcon className="size-4" style={{ color: active ? category.hue : undefined }} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
                  {active && (
                    <div className="absolute bottom-0 inset-x-6 h-1 rounded-full animate-in fade-in duration-300" style={{ backgroundColor: category.hue }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-8 md:p-10 hide-scrollbar bg-white relative z-10" onClick={(e) => e.stopPropagation()}>
            {backTab === "why" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex gap-5 items-start">
                  <div className="w-1.5 self-stretch rounded-full shrink-0" style={{ backgroundColor: category.hue }} />
                  <p className="text-lg md:text-xl text-slate-800 leading-relaxed font-bold">
                    {g(card.why)}
                  </p>
                </div>
              </div>
            )}

            {backTab === "steps" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {card.steps.map((step: any, i: number) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md transition-transform group-hover:scale-110" 
                      style={{ background: `linear-gradient(135deg, ${category.gFrom}, ${category.gTo})` }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-base text-slate-700 font-semibold leading-relaxed pt-1">{g(step)}</p>
                  </div>
                ))}
              </div>
            )}

            {backTab === "tip" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm" style={{ color: category.hue }}>
                      <Check size={16} strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: category.hue }}>טיפ זהב</span>
                  </div>
                  <p className="text-base md:text-lg text-slate-800 font-medium italic leading-relaxed text-right">
                    "{TIP_MAP[category.key]}"
                  </p>
                </div>
                
                <div className="mt-6 flex gap-3 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-xl">💡</span>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                    {gender === 'f' ? 'ככל שתתרגלי, כך הפעולה תהפוך לאוטומטית ומרגיעה.' : 'ככל שתתרגל, כך הפעולה תהפוך לאוטומטית ומרגיעה.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Toggle */}
          <div className="p-8 pt-0 bg-white shrink-0 relative z-10">
            <div 
              className="w-full py-4 rounded-[2rem] border-2 font-black text-xs transition-all flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-95 group"
              style={{ borderColor: `${category.hue}20`, color: category.hue }}
            >
              <RotateCcw className="size-4 transition-transform duration-500 group-hover:rotate-180" />
              הפוך את הקלף
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
