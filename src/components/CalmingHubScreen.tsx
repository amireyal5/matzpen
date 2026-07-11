"use client";

import { useState } from "react";
import { ArrowRight, Wind, Sparkles, Music, Brain, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, adjustGender } from "@/lib/utils";
import InteractiveParticles from "@/components/InteractiveParticles";

interface CalmingHubScreenProps {
  onBack: () => void;
  onGoToBreathing: (breathingId?: string) => void;
  onGoToImagery: () => void;
  onGoToSounds: (soundId?: string) => void;
  onGoToBilateral: () => void;
  name: string;
  gender: "m" | "f";
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

export default function CalmingHubScreen({
  onBack,
  onGoToBreathing,
  onGoToImagery,
  onGoToSounds,
  onGoToBilateral,
  name,
  gender,
  theme = "light",
  toggleTheme,
}: CalmingHubScreenProps) {
  const isLight = theme === "light";
  const isFemale = gender === "f";

  // כותרת פנייה מותאמת אישית
  const titleText = isFemale
    ? `מה יעזור לך להירגע עכשיו, ${name}?`
    : `מה יעזור לך להירגע עכשיו, ${name}?`;
  const subtitleText = isFemale
    ? "בחרי את הדרך הנכונה עבורך כרגע להחזרת השקט והאיזון."
    : "בחר את הדרך הנכונה עבורך כרגע להחזרת השקט והאיזון.";

  const options = [
    {
      id: "breathing",
      title: "🌬️ נשימה מודרכת",
      description: "תרגיל נשימה (קרקוע מרגיע) להאטת דופק מהירה והרגעת הגוף.",
      benefit: isFemale ? "מתאים להורדה מיידית של רמת המתח והחזרת השליטה." : "מתאים להורדה מיידית של רמת המתח והחזרת השליטה.",
      recommendText: "מומלץ להתחלה",
      colorClass: isLight 
        ? "bg-emerald-50/70 border-emerald-100 hover:bg-emerald-100/60 hover:border-emerald-300 text-emerald-950" 
        : "bg-emerald-950/20 border-emerald-900/30 hover:bg-emerald-950/30 hover:border-emerald-500/40 text-emerald-100",
      icon: Wind,
      iconColor: isLight ? "text-emerald-600 bg-emerald-50" : "text-emerald-400 bg-emerald-500/10",
      action: () => onGoToBreathing("ptsd-grounding"),
    },
    {
      id: "bilateral",
      title: "🧠 עיבוד בילטרלי (EMDR)",
      description: "גירוי דו-צדדי באמצעות כדור פועם להרגעת עוררות יתר והצפה רגשית.",
      benefit: isFemale ? "מומלץ כשיש רעש מחשבתי חזק או כשאת מוצפת רגשית." : "מומלץ כשיש רעש מחשבתי חזק או כשאתה מוצף רגשית.",
      recommendText: "להצפה רגשית חזקה",
      colorClass: isLight 
        ? "bg-sky-50/70 border-sky-100 hover:bg-sky-100/60 hover:border-sky-300 text-sky-950" 
        : "bg-sky-950/20 border-sky-900/30 hover:bg-sky-950/30 hover:border-sky-500/40 text-sky-100",
      icon: Brain,
      iconColor: isLight ? "text-sky-600 bg-sky-50" : "text-sky-400 bg-sky-500/10",
      action: () => onGoToBilateral(),
    },
    {
      id: "imagery",
      title: "🌿 דימיון מודרך",
      description: "מסע ויזואלי שליו עם קול מלווה ומוזיקה לבריחה למקום בטוח.",
      benefit: isFemale ? "מתאים כשאת זקוקה להתנתק מעט ולהטעין כוחות." : "מתאים כשאתה זקוק להתנתק מעט ולהטעין כוחות.",
      colorClass: isLight 
        ? "bg-indigo-50/70 border-indigo-100 hover:bg-indigo-100/60 hover:border-indigo-300 text-indigo-950" 
        : "bg-indigo-950/20 border-indigo-900/30 hover:bg-indigo-950/30 hover:border-indigo-500/40 text-indigo-100",
      icon: Sparkles,
      iconColor: isLight ? "text-indigo-600 bg-indigo-50" : "text-indigo-400 bg-indigo-500/10",
      action: () => onGoToImagery(),
    },
    {
      id: "sounds",
      title: "🎵 צלילים מרגיעים",
      description: "מוזיקת רקע ייחודית ונופים טבעיים לעטיפת הקשב והשקטת התודעה.",
      benefit: isFemale ? "מצוין כליווי לפעילות אחרת או כשאת רוצה מוזיקה מרגיעה." : "מצוין כליווי לפעילות אחרת או כשאתה רוצה מוזיקה מרגיעה.",
      colorClass: isLight 
        ? "bg-purple-50/70 border-purple-100 hover:bg-purple-100/60 hover:border-purple-300 text-purple-950" 
        : "bg-purple-950/20 border-purple-900/30 hover:bg-purple-950/30 hover:border-purple-500/40 text-purple-100",
      icon: Music,
      iconColor: isLight ? "text-purple-600 bg-purple-50" : "text-purple-400 bg-purple-500/10",
      action: () => onGoToSounds(),
    },
  ];

  return (
    <div className={cn("min-h-screen flex flex-col items-center p-6 overflow-y-auto selection:bg-indigo-500 selection:text-white transition-colors duration-500 relative", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-slate-950")} dir="rtl">
      {/* Interactive Background Particles */}
      <InteractiveParticles theme={theme} />

      {/* Decorative Background Orbs */}
      <div className={cn("fixed top-[10%] right-[10%] w-64 h-64 rounded-full blur-[100px] pointer-events-none -z-10", isLight ? "bg-emerald-200/40" : "bg-emerald-500/5")} aria-hidden="true" />
      <div className={cn("fixed bottom-[15%] left-[5%] w-96 h-96 rounded-full blur-[120px] pointer-events-none -z-10", isLight ? "bg-indigo-200/30" : "bg-indigo-500/5")} aria-hidden="true" />

      {/* Central Content Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-20" aria-hidden="true" />

      <div className="w-full max-w-2xl relative z-10 flex flex-col py-6 animate-fade-in-up flex-1">
        {/* Header Navigation */}
        <header className="flex items-center justify-between mb-8 w-full">
          <button 
            onClick={onBack} 
            className={cn(
              "flex items-center gap-1.5 text-xs font-black transition-all px-3.5 py-1.5 rounded-full border shadow-sm backdrop-blur-md", 
              isLight 
                ? "text-slate-700 hover:text-slate-950 bg-slate-100/60 border-slate-200/50 hover:bg-slate-200/60" 
                : "text-slate-200 hover:text-white bg-white/5 border-white/10 hover:bg-white/10"
            )}
          >
            <ArrowRight size={16} />
            חזרה
          </button>
          <div className="text-left text-[10px] font-black tracking-widest uppercase text-slate-400">
            מרחב הרגעה מהירה
          </div>
        </header>

        {/* Header Text */}
        <div className="text-center space-y-3 mb-10">
          <h1 className={cn("font-headline text-3xl md:text-4xl font-black tracking-tight leading-none drop-shadow-sm", isLight ? "text-slate-900" : "text-white")}>
            {titleText}
          </h1>
          <p className={cn("text-xs font-bold md:text-sm max-w-md mx-auto leading-relaxed", isLight ? "text-slate-500" : "text-slate-400")}>
            {subtitleText}
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={opt.action}
                className={cn(
                  "p-6 rounded-[2.2rem] border backdrop-blur-xl shadow-md transition-all duration-350 flex flex-col justify-between text-right active:scale-[0.98] group relative overflow-hidden min-h-[190px]",
                  opt.colorClass
                )}
              >
                {/* Glowing Badge for recommended options */}
                {opt.recommendText && (
                  <span className={cn(
                    "absolute top-5 left-5 text-[9px] font-black px-2.5 py-0.5 rounded-full border shadow-sm animate-pulse",
                    opt.id === "breathing" 
                      ? (isLight ? "bg-emerald-100 border-emerald-250 text-emerald-800" : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300")
                      : (isLight ? "bg-sky-100 border-sky-250 text-sky-800" : "bg-sky-500/20 border-sky-500/30 text-sky-300")
                  )}>
                    {opt.recommendText}
                  </span>
                )}

                <div className="flex justify-between items-start w-full">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-110 duration-300",
                    opt.iconColor
                  )}>
                    <Icon size={24} />
                  </div>
                  {!opt.recommendText && (
                    <ChevronLeft size={16} className={cn("transition-transform group-hover:-translate-x-1 duration-300", isLight ? "text-slate-400" : "text-white/30")} />
                  )}
                </div>

                <div className="space-y-1.5 mt-6 z-10 w-full">
                  <h3 className={cn("text-base font-black leading-tight flex items-center gap-1.5", isLight ? "text-slate-900" : "text-white")}>
                    {opt.title}
                  </h3>
                  <p className={cn("text-xs font-bold leading-normal opacity-90", isLight ? "text-slate-650" : "text-slate-300")}>
                    {opt.description}
                  </p>
                  <p className={cn("text-[10px] font-medium leading-normal opacity-75 italic mt-1", isLight ? "text-slate-500" : "text-slate-400")}>
                    {opt.benefit}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Tip / Grounding Quote */}
        <div className={cn(
          "rounded-[2rem] p-6 text-center border transition-all duration-300",
          isLight ? "bg-white/50 border-slate-200/70 text-slate-600 shadow-sm" : "bg-white/5 border-white/5 text-slate-350"
        )}>
          <p className="text-xs font-bold leading-relaxed max-w-md mx-auto">
            💡 {isFemale 
              ? "זכרי: החרדה היא גל פיזיולוגי. הוא מגיע לשיא, ואז דועך. את לא לבד, והקושי הזה יעבור בקרוב." 
              : "זכור: החרדה היא גל פיזיולוגי. הוא מגיע לשיא, ואז דועך. אתה לא לבד, והקושי הזה יעבור בקרוב."}
          </p>
        </div>
      </div>
    </div>
  );
}
