"use client";

import { useState } from "react";
import { Flame, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateDocumentNonBlocking } from "@/firebase";
import { MOOD_OPTIONS, computeStreak, todayKey, type MoodLogs, type MoodOption } from "@/lib/mood";

interface MoodCheckInProps {
  profileData: any;
  profileRef: any;
  gender: "m" | "f";
  isLight: boolean;
  onSelectCategory: (key: string) => void;
  onGoToBreathing: (breathingId?: string) => void;
}

export default function MoodCheckIn({ profileData, profileRef, gender, isLight, onSelectCategory, onGoToBreathing }: MoodCheckInProps) {
  const moodLogs: MoodLogs = profileData?.moodLogs || {};
  const today = todayKey();
  const todayEntry = moodLogs[today];
  const streak = computeStreak(moodLogs);
  const [justLogged, setJustLogged] = useState<MoodOption | null>(null);

  const handlePick = (option: MoodOption) => {
    if (!profileRef) return;
    updateDocumentNonBlocking(profileRef, {
      [`moodLogs.${today}`]: { mood: option.id, value: option.value, ts: Date.now() },
    });
    setJustLogged(option);
  };

  const activeEntry = todayEntry
    ? MOOD_OPTIONS.find((o) => o.id === todayEntry.mood) || null
    : justLogged;

  const showSuggestion = !!justLogged?.suggestionCatKey;

  return (
    <div
      className={cn(
        "rounded-[2rem] p-5 border backdrop-blur-xl shadow-sm transition-all",
        isLight ? "bg-white/70 border-slate-200" : "bg-slate-900/40 border-white/5"
      )}
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-3">
        <span className={cn("text-[10px] font-black uppercase tracking-widest", isLight ? "text-slate-500" : "text-slate-400")}>
          {activeEntry ? "תיעוד מצב יומי" : "איך אתה מרגיש כרגע?"}
        </span>
        {streak > 0 && (
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black",
              isLight ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            )}
          >
            <Flame size={12} className="fill-current" />
            <span>{streak} ימים ברצף</span>
          </div>
        )}
      </div>

      {activeEntry ? (
        <div className="flex items-center gap-3 pt-3">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0", isLight ? "bg-indigo-50" : "bg-indigo-500/10")}>
            {activeEntry.emoji}
          </div>
          <div className="flex-1 space-y-0.5">
            <p className={cn("text-sm font-black", isLight ? "text-slate-900" : "text-white")}>{activeEntry.label}</p>
            <p className={cn("text-[11px] font-bold", isLight ? "text-slate-400" : "text-slate-500")}>
              תודה שתיעדת — חזרו מחר לשמור על הרצף
            </p>
          </div>
          <Check size={18} className="text-emerald-500 shrink-0" />
        </div>
      ) : (
        <div className="flex justify-between gap-2 pt-3">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handlePick(option)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all active:scale-95",
                isLight ? "border-slate-100 hover:border-indigo-300 hover:bg-indigo-50" : "border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5"
              )}
              aria-label={option.label}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className={cn("text-[10px] font-bold leading-none", isLight ? "text-slate-500" : "text-slate-400")}>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {showSuggestion && justLogged?.suggestionCatKey && (
        <div className="pt-4 mt-3 border-t border-dashed border-slate-200/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className={cn("text-xs font-bold", isLight ? "text-slate-600" : "text-slate-300")}>
            רוצה לנסות כלי שיעזור עכשיו?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onGoToBreathing()}
              className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-black hover:bg-emerald-500/20 transition-colors active:scale-95"
            >
              נשימה
            </button>
            <button
              onClick={() => onSelectCategory(justLogged.suggestionCatKey!)}
              className="px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[11px] font-black hover:bg-indigo-500/20 transition-colors active:scale-95"
            >
              {justLogged.suggestionLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
