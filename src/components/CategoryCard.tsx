
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
      className="group relative flex flex-col gap-2 sm:gap-4 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 text-right overflow-hidden active:scale-95 aspect-square"
      style={{ backgroundColor: category.light }}
    >
      <div 
        className="absolute -top-4 -left-4 w-16 sm:w-24 h-16 sm:h-24 rounded-full opacity-10 pointer-events-none" 
        style={{ backgroundColor: category.hue }}
      />
      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm bg-white">
        <Icon className="size-5 sm:size-7" style={{ color: category.hue }} />
      </div>
      <div className="flex-1 flex flex-col justify-center gap-1">
        <h3 className="font-headline text-sm sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{category.label}</h3>
        <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{category.tagLine}</p>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <div className="inline-flex items-center text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full bg-white/50 border border-black/5" style={{ color: category.hue }}>
          {count} כרטיסיות
        </div>
        {completedCount > 0 && (
          <div className={cn("flex items-center gap-1", isFullyCompleted ? "text-emerald-600" : "text-slate-400")}>
            <CheckCircle2 className="size-3 sm:size-3.5" />
            <span className="text-[8px] sm:text-[10px] font-bold">{completedCount}/{count}</span>
          </div>
        )}
      </div>
    </button>
  );
}
