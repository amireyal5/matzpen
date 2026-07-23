"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Phone, Heart, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CrisisHelpDialogProps {
  gender: "m" | "f";
  trigger: React.ReactNode;
  theme?: "light" | "dark";
}

export default function CrisisHelpDialog({ gender, trigger, theme = "light" }: CrisisHelpDialogProps) {
  const isLight = theme === "light";
  const [isOpen, setIsOpen] = useState(false);

  const g = (m: string, f: string) => (gender === "f" ? f : m);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "max-w-md rounded-[2rem] border-none shadow-2xl p-6 transition-colors duration-300",
          isLight ? "bg-white text-slate-900" : "bg-slate-950 text-white"
        )}
        dir="rtl"
        hideCloseButton
      >
        <DialogClose
          className={cn(
            "absolute left-4 top-4 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isLight ? "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700" : "bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white"
          )}
        >
          <X size={16} />
          <span className="sr-only">סגירה</span>
        </DialogClose>

        <DialogHeader className="text-right sm:text-right">
          <DialogTitle className="text-xl font-black mb-1">
            <span>סיוע ועזרה ראשונה נפשית</span>
          </DialogTitle>
          <DialogDescription className={cn("text-right", isLight ? "text-slate-500 text-xs font-semibold" : "text-slate-400 text-xs font-semibold")}>
            {g("אינך לבד. אם אתה חווה מצוקה קשה, ישנם גורמים מקצועיים הזמינים עבורך כעת.", "אינך לבדה. אם את חווה מצוקה קשה, ישנם גורמים מקצועיים הזמינים עבורך כעת.")}
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
