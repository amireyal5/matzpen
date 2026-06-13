"use client";

import { useState } from "react";
import { Sunrise, Sun as SunIcon, Sunset, BellOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateDocumentNonBlocking } from "@/firebase";
import { CATS } from "@/lib/data";
import Logo from "@/components/Logo";

interface OnboardingDialogProps {
  isOpen: boolean;
  profileRef: any;
  gender: "m" | "f";
  onComplete: (focusAreaKey: string | null) => void;
}

const FOCUS_KEYS = ["SOS", "BODY", "THOUGHTS", "ACCEPTANCE", "SLEEP", "COMPASSION"];
const FOCUS_OPTIONS = CATS.filter(c => FOCUS_KEYS.includes(c.key));

const REMINDER_OPTIONS: { key: string; label: string; icon: any }[] = [
  { key: "morning", label: "בבוקר", icon: Sunrise },
  { key: "afternoon", label: "בצהריים", icon: SunIcon },
  { key: "evening", label: "בערב", icon: Sunset },
  { key: "none", label: "בלי תזכורות", icon: BellOff },
];

export default function OnboardingDialog({ isOpen, profileRef, gender, onComplete }: OnboardingDialogProps) {
  const [step, setStep] = useState(0);
  const [focusArea, setFocusArea] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState<string | null>(null);

  const isF = gender === "f";

  const finish = (selectedFocus: string | null, selectedReminder: string | null) => {
    if (profileRef) {
      updateDocumentNonBlocking(profileRef, {
        onboardingCompleted: true,
        focusArea: selectedFocus,
        reminderTime: selectedReminder,
      });
    }
    onComplete(selectedFocus);
  };

  const handleSkip = () => finish(null, null);

  const handlePickFocus = (key: string) => {
    setFocusArea(key);
    setStep(1);
  };

  const handlePickReminder = (key: string) => {
    setReminderTime(key);
    finish(focusArea, key);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg w-full rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white [&>button]:hidden" dir="rtl">
        <DialogHeader className="sr-only">
          <DialogTitle>ברוכים הבאים למצפן הרגשי</DialogTitle>
          <DialogDescription>כמה שאלות קצרות שיעזרו לנו להתאים את החוויה אליך</DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center p-3">
              <Logo variant="icon" className="w-full h-full" />
            </div>
          </div>

          {step === 0 ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black text-slate-900">ברוך/ה הבא/ה למצפן הרגשי!</h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {isF
                    ? "כדי שנוכל להתאים לך את החוויה - מה הכי מעניין אותך לעבוד עליו כרגע?"
                    : "כדי שנוכל להתאים לך את החוויה - מה הכי מעניין אותך לעבוד עליו כרגע?"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {FOCUS_OPTIONS.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => handlePickFocus(cat.key)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 text-center",
                      "border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50"
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${cat.hue}15`, color: cat.hue }}
                    >
                      <cat.icon size={20} />
                    </div>
                    <span className="text-xs font-black text-slate-900">{cat.label}</span>
                    <span className="text-[10px] font-bold text-slate-400 leading-tight">{cat.tagLine}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleSkip}
                className="w-full text-center text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest py-2 transition-colors"
              >
                אולי מאוחר יותר
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black text-slate-900">מעולה!</h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {isF
                    ? "מתי יהיה הכי נוח לך לקבל תזכורת יומית קטנה לתרגול?"
                    : "מתי יהיה הכי נוח לך לקבל תזכורת יומית קטנה לתרגול?"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {REMINDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handlePickReminder(opt.key)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all active:scale-95 text-center",
                      reminderTime === opt.key ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50"
                    )}
                  >
                    <opt.icon size={22} className={reminderTime === opt.key ? "text-indigo-600" : "text-slate-400"} />
                    <span className="text-xs font-black text-slate-900">{opt.label}</span>
                  </button>
                ))}
              </div>

              <Button
                variant="ghost"
                onClick={() => setStep(0)}
                className="w-full text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
              >
                חזרה
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
