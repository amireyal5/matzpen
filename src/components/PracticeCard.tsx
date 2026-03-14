
"use client";

import { Heart, CheckCircle2, BookOpen, Volume2, RotateCcw, Zap, ListChecks, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

  return (
    <div className="w-full h-[440px] md:h-[520px] perspective-1000">
      <div className={cn(
        "relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer",
        isFlipped ? "rotate-y-180" : ""
      )}>
        {/* Front Side */}
        <div className="absolute inset-0 bg-white rounded-[2.5rem] p-6 md:p-12 flex flex-col items-center justify-between diffused-shadow backface-hidden border border-slate-50">
          <div className="w-full flex justify-between items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                  className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all", isFavorite ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-300")}
                >
                  <Heart className={cn("size-5 md:size-6", isFavorite ? "fill-current" : "")} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{isFavorite ? "הסר מהעוגנים" : "הוסף לעוגנים"}</TooltipContent>
            </Tooltip>
            <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">כרטיסייה {idx + 1}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                   onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
                   className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all", isCompleted ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-300")}
                >
                  <CheckCircle2 className={cn("size-5 md:size-6", isCompleted ? "fill-current" : "")} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{isCompleted ? "בוצע" : "סמן כבוצע"}</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-8">
            <button 
              onClick={(e) => { e.stopPropagation(); onShowIntro(); }}
              className="w-16 h-16 md:w-24 md:h-24 rounded-[1.5rem] flex items-center justify-center shadow-lg hover:scale-105 transition-transform" 
              style={{ backgroundColor: `${category.hue}15` }}
            >
              <CatIcon className="size-8 md:size-10" style={{ color: category.hue }} />
            </button>
            <h3 className="font-headline text-xl md:text-3xl font-black text-slate-950 text-center leading-tight px-2">
              {g(card.t)}
            </h3>
          </div>

          <div className="w-full">
            <button 
              onClick={(e) => { e.stopPropagation(); onFlip(true); }}
              className="w-full py-4 md:py-6 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-sm md:text-lg transition-all active:scale-[0.97]"
              style={{ background: `linear-gradient(135deg, ${category.gFrom}, ${category.gTo})`, boxShadow: `0 15px 35px ${category.hue}30` }}
            >
              <BookOpen className="size-5 md:size-6" />
              {gender === 'f' ? 'איך את עושה את זה?' : 'איך עושים את זה?'}
            </button>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 bg-white rounded-[2.5rem] flex flex-col overflow-hidden diffused-shadow backface-hidden rotate-y-180 border border-slate-50">
          <div className="p-6 md:p-10 pb-4 md:pb-8 flex justify-between items-start" style={{ background: `linear-gradient(135deg, ${category.gFrom}, ${category.gTo})` }}>
            <div className="flex-1">
              <p className="text-[10px] font-black text-white/60 tracking-widest uppercase mb-1">{category.label}</p>
              <h4 className="font-headline text-lg md:text-2xl font-bold text-white leading-tight">{g(card.t)}</h4>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onPlayAudio(); }}
              disabled={isLoadingAudio}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              {isLoadingAudio ? <Loader2 className="size-5 md:size-6 animate-spin" /> : (isPlaying ? <RotateCcw className="size-5 md:size-6" /> : <Volume2 className="size-5 md:size-6" />)}
            </button>
          </div>

          <div className="flex bg-slate-50 border-b border-slate-100">
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
                    "flex-1 py-3 md:py-5 flex flex-col items-center gap-1.5 transition-all border-b-2",
                    active ? "bg-white border-indigo-600" : "border-transparent text-slate-400"
                  )}
                >
                  <TIcon className="size-4 md:size-[18px]" style={{ color: active ? category.hue : undefined }} />
                  <span className="text-[10px] md:text-[11px] font-black uppercase" style={{ color: active ? category.hue : undefined }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 hide-scrollbar">
            {backTab === "why" && (
              <div className="animate-in fade-in duration-500">
                <p className="text-base md:text-lg text-slate-700 leading-[1.7] font-medium border-r-4 pr-4" style={{ borderColor: category.hue }}>
                  {g(card.why)}
                </p>
              </div>
            )}

            {backTab === "steps" && (
              <div className="space-y-3 animate-in fade-in duration-500">
                {card.steps.map((step: any, i: number) => (
                  <div key={i} className="flex gap-3 items-start bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0" style={{ background: `linear-gradient(135deg, ${category.gFrom}, ${category.gTo})` }}>
                      {i + 1}
                    </div>
                    <p className="text-sm md:text-base text-slate-800 font-semibold leading-relaxed">{g(step)}</p>
                  </div>
                ))}
              </div>
            )}

            {backTab === "tip" && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 relative">
                  <p className="text-sm md:text-base text-indigo-900 font-medium italic">
                    "{TIP_MAP[category.key]}"
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex gap-3">
                  <span className="text-lg">💡</span>
                  <p className="text-[10px] md:text-xs text-amber-900 font-bold leading-relaxed">
                    {gender === 'f' ? 'ככל שתתרגלי, כך הפעולה תהפוך לאוטומטית ומרגיעה.' : 'ככל שתתרגל, כך הפעולה תהפוך לאוטומטית ומרגיעה.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 md:p-10 pt-0 bg-white">
            <button 
              onClick={(e) => { e.stopPropagation(); onFlip(false); }}
              className="w-full py-3 rounded-2xl border-2 font-black text-xs transition-all flex items-center justify-center gap-3"
              style={{ borderColor: `${category.hue}20`, color: category.hue }}
            >
              <RotateCcw className="size-4" />
              הפוך את הקלף
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
