"use client";

import { useRef } from "react";
import { Wind, Sparkles, Music, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActivityId = "breathing" | "imagery" | "sounds";

const ACTIVITIES: { id: ActivityId; label: string; icon: typeof Wind }[] = [
  { id: "breathing", label: "נשימה", icon: Wind },
  { id: "imagery", label: "דמיון מודרך", icon: Sparkles },
  { id: "sounds", label: "מוזיקה", icon: Music },
];

const SWIPE_DISTANCE_THRESHOLD = 36;

interface ActivitySwitcherProps {
  current: ActivityId;
  onNavigate: (next: ActivityId) => void;
  onGoHome: () => void;
  theme?: "light" | "dark";
}

export default function ActivitySwitcher({ current, onNavigate, onGoHome, theme = "light" }: ActivitySwitcherProps) {
  const isLight = theme === "light";
  const touchStartX = useRef<number | null>(null);

  const currentIndex = ACTIVITIES.findIndex((a) => a.id === current);

  const goTo = (direction: 1 | -1) => {
    const nextIndex = (currentIndex + direction + ACTIVITIES.length) % ACTIVITIES.length;
    onNavigate(ACTIVITIES[nextIndex].id);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_DISTANCE_THRESHOLD) return;
    // dir="rtl" context: a finger swipe to the left moves visually toward "next" in reading order
    goTo(deltaX < 0 ? 1 : -1);
  };

  return (
    <div
      className="md:hidden fixed inset-x-0 z-30 flex justify-center pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <div
        dir="rtl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "pointer-events-auto flex items-center gap-1 p-1.5 rounded-full border shadow-xl backdrop-blur-xl transition-colors duration-300",
          isLight ? "bg-white/90 border-slate-200" : "bg-slate-900/80 border-white/10"
        )}
      >
        <button
          onClick={onGoHome}
          aria-label="מסך הבית"
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-90",
            isLight ? "text-slate-400 hover:bg-slate-100" : "text-slate-500 hover:bg-white/10"
          )}
        >
          <Home size={16} />
        </button>

        <div className={cn("w-px h-5 mx-0.5 shrink-0", isLight ? "bg-slate-200" : "bg-white/10")} />

        {ACTIVITIES.map((activity) => {
          const Icon = activity.icon;
          const isActive = activity.id === current;
          return (
            <button
              key={activity.id}
              onClick={() => onNavigate(activity.id)}
              aria-label={activity.label}
              aria-current={isActive}
              className={cn(
                "flex items-center gap-1.5 h-10 rounded-full transition-all duration-300 active:scale-90",
                isActive ? "px-4" : "w-10 justify-center",
                isActive
                  ? isLight
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : isLight
                    ? "text-slate-400 hover:bg-slate-100"
                    : "text-slate-500 hover:bg-white/10"
              )}
            >
              <Icon size={16} />
              {isActive && <span className="text-[11px] font-black whitespace-nowrap">{activity.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
