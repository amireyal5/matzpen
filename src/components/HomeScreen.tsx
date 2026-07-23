"use client";

import { useState, useEffect, type ReactElement } from "react";
import { Compass, User as UserIcon, ChevronLeft, Music, Wind, Moon, Sun, LifeBuoy, Sparkles } from "lucide-react";
import { useUser } from "@/firebase";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CrisisHelpDialog from "@/components/CrisisHelpDialog";
import { LegalDialog } from "@/components/LegalDialogs";
import ProfileDialog from "@/components/ProfileDialog";
import OnboardingDialog from "@/components/OnboardingDialog";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

interface HomeScreenProps {
  name: string;
  gender: "m" | "f";
  onSelectCategory: (key: string) => void;
  onStartGuided: (catKey: string, practiceIdx: number) => void;
  onGoToJournal: () => void;
  onGoToSounds: (soundId?: any) => void;
  onGoToBreathing: (breathingId?: string) => void;
  onGoToBilateral: () => void;
  onGoToImagery: () => void;
  onGoToCalmingHub: () => void;
  onGoToAssessment: (type: "gad7" | "phq9") => void;
  onGoToPtsdInfo: () => void;
  onBack: () => void;
  onUpdateProfile: (name: string, gender: "m" | "f") => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

function BreathingIllustration() {
  return (
    <svg viewBox="0 0 160 160" className="absolute -left-6 -bottom-8 w-44 h-44" aria-hidden="true">
      <circle cx="80" cy="90" r="55" fill="currentColor" opacity="0.08" className="anim-breathe" style={{ transformOrigin: "80px 90px", animationDelay: "0s" }} />
      <circle cx="80" cy="90" r="38" fill="currentColor" opacity="0.14" className="anim-breathe" style={{ transformOrigin: "80px 90px", animationDelay: "0.5s" }} />
      <circle cx="80" cy="90" r="22" fill="currentColor" opacity="0.22" className="anim-breathe" style={{ transformOrigin: "80px 90px", animationDelay: "1s" }} />
      <path d="M20 40 Q35 30 50 40 T80 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.25" className="anim-sway" style={{ transformOrigin: "50px 40px" }} />
      <path d="M95 25 Q108 18 120 25 T145 25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.18" className="anim-sway" style={{ transformOrigin: "120px 25px", animationDelay: "0.7s" }} />
    </svg>
  );
}

function ImageryIllustration() {
  return (
    <svg viewBox="0 0 160 160" className="absolute -left-4 -bottom-6 w-44 h-44" aria-hidden="true">
      <circle cx="115" cy="30" r="14" fill="currentColor" opacity="0.16" />
      <ellipse cx="55" cy="100" rx="48" ry="26" fill="currentColor" opacity="0.10" className="anim-float" style={{ animationDelay: "0s" }} />
      <ellipse cx="95" cy="118" rx="34" ry="19" fill="currentColor" opacity="0.16" className="anim-float" style={{ animationDelay: "0.6s" }} />
      <g className="anim-twinkle" style={{ transformOrigin: "30px 45px", animationDelay: "0.2s" }}>
        <path d="M30 38 L33 45 L40 48 L33 51 L30 58 L27 51 L20 48 L27 45 Z" fill="currentColor" opacity="0.3" />
      </g>
      <g className="anim-twinkle" style={{ transformOrigin: "130px 70px", animationDelay: "1.1s" }}>
        <path d="M130 65 L132 70 L137 72 L132 74 L130 79 L128 74 L123 72 L128 70 Z" fill="currentColor" opacity="0.25" />
      </g>
    </svg>
  );
}

function SoundsIllustration() {
  const bars = [18, 34, 46, 30, 20, 40];
  return (
    <svg viewBox="0 0 160 160" className="absolute -left-6 -bottom-8 w-44 h-44" aria-hidden="true">
      <circle cx="90" cy="90" r="58" fill="currentColor" opacity="0.06" />
      <g transform="translate(30, 95)">
        {bars.map((h, i) => (
          <rect
            key={i}
            x={i * 15}
            y={-h}
            width="8"
            height={h * 2}
            rx="4"
            fill="currentColor"
            opacity="0.22"
            className="anim-eq"
            style={{ transformOrigin: `${i * 15 + 4}px 0px`, animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

const HOME_ILLUSTRATIONS: Record<string, () => ReactElement> = {
  breathing: BreathingIllustration,
  imagery: ImageryIllustration,
  sounds: SoundsIllustration,
};

const HOME_TOOLS = [
  {
    id: "breathing",
    label: "נשימה מודרכת",
    description: "תרגילי נשימה לוויסות והרגעת הגוף",
    icon: Wind,
    hue: "emerald",
  },
  {
    id: "imagery",
    label: "דמיון מודרך",
    description: "מסעות ויזואליים להרפיה עמוקה",
    icon: Sparkles,
    hue: "violet",
  },
  {
    id: "sounds",
    label: "מוזיקה וצלילים",
    description: "צלילי רקע ותדרים מרגיעים",
    icon: Music,
    hue: "indigo",
  },
] as const;

const TOOL_STYLES: Record<string, { light: string; dark: string; iconLight: string; iconDark: string; chevronLight: string; chevronDark: string; illustrationLight: string; illustrationDark: string }> = {
  emerald: {
    light: "bg-emerald-50/75 border-emerald-200/60 hover:bg-emerald-100/70 hover:border-emerald-350 shadow-emerald-100/10",
    dark: "bg-emerald-950/20 border-emerald-900/30 hover:bg-emerald-950/30 hover:border-emerald-500/40 text-emerald-100",
    iconLight: "bg-white text-emerald-600",
    iconDark: "bg-emerald-500/10 text-emerald-400",
    chevronLight: "text-emerald-600/50",
    chevronDark: "text-emerald-400/50",
    illustrationLight: "text-emerald-600",
    illustrationDark: "text-emerald-400",
  },
  violet: {
    light: "bg-violet-50/75 border-violet-200/60 hover:bg-violet-100/70 hover:border-violet-350 shadow-violet-100/10",
    dark: "bg-violet-950/20 border-violet-900/30 hover:bg-violet-950/30 hover:border-violet-500/40 text-violet-100",
    iconLight: "bg-white text-violet-600",
    iconDark: "bg-violet-500/10 text-violet-400",
    chevronLight: "text-violet-600/50",
    chevronDark: "text-violet-400/50",
    illustrationLight: "text-violet-600",
    illustrationDark: "text-violet-400",
  },
  indigo: {
    light: "bg-indigo-50/75 border-indigo-200/60 hover:bg-indigo-100/70 hover:border-indigo-350 shadow-indigo-100/10",
    dark: "bg-indigo-950/20 border-indigo-900/30 hover:bg-indigo-950/30 hover:border-indigo-500/40 text-indigo-100",
    iconLight: "bg-white text-indigo-600",
    iconDark: "bg-indigo-500/10 text-indigo-400",
    chevronLight: "text-indigo-600/50",
    chevronDark: "text-indigo-400/50",
    illustrationLight: "text-indigo-600",
    illustrationDark: "text-indigo-400",
  },
};

export default function HomeScreen({
  name: initialName,
  gender: initialGender,
  onGoToSounds,
  onGoToBreathing,
  onGoToImagery,
  onUpdateProfile,
  theme = "light",
  toggleTheme
}: HomeScreenProps) {
  const isLight = theme === "light";
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const displayName = initialName || "משתמש";
  const displayGender = initialGender as "m" | "f";

  const { user } = useUser();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("matzpen_onboardingCompleted") === "true";
    }
    return false;
  });
  const showOnboarding = !onboardingCompleted;

  const profileData = { name: displayName, gender: displayGender };
  const profileRef = null;

  const welcomeText = `רגע של רוגע, ${displayName}`;
  const subActionText = displayGender === "f" ? "בחרי כלי להקלה מהירה" : "בחר כלי להקלה מהירה";

  const TOOL_ACTIONS: Record<string, () => void> = {
    breathing: () => onGoToBreathing(),
    imagery: () => onGoToImagery(),
    sounds: () => onGoToSounds(),
  };

  return (
    <div className={cn("min-h-screen relative overflow-hidden select-none transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-[#0B0F19] text-white")}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes anim-breathe {
          0%, 100% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes anim-sway {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
        @keyframes anim-float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-6px) translateX(3px); }
        }
        @keyframes anim-twinkle {
          0%, 100% { transform: scale(0.85); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes anim-eq {
          0%, 100% { transform: scaleY(0.6); }
          50% { transform: scaleY(1); }
        }
        .anim-breathe { animation: anim-breathe 4s ease-in-out infinite; }
        .anim-sway { animation: anim-sway 3.5s ease-in-out infinite; }
        .anim-float { animation: anim-float 5s ease-in-out infinite; }
        .anim-twinkle { animation: anim-twinkle 2.4s ease-in-out infinite; }
        .anim-eq { animation: anim-eq 1.1s ease-in-out infinite; }
      `}</style>

      {/* Ambient background glows */}
      <div className={cn("absolute top-[-10%] left-[-20%] w-[70%] h-[50%] rounded-full blur-[120px] pointer-events-none transition-colors duration-700", isLight ? "bg-indigo-200/40" : "bg-indigo-500/10")} />
      <div className={cn("absolute bottom-[10%] right-[-10%] w-[60%] h-[50%] rounded-full blur-[120px] pointer-events-none transition-colors duration-700", isLight ? "bg-emerald-200/30" : "bg-emerald-500/10")} />
      <div className={cn("absolute top-[30%] right-[-15%] w-[50%] h-[40%] rounded-full blur-[100px] pointer-events-none transition-colors duration-700", isLight ? "bg-purple-200/20" : "bg-purple-500/5")} />

      {/* Content wrapper */}
      <div className="relative z-10">
        <header className="bg-transparent pt-8 pb-6 px-6">
          <div className="max-w-xl lg:max-w-4xl mx-auto flex flex-col items-center text-center gap-10">
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg overflow-hidden p-1.5 transition-colors", isLight ? "bg-white border-slate-200" : "bg-white/5 border-white/10")}>
                  <Logo variant="icon" />
                </div>
                <p className={cn("text-[10px] font-black uppercase tracking-widest", isLight ? "text-indigo-600" : "text-indigo-400")}>המצפן הרגשי</p>
              </div>

              <div className="flex items-center gap-2">
                <CrisisHelpDialog
                  gender={displayGender}
                  theme={theme}
                  trigger={
                    <button
                      className={cn(
                        "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-90 shadow-sm",
                        isLight
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                          : "bg-white/5 border-white/10 text-emerald-400 hover:bg-white/10"
                      )}
                      aria-label="עזרה ראשונה נפשית (גלגל הצלה)"
                    >
                      <LifeBuoy size={18} className="animate-pulse" />
                    </button>
                  }
                />

                {toggleTheme && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={toggleTheme}
                        className={cn(
                          "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-90",
                          isLight
                            ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 shadow-sm"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                        )}
                        aria-label={isLight ? "מצב כהה" : "מצב בהיר"}
                      >
                        {isLight ? <Moon size={18} /> : <Sun size={18} />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{isLight ? "מצב כהה" : "מצב בהיר"}</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setIsProfileOpen(true)} className={cn("w-10 h-10 rounded-full border-2 hover:border-indigo-500 transition-all overflow-hidden relative", isLight ? "border-slate-200" : "border-white/10")} aria-label="פרופיל והגדרות">
                      {user?.photoURL ? (
                        <Image src={user.photoURL} alt="פרופיל אישי" width={40} height={40} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className={cn("w-full h-full flex items-center justify-center", isLight ? "bg-slate-100 text-slate-500" : "bg-slate-800 text-slate-400")}>
                          <UserIcon size={16} />
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>פרופיל והגדרות</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className={cn("relative w-16 h-16 mx-auto rounded-full flex items-center justify-center", isLight ? "bg-indigo-50" : "bg-indigo-500/10")}>
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-125 animate-pulse-soft" />
                <Logo variant="icon" className="relative w-9 h-9" />
              </div>
              <h2 className={cn("text-3xl font-headline font-black tracking-tight leading-tight", isLight ? "text-slate-900" : "text-white")}>{welcomeText}</h2>
              <p className={cn("text-xs font-bold", isLight ? "text-slate-500" : "text-slate-400")}>{subActionText}</p>
            </div>
          </div>
        </header>

        {/* Main Section */}
        <div className="max-w-xl lg:max-w-5xl mx-auto px-6 lg:px-8 mt-6 space-y-10 pb-20">

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Compass size={14} className="text-indigo-400" />
              <h3 className={cn("text-[10px] font-black tracking-widest uppercase text-right", isLight ? "text-slate-500" : "text-slate-400")}>כלים מהירים</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {HOME_TOOLS.map((tool, i) => {
                const Icon = tool.icon;
                const style = TOOL_STYLES[tool.hue];
                const Illustration = HOME_ILLUSTRATIONS[tool.id];
                return (
                  <button
                    key={tool.id}
                    onClick={TOOL_ACTIONS[tool.id]}
                    style={{ animationDelay: `${i * 90}ms` }}
                    className={cn(
                      "w-full p-6 rounded-[2rem] border backdrop-blur-xl shadow-lg transition-all duration-300 flex flex-col justify-between text-right active:scale-95 group relative overflow-hidden min-h-[168px]",
                      "animate-in fade-in slide-in-from-bottom-3",
                      isLight ? style.light : style.dark
                    )}
                  >
                    <div className={cn("absolute inset-0 z-0 pointer-events-none", isLight ? "opacity-70" : "opacity-40", isLight ? style.illustrationLight : style.illustrationDark)}>
                      <Illustration />
                    </div>
                    <div className="relative z-10 flex justify-between items-start w-full">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-110 duration-300",
                        isLight ? style.iconLight : style.iconDark
                      )}>
                        <Icon size={24} />
                      </div>
                      <ChevronLeft size={16} className={isLight ? style.chevronLight : style.chevronDark} />
                    </div>
                    <div className="relative space-y-1 mt-4 z-10">
                      <h4 className={cn("text-sm font-black leading-tight", isLight ? "text-slate-900" : "text-white")}>{tool.label}</h4>
                      <p className={cn("text-[10px] font-bold leading-normal opacity-90", isLight ? "text-slate-500" : "text-slate-400")}>
                        {tool.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <footer className={cn("text-center py-16 border-t space-y-6", isLight ? "border-slate-200" : "border-white/5")}>
            <div className="flex justify-center gap-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">
              <LegalDialog type="terms" trigger={<button className="hover:text-indigo-400 transition-colors">תנאי שימוש</button>} />
              <LegalDialog type="disclaimer" trigger={<button className="hover:text-indigo-400 transition-colors">הבהרה משפטית</button>} />
              <LegalDialog type="accessibility" trigger={<button className="hover:text-indigo-400 transition-colors">נגישות</button>} />
            </div>
            <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
              © {currentYear} המצפן הרגשי • כל הזכויות שמורות ל<a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400 transition-colors">עמיר אייל</a>
            </p>
          </footer>
        </div>
      </div>

      <ProfileDialog
        isOpen={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        profileData={profileData}
        profileRef={profileRef}
        onUpdateProfile={onUpdateProfile}
      />

      <OnboardingDialog
        isOpen={showOnboarding}
        profileRef={profileRef}
        gender={displayGender}
        onComplete={(focusAreaKey) => {
          localStorage.setItem("matzpen_onboardingCompleted", "true");
          setOnboardingCompleted(true);
          if (focusAreaKey) {
            if (focusAreaKey === "BODY") onGoToBreathing();
            else if (focusAreaKey === "SOUNDS") onGoToSounds();
            else if (focusAreaKey === "IMAGERY") onGoToImagery();
          }
        }}
      />
    </div>
  );
}
