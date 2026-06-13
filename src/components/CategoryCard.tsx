
"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: any;
  count: number;
  completedCount: number;
  onClick: (key: string) => void;
}

export default function CategoryCard({ category, count, completedCount, onClick }: CategoryCardProps) {
  const Icon = category.icon;
  const isFullyCompleted = completedCount === count;

  return (
    <button
      onClick={() => onClick(category.key)}
      className="group relative flex flex-col w-full gap-2 sm:gap-4 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.2rem] bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-white/10 hover:bg-slate-900/60 transition-all duration-500 text-right overflow-hidden active:scale-95 aspect-square shadow-lg"
    >
      <div 
        className="absolute -top-4 -left-4 w-16 sm:w-20 h-16 sm:h-20 rounded-full opacity-10 pointer-events-none blur-xl" 
        style={{ backgroundColor: category.hue }}
      />
      <div 
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 duration-500 shadow-inner"
        style={{ backgroundColor: `${category.hue}15` }}
      >
        <Icon className="size-5 sm:size-6" style={{ color: category.hue }} />
      </div>
      <div className="flex-1 flex flex-col justify-center gap-1">
        <h3 className="font-headline text-sm sm:text-base font-black tracking-tight text-white group-hover:text-white transition-colors line-clamp-1">{category.label}</h3>
        <p className="text-[10px] sm:text-xs text-slate-400 font-bold leading-relaxed line-clamp-2">{category.tagLine}</p>
      </div>
      <div className="flex items-center justify-between mt-auto w-full">
        <div 
          className="inline-flex items-center text-[8px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full border" 
          style={{ color: category.hue, backgroundColor: `${category.hue}10`, borderColor: `${category.hue}20` }}
        >
          {count} כרטיסיות
        </div>
        {completedCount > 0 && (
          <div className={cn("flex items-center gap-1", isFullyCompleted ? "text-emerald-400" : "text-slate-500")}>
            <CheckCircle2 className="size-3 sm:size-3.5" />
            <span className="text-[8px] sm:text-[10px] font-bold font-mono">{completedCount}/{count}</span>
          </div>
        )}
      </div>
    </button>
  );
}
