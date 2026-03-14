
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, RotateCcw, Zap, ListChecks, BookOpen, Check, Info, 
  Volume2, Heart, CheckCircle2, Loader2, Compass 
} from "lucide-react";
import { BANK, CATS, TIP_MAP } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateSpeech } from "@/ai/flows/tts-flow";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

interface DeckScreenProps {
  catKey: string;
  gender: "m" | "f";
  onBack: void;
}

export default function DeckScreen({ catKey, gender, onBack }: DeckScreenProps) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [backTab, setBackTab] = useState<"why" | "steps" | "tip">("why");
  const [api, setApi] = useState<CarouselApi>();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showIntro, setShowIntro] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "userProfiles", user.uid);
  }, [user, firestore]);
  const { data: profileData } = useDoc(profileRef);

  const cat = CATS.find((c) => c.key === catKey) || CATS[0];
  const cards = BANK[catKey] || [];

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    const introKey = `has_seen_intro_${catKey}`;
    const hasSeen = localStorage.getItem(introKey);
    if (!hasSeen) {
      setShowIntro(true);
    }
  }, [catKey]);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setIdx(api.selectedScrollSnap());
      setFlipped(false);
      setBackTab("why");
      stopAudio();
    });
  }, [api]);

  const handleCloseIntro = () => {
    setShowIntro(false);
    localStorage.setItem(`has_seen_intro_${catKey}`, "true");
  };

  const g = (obj: any) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return gender === "f" ? (obj.f || obj.m) : (obj.m || obj.f);
  };

  const favorites = profileData?.favorites || [];
  const completedCards = profileData?.completed || [];

  const toggleFavorite = (cardIdx: number) => {
    if (!profileRef) return;
    const id = `${catKey}:${cardIdx}`;
    let newFavs;
    if (favorites.includes(id)) {
      newFavs = favorites.filter((f: string) => f !== id);
    } else {
      newFavs = [...favorites, id];
    }
    updateDocumentNonBlocking(profileRef, { favorites: newFavs });
  };

  const toggleComplete = (cardIdx: number) => {
    if (!profileRef) return;
    const id = `${catKey}:${cardIdx}`;
    let newCompleted;
    if (completedCards.includes(id)) {
      newCompleted = completedCards.filter((c: string) => c !== id);
    } else {
      newCompleted = [...completedCards, id];
    }
    updateDocumentNonBlocking(profileRef, { completed: newCompleted });
  };

  const handleAudioPlay = async (card: any) => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    const cacheKey = `${catKey}:${idx}:${gender}`;
    
    if (audioCache[cacheKey]) {
      playFromUri(audioCache[cacheKey]);
      return;
    }

    setIsLoadingAudio(true);
    try {
      const textToSpeak = `${g(card.t)}. הרציונל: ${g(card.why)}. השלבים הם: ${card.steps.map((s: any, i: number) => `שלב ${i + 1}, ${g(s)}`).join(". ")}`;
      const { audioUri } = await generateSpeech({ text: textToSpeak, gender });
      
      setAudioCache(prev => ({ ...prev, [cacheKey]: audioUri }));
      playFromUri(audioUri);
    } catch (err) {
      console.error(err);
      setIsLoadingAudio(false);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const playFromUri = (uri: string) => {
    if (audioRef.current) {
      audioRef.current.src = uri;
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const CatIcon = cat.icon;
  const isCardFavorite = favorites.includes(`${catKey}:${idx}`);
  const isCardCompleted = completedCards.includes(`${catKey}:${idx}`);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F8FAFC]">
      <audio ref={audioRef} hidden />
      
      <header className="bg-slate-950 text-white pt-8 pb-10 px-6 shadow-xl relative z-20">
        <div className="max-w-lg mx-auto w-full flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-xs font-black text-indigo-400 hover:text-white transition-all uppercase tracking-widest"
          >
            <ArrowRight className="size-[18px]" aria-hidden="true" />
            חזרה
          </button>
          
          <div className="flex items-center gap-2.5">
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-black text-xs"
            >
              <CatIcon className="size-[14px]" aria-hidden="true" />
              {cat.label}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setShowIntro(true)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <Info className="size-[16px]" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent>רציונל הקטגוריה</TooltipContent>
            </Tooltip>
          </div>

          <div className="text-[10px] font-black text-white/40 tracking-widest">
            {idx + 1}/{cards.length}
          </div>
        </div>
      </header>

      <div className="w-full h-1.5 bg-slate-950 relative z-10">
        <div 
          className="h-full transition-all duration-700 ease-out"
          style={{ 
            width: `${((idx + 1) / cards.length) * 100}%`,
            background: `linear-gradient(90deg, ${cat.gFrom}, ${cat.gTo})`
          }}
        />
      </div>
      
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-md w-full diffused-shadow flex flex-col items-center text-center space-y-6 md:space-y-8 border border-slate-100">
            <div 
              className="w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center mb-2"
              style={{ backgroundColor: `${cat.hue}15` }}
            >
              <CatIcon className="size-10 md:size-12" style={{ color: cat.hue }} aria-hidden="true" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-headline font-black text-slate-900 leading-tight">
                {cat.label}
              </h2>
              <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
                {g(cat.intro)}
              </p>
            </div>
            <button 
              onClick={handleCloseIntro}
              className="w-full py-5 md:py-6 rounded-2xl text-white font-black text-lg md:text-xl transition-all active:scale-[0.97] shadow-lg"
              style={{ background: `linear-gradient(135deg, ${cat.gFrom}, ${cat.gTo})`, boxShadow: `0 15px 35px ${cat.hue}40` }}
            >
              הבנתי, בוא נתחיל
            </button>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto w-full flex flex-col items-center flex-1 py-8 md:py-12 px-6">
        <div className="w-full">
          <Carousel setApi={setApi} className="w-full" opts={{ direction: "rtl" }}>
            <CarouselContent className="-ml-0 py-2">
              {cards.map((card, i) => (
                <CarouselItem key={i} className="pl-0 flex items-center justify-center px-2 md:px-4">
                  <div className="w-full h-[440px] md:h-[520px] perspective-1000">
                    <div className={cn(
                      "relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer",
                      flipped && idx === i ? "rotate-y-180" : ""
                    )}>
                      
                      <div className="absolute inset-0 bg-white rounded-[2.5rem] p-6 md:p-12 flex flex-col items-center justify-between diffused-shadow backface-hidden border border-slate-50">
                        <div className="w-full flex justify-between items-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(i); }}
                                className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all", isCardFavorite ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-300")}
                              >
                                <Heart className={cn("size-5 md:size-[22px]", isCardFavorite ? "fill-current" : "")} aria-hidden="true" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>{isCardFavorite ? "הסר מהעוגנים" : "הוסף לעוגנים"}</TooltipContent>
                          </Tooltip>
                          <span className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">כרטיסייה {i + 1}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                 onClick={(e) => { e.stopPropagation(); toggleComplete(i); }}
                                 className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all", isCardCompleted ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-300")}
                              >
                                <CheckCircle2 className={cn("size-5 md:size-[22px]", isCardCompleted ? "fill-current" : "")} aria-hidden="true" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>{isCardCompleted ? "בוצע" : "סמן כבוצע"}</TooltipContent>
                          </Tooltip>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center px-2 md:px-4 gap-4 md:gap-8">
                          <div 
                            className="w-16 h-16 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: `${cat.hue}15` }}
                          >
                            <CatIcon className="size-8 md:size-10" style={{ color: cat.hue }} aria-hidden="true" />
                          </div>
                          <h3 className="font-headline text-xl md:text-3xl font-black text-slate-950 text-center leading-[1.3] px-2">
                            {g(card.t)}
                          </h3>
                        </div>

                        <div className="w-full">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                            className="w-full py-4 md:py-6 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-sm md:text-lg transition-all active:scale-[0.97]"
                            style={{ background: `linear-gradient(135deg, ${cat.gFrom}, ${cat.gTo})`, boxShadow: `0 15px 35px ${cat.hue}30` }}
                          >
                            <BookOpen className="size-5 md:size-6" aria-hidden="true" />
                            {gender === 'f' ? 'איך את עושה את זה?' : 'איך עושים את זה?'}
                          </button>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-white rounded-[2.5rem] flex flex-col overflow-hidden diffused-shadow backface-hidden rotate-y-180 border border-slate-50">
                        <div className="p-6 md:p-10 pb-4 md:pb-8 flex justify-between items-start" style={{ background: `linear-gradient(135deg, ${cat.gFrom}, ${cat.gTo})` }}>
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-white/60 tracking-widest uppercase mb-1">{cat.label}</p>
                            <h4 className="font-headline text-lg md:text-2xl font-bold text-white leading-tight">{g(card.t)}</h4>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleAudioPlay(card); }}
                                disabled={idx !== i || isLoadingAudio}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all"
                              >
                                {isLoadingAudio ? <Loader2 className="size-5 md:size-6 animate-spin" aria-hidden="true" /> : (isPlaying ? <RotateCcw className="size-5 md:size-6" aria-hidden="true" /> : <Volume2 className="size-5 md:size-6" aria-hidden="true" />)}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>{isLoadingAudio ? "מייצר שמע..." : (isPlaying ? "עצור" : "השמע תרגיל")}</TooltipContent>
                          </Tooltip>
                        </div>

                        <div className="flex bg-slate-50 border-b border-slate-100">
                          {[
                            { id: "why", label: "תובנה", icon: Zap, tooltip: "מדוע התרגיל עוזר" },
                            { id: "steps", label: "שלבים", icon: ListChecks, tooltip: "שלבי הביצוע" },
                            { id: "tip", label: "טיפ", icon: Check, tooltip: "טיפ להצלחה" }
                          ].map((tab) => {
                            const active = backTab === tab.id;
                            const TIcon = tab.icon;
                            return (
                              <button
                                key={tab.id}
                                onClick={(e) => { e.stopPropagation(); setBackTab(tab.id as any); }}
                                className={cn(
                                  "flex-1 py-3 md:py-5 flex flex-col items-center gap-1.5 transition-all border-b-2",
                                  active ? "bg-white border-indigo-600" : "border-transparent text-slate-400"
                                )}
                              >
                                <TIcon className="size-4 md:size-[18px]" style={{ color: active ? cat.hue : undefined }} aria-hidden="true" />
                                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest" style={{ color: active ? cat.hue : undefined }}>{tab.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-10 hide-scrollbar">
                          {backTab === "why" && (
                            <div className="animate-in fade-in duration-500">
                              <div className="flex items-center gap-2 mb-4 md:mb-6">
                                <Zap className="size-[14px] md:size-[16px]" style={{ color: cat.hue }} aria-hidden="true" />
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: cat.hue }}>הרציונל המדעי</span>
                              </div>
                              <p className="text-base md:text-lg text-slate-700 leading-[1.7] font-medium border-r-4 pr-4 md:pr-6" style={{ borderColor: cat.hue }}>
                                {g(card.why)}
                              </p>
                            </div>
                          )}

                          {backTab === "steps" && (
                            <div className="space-y-3 md:space-y-5 animate-in fade-in duration-500">
                              {card.steps.map((step, i) => (
                                <div key={i} className="flex gap-3 md:gap-5 items-start bg-slate-50 p-3 md:p-5 rounded-2xl border border-slate-100">
                                  <div 
                                    className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-[10px] md:text-xs font-black flex-shrink-0 shadow-md"
                                    style={{ background: `linear-gradient(135deg, ${cat.gFrom}, ${cat.gTo})` }}
                                  >
                                    {i + 1}
                                  </div>
                                  <p className="text-sm md:text-base text-slate-800 font-semibold leading-[1.6] pt-0.5 md:pt-1">{g(step)}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {backTab === "tip" && (
                            <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500">
                              <div className="p-4 md:p-6 rounded-2xl bg-indigo-50 border border-indigo-100 relative">
                                <div className="absolute -top-3 right-4 md:right-6 bg-white px-3 py-1 rounded-full border border-indigo-100 text-[8px] md:text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                                  עמיר אייל ממליץ
                                </div>
                                <p className="text-sm md:text-base text-indigo-900 font-medium leading-relaxed italic">
                                  "{TIP_MAP[catKey]}"
                                </p>
                              </div>
                              <div className="bg-amber-50 p-3 md:p-5 rounded-2xl border border-amber-100 flex gap-3 md:gap-4">
                                <span className="text-lg md:text-2xl" aria-hidden="true">💡</span>
                                <p className="text-[10px] md:text-xs text-amber-900 font-bold leading-[1.6]">
                                  {gender === 'f' ? 'ככל שתתרגלי, כך הפעולה תהפוך לאוטומטית ומרגיעה — המוח לומד דרך חזרתיות ועקביות.' : 'ככל שתתרגל, כך הפעולה תהפוך לאוטומטית ומרגיעה — המוח לומד דרך חזרתיות ועקביות.'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-6 md:p-10 pt-0 bg-white">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
                            className="w-full py-3 md:py-5 rounded-2xl border-2 font-black text-xs md:text-sm transition-all hover:bg-slate-50 flex items-center justify-center gap-3"
                            style={{ borderColor: `${cat.hue}20`, color: cat.hue }}
                          >
                            <RotateCcw className="size-4 md:size-[18px]" aria-hidden="true" />
                            הפוך את הקלף
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <footer className="w-full text-center py-6 md:py-12 mt-auto">
          <p className="text-[10px] font-black tracking-widest text-slate-900 uppercase opacity-30">
            © {currentYear} המצפן הרגשי • כל הזכויות שמורות ל<a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600 transition-colors">עמיר אייל</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
