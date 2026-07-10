"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Phone, AlertTriangle, Heart, Eye, Headphones, Hand, Compass, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CrisisHelpDialogProps {
  gender: "m" | "f";
  trigger: React.ReactNode;
  theme?: "light" | "dark";
}

const GROUNDING_STEPS = [
  {
    step: 5,
    title: "5 דברים שניתן לראות",
    desc: "הבט/י סביבך ומצא/י 5 חפצים או פרטים שונים בחדר או בחוץ.",
    icon: Eye,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    step: 4,
    title: "4 דברים שניתן לגעת בהם",
    desc: "שים/י לב למגע של הבגדים על העור, הרצפה מתחת לרגליים או חפץ פיזי קרוב.",
    icon: Hand,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    step: 3,
    title: "3 דברים שניתן לשמוע",
    desc: "הקשב/י לקולות סביבך: רעש רקע של מכשירים, ציפורים או נשימה.",
    icon: Headphones,
    color: "text-indigo-500 bg-indigo-500/10",
  },
  {
    step: 2,
    title: "2 דברים שניתן להריח",
    desc: "נסה/י לזהות ריח כלשהו באוויר, או קרב/י בגד או חפץ להרחה עמוקה.",
    icon: Compass,
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    step: 1,
    title: "1 דבר שניתן לטעום",
    desc: "שים/י לב לטעם הנוכחי בפה, או קח/י לגימת מים קטנה והתמקד/י בטעם.",
    icon: Heart,
    color: "text-rose-500 bg-rose-500/10",
  },
];

