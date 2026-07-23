"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "matzpen_installPromptDismissed";

interface InstallPwaPromptProps {
  theme?: "light" | "dark";
}

export default function InstallPwaPrompt({ theme = "light" }: InstallPwaPromptProps) {
  const isLight = theme === "light";
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    const ua = window.navigator.userAgent;
    const iosDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (iosDevice) {
      setIsIos(true);
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div
      dir="rtl"
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm rounded-3xl border shadow-2xl backdrop-blur-xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-500",
        isLight ? "bg-white/95 border-slate-200" : "bg-slate-900/90 border-white/10"
      )}
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <div
        className={cn(
          "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
          isLight ? "bg-indigo-50 text-indigo-600" : "bg-indigo-500/10 text-indigo-400"
        )}
      >
        {isIos ? <Share size={20} /> : <Download size={20} />}
      </div>
      <div className="flex-1 min-w-0 text-right">
        <p className={cn("text-xs font-black leading-tight", isLight ? "text-slate-900" : "text-white")}>
          התקינו את המצפן הרגשי
        </p>
        <p className={cn("text-[10px] font-bold leading-snug mt-0.5", isLight ? "text-slate-500" : "text-slate-400")}>
          {isIos
            ? 'הקישו על שיתוף ואז על "הוסף למסך הבית"'
            : "גישה מהירה מהמסך הראשי, גם ללא חיבור לאינטרנט"}
        </p>
      </div>
      {!isIos && (
        <button
          onClick={handleInstall}
          className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          התקנה
        </button>
      )}
      <button
        onClick={handleDismiss}
        aria-label="סגירה"
        className={cn(
          "shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90",
          isLight ? "text-slate-400 hover:bg-slate-100" : "text-slate-500 hover:bg-white/10"
        )}
      >
        <X size={14} />
      </button>
    </div>
  );
}