export default function CrisisHelpDialog({ gender, trigger, theme = "light" }: CrisisHelpDialogProps) {
  const isLight = theme === "light";
  const [isOpen, setIsOpen] = useState(false);
  const [groundingStep, setGroundingStep] = useState<number | null>(null);

  const g = (m: string, f: string) => (gender === "f" ? f : m);

  const handleNextGrounding = () => {
    if (groundingStep === null) {
      setGroundingStep(0);
    } else if (groundingStep < GROUNDING_STEPS.length - 1) {
      setGroundingStep((prev) => (prev !== null ? prev + 1 : 0));
    } else {
      setGroundingStep(null); // Finish
    }
  };

  const handlePrevGrounding = () => {
    if (groundingStep !== null && groundingStep > 0) {
      setGroundingStep((prev) => (prev !== null ? prev - 1 : null));
    } else {
      setGroundingStep(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "max-w-md rounded-[2rem] border-none shadow-2xl p-6 transition-colors duration-300",
          isLight ? "bg-white text-slate-900" : "bg-slate-950 text-white"
        )}
        dir="rtl"
      >
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl font-black flex items-center gap-2 mb-1">
            <AlertTriangle className="text-rose-500 animate-pulse" size={24} />
            <span>סיוע ועזרה ראשונה נפשית</span>
          </DialogTitle>
          <DialogDescription className={isLight ? "text-slate-500 text-xs font-semibold" : "text-slate-400 text-xs font-semibold"}>
            {g("אינך לבד. אם אתה חווה מצוקה קשה, ישנם גורמים מקצועיים הזמינים עבורך כעת.", "אינך לבדה. אם את חווה מצוקה קשה, ישנם גורמים מקצועיים הזמינים עבורך כעת.")}
          </DialogDescription>
        </DialogHeader>

        {groundingStep === null ? (
          <div className="space-y-6 mt-4">
            {/* Hotlines */}
            <div className="space-y-3">
              <a
                href="tel:1201"
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                  isLight
                    ? "bg-slate-50 hover:bg-rose-50/50 border-slate-200 hover:border-rose-300"
                    : "bg-slate-900/60 hover:bg-rose-950/20 border-white/5 hover:border-rose-500/30"
                )}
              >
                <div className="flex items-center gap-3 text-right">
                  <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="block font-black text-rose-500 text-sm">ער"ן - עזרה ראשונה נפשית</span>
                    <span className="block text-xs text-slate-400">חיוג חינם לשיחה דיסקרטית: 1201</span>
                  </div>
                </div>
                <ChevronLeft size={18} className="text-slate-400 rotate-180" />
              </a>

              <a
                href="https://sahar.org.il/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                  isLight
                    ? "bg-slate-50 hover:bg-indigo-50/50 border-slate-200 hover:border-indigo-300"
                    : "bg-slate-900/60 hover:bg-indigo-950/20 border-white/5 hover:border-indigo-500/30"
                )}
              >
                <div className="flex items-center gap-3 text-right">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart size={18} />
                  </div>
                  <div>
                    <span className="block font-black text-indigo-500 text-sm">סה"ר - סיוע והקשבה ברשת</span>
                    <span className="block text-xs text-slate-400">צ'אט אישי ותמיכה מקוונת בכתב</span>
                  </div>
                </div>
                <ChevronLeft size={18} className="text-slate-400 rotate-180" />
              </a>

              <a
                href="tel:101"
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                  isLight
                    ? "bg-slate-50 hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300"
                    : "bg-slate-900/60 hover:bg-emerald-950/20 border-white/5 hover:border-emerald-500/30"
                )}
              >
                <div className="flex items-center gap-3 text-right">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="block font-black text-emerald-500 text-sm">מד"א - מגן דוד אדום</span>
                    <span className="block text-xs text-slate-400">מוקד חירום רפואי מיידי: 101</span>
                  </div>
                </div>
                <ChevronLeft size={18} className="text-slate-400 rotate-180" />
              </a>
            </div>

            {/* Grounding Exercise Trigger */}
            <div
              className={cn(
                "p-4 rounded-2xl border flex flex-col items-center text-center gap-3",
                isLight ? "bg-indigo-50/50 border-indigo-100" : "bg-indigo-950/10 border-indigo-500/20"
              )}
            >
              <p className="text-xs font-bold leading-relaxed text-indigo-400">
                {g(
                  "חווה הצפה רגשית חזקה כרגע? תרגיל קרקוע חושי פשוט יכול לעזור לך להתחבר חזרה לכאן ועכשיו.",
                  "חווה הצפה רגשית חזקה כרגע? תרגיל קרקוע חושי פשוט יכול לעזור לך להתחבר חזרה לכאן ועכשיו."
                )}
              </p>
              <Button
                onClick={() => setGroundingStep(0)}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 shadow-md shadow-indigo-600/20"
              >
                התחל תרגיל קרקוע 5-4-3-2-1
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/10">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className={cn("rounded-xl text-xs font-bold px-5", isLight ? "hover:bg-slate-100" : "hover:bg-white/5 text-slate-400 hover:text-white")}
              >
                {g("אני בסדר, המשך", "אני בסדר, המשיכי")}
              </Button>
            </div>
          </div>
        ) : (
          /* Grounding Steps Display */
          <div className="space-y-6 mt-4 animate-in fade-in slide-in-from-left-2 duration-300">
            {(() => {
              const currentStep = GROUNDING_STEPS[groundingStep];
              const Icon = currentStep.icon;
              return (
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner", currentStep.color)}>
                    <Icon size={32} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">
                      שלב {groundingStep + 1} מתוך 5
                    </span>
                    <h4 className="text-lg font-black">{currentStep.title}</h4>
                    <p className={cn("text-sm leading-relaxed max-w-xs", isLight ? "text-slate-600" : "text-slate-300")}>
                      {gender === "f"
                        ? currentStep.desc
                            .replace("הבט/י", "הביטי")
                            .replace("מצא/י", "מצאי")
                            .replace("שים/י", "שימי")
                            .replace("הקשב/י", "הקשיבי")
                            .replace("נסה/י", "נסי")
                            .replace("קרב/י", "קרבי")
                            .replace("התמקד/י", "התמקדי")
                            .replace("קח/י", "קחי")
                        : currentStep.desc
                            .replace("הבט/י", "הבט")
                            .replace("מצא/י", "מצא")
                            .replace("שים/י", "שים")
                            .replace("הקשב/י", "הקשב")
                            .replace("נסה/י", "נסה")
                            .replace("קרב/י", "קרב")
                            .replace("התמקד/י", "התמקד")
                            .replace("קח/י", "קח")}
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-between items-center pt-4 border-t border-slate-200/10">
              <Button
                variant="ghost"
                onClick={handlePrevGrounding}
                className={cn("rounded-xl text-xs font-bold gap-1.5", isLight ? "hover:bg-slate-100" : "hover:bg-white/5")}
              >
                <ChevronRight size={14} />
                <span>חזור</span>
              </Button>
              <Button
                onClick={handleNextGrounding}
                className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-md shadow-indigo-600/10"
              >
                <span>
                  {groundingStep === GROUNDING_STEPS.length - 1 ? "סיום" : "המשך"}
                </span>
                <ChevronLeft size={14} />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
