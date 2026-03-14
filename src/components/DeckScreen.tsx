"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, RotateCcw, Zap, ListChecks, BookOpen, Check, Info, 
  Volume2, Heart, CheckCircle2, Loader2 
} from "lucide-react";
import { BANK, CATS, TIP_MAP } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { generateSpeech } from "@/ai/flows/tts-flow";

interface DeckScreenProps {
  catKey: string;
  gender: "m" | "f";
  onBack: () => void;
}

export default function DeckScreen({ catKey, gender, onBack }: DeckScreenProps) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [backTab, setBackTab] = useState<"why" | "steps" | "tip">("why");
  const [api, setApi] = useState<CarouselApi>();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showIntro, setShowIntro] = useState(false);
  
  // Tracking
  const [favorites, setFavorites] = useState<string[]>([]);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  
  // Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cat = CATS.find((c) => c.key === catKey) || CATS[0];
  const cards = BANK[catKey] || [];

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    
    // Check if user has already seen the intro for this category
    const introKey = `has_seen_intro_${catKey}`;
    const hasSeen = localStorage.getItem(introKey);
    if (!hasSeen) {
      setShowIntro(true);
    }

    // Load favorites and completed
    const savedFavs = localStorage.getItem("compass_favorites");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    
    const savedCompleted = localStorage.getItem("compass_completed");
    if (savedCompleted) setCompletedCards(JSON.parse(savedCompleted));
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

  const toggleFavorite = (cardIdx: number) => {
    const id = `${catKey}:${cardIdx}`;
    let newFavs;
    if (favorites.includes(id)) {
      newFavs = favorites.filter(f => f !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    localStorage.setItem("compass_favorites", JSON.stringify(newFavs));
  };

  const toggleComplete = (cardIdx: number) => {
    const id = `${catKey}:${cardIdx}`;
    let newCompleted;
    if (completedCards.includes(id)) {
      newCompleted = completedCards.filter(c => c !== id);
    } else {
      newCompleted = [...completedCards, id];
    }
    setCompletedCards(newCompleted);
    localStorage.setItem("compass_completed", JSON.stringify(newCompleted));
  };

  const handleAudioPlay = async (card: any) => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsPlaying(true);
    try {
      const textToSpeak = `${g(card.t)}. הרציונל: ${g(card.why)}. השלבים הם: ${card.steps.map((s: any, i: number) => `שלב ${i + 1}, ${g(s)}`).join(". ")}`;
      const { audioUri } = await generateSpeech({ text: textToSpeak, gender });
      
      if (audioRef.current) {
        audioRef.current.src = audioUri;
        audioRef.current.play();
        audioRef.current.onended = () => setIsPlaying(false);
      }
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
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
    <div className="min-h-screen w-full flex flex-col transition-colors duration-500" style={{ backgroundColor: cat.light }}>
      <audio ref={audioRef} hidden />
      
      {/* Intro Overlay */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-6 border border-slate-100">
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-2"
              style={{ backgroundColor: `${cat.hue}15` }}
            >
              <CatIcon size={40} style={{ color: cat.hue }} />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-headline font-black text-slate-900 leading-tight">
                {cat.label}
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed text-base">
                {g(cat.intro)}
              </p>
            </div>
            <button 
              onClick={handleCloseIntro}
              className="w-full py-5 rounded-2xl text-white font-black text-lg transition-all active:scale-[0.97]"
              style={{ background: `linear-gradient(135deg, ${cat.gFrom}, ${cat.gTo})`, boxShadow: `0 10px 30px ${cat.hue}40` }}
            >
              הבנתי, בוא נתחיל
            </button>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto w-full flex flex-col items-center flex-1">
        {/* Navbar */}
        <div className="w-full px-6 pt-8 pb-4 flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowRight size={18} />
            חזרה
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowIntro(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/50"
              style={{ color: cat.hue }}
            >
              <Info size={18} />
            </button>
            <div 
              className="flex items-center gap-2.5 px-4 py-2 rounded-full text-white font-black text-xs shadow-lg"
              style={{ background: `linear-gradient(135deg, ${cat.gFrom}, ${cat.gTo})`, boxShadow: `0 8px 20px ${cat.hue}30` }}
            >
              <CatIcon size={14} />
              {cat.label}
            </div>
          </div>

          <div className="text-xs font-black" style={{ color: cat.hue }}>
            {idx + 1}/{cards.length}
          </div>
        </div>

        {/* Progress */}
        <div className="w-full px-6 mb-4">
          <div className="h-1.5 w-full bg-white/50 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className="h-full transition-all duration-500 ease-out rounded-full"
              style={{ 
                width: `${((idx + 1) / cards.length) * 100}%`,
                background: `linear-gradient(90deg, ${cat.gFrom}, ${cat.gTo})`
              }}
            />
          </div>
        </div>

        {/* Card Arena */}
        <div className="w-full">
          <Carousel setApi={setApi} className="w-full" opts={{ direction: "rtl" }}>
            <CarouselContent className="-ml-0 py-10">
              {cards.map((card, i) => (
                <CarouselItem key={i} className="pl-0 flex items-center justify-center px-6">
                  <div className="w-full h-[480px] perspective-1000">
                    <div className={cn(
                      "relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer",
                      flipped && idx === i ? "rotate-y-180" : ""
                    )}>
                      
                      {/* FRONT */}
                      <div className="absolute inset-0 bg-white rounded-[2.5rem] p-10 flex flex-col items-center justify-between shadow-2xl backface-hidden border border-slate-100">
                        <div className="w-full flex justify-between items-center">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(i); }}
                            className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", isCardFavorite ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-300")}
                          >
                            <Heart size={20} className={isCardFavorite ? "fill-current" : ""} />
                          </button>
                          <span className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">כרטיסייה {i + 1}</span>
                          <button 
                             onClick={(e) => { e.stopPropagation(); toggleComplete(i); }}
                             className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", isCardCompleted ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-300")}
                          >
                            <CheckCircle2 size={20} className={isCardCompleted ? "fill-current" : ""} />
                          </button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center px-2 gap-4">
                          <div 
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: `${cat.hue}15` }}
                          >
                            <CatIcon size={32} style={{ color: cat.hue }} />
                          </div>
                          <h3 className="font-headline text-3xl font-black text-slate-900 text-center leading-[1.3]">
                            {g(card.t)}
                          </h3>
                        </div>

                        <div className="w-full flex flex-col gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-white font-black text-base transition-all active:scale-[0.97]"
                            style={{ background: `linear-gradient(135deg, ${cat.gFrom}, ${cat.gTo})`, boxShadow: `0 10px 30px ${cat.hue}40` }}
                          >
                            <BookOpen size={20} />
                            {gender === 'f' ? 'איך את עושה את זה?' : 'איך עושים את זה?'}
                          </button>
                        </div>
                      </div>

                      {/* BACK */}
                      <div className="absolute inset-0 bg-white rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl backface-hidden rotate-y-180 border border-slate-100">
                        {/* Header */}
                        <div className="p-8 pb-5 flex justify-between items-start" style={{ background: `linear-gradient(135deg, ${cat.gFrom}, ${cat.gTo})` }}>
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-white/60 tracking-widest uppercase mb-1">{cat.label}</p>
                            <h4 className="font-headline text-xl font-bold text-white leading-tight">{g(card.t)}</h4>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleAudioPlay(card); }}
                            disabled={idx !== i}
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all"
                          >
                            {isPlaying ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
                          </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-slate-50 border-b border-slate-100">
                          {[
                            { id: "why", label: "תובנה", icon: Zap },
                            { id: "steps", label: "שלבים", icon: ListChecks },
                            { id: "tip", label: "טיפ", icon: Check }
                          ].map((tab) => {
                            const active = backTab === tab.id;
                            const TIcon = tab.icon;
                            return (
                              <button
                                key={tab.id}
                                onClick={(e) => { e.stopPropagation(); setBackTab(tab.id as any); }}
                                className={cn(
                                  "flex-1 py-4 flex flex-col items-center gap-1 transition-all border-b-2",
                                  active ? "bg-white border-primary" : "border-transparent text-slate-400"
                                )}
                              >
                                <TIcon size={16} style={{ color: active ? cat.hue : undefined }} />
                                <span className="text-[10px] font-bold" style={{ color: active ? cat.hue : undefined }}>{tab.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 hide-scrollbar">
                          {backTab === "why" && (
                            <div className="animate-in fade-in duration-300">
                              <div className="flex items-center gap-2 mb-4">
                                <Zap size={16} style={{ color: cat.hue }} />
                                <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: cat.hue }}>הרציונל המדעי</span>
                              </div>
                              <p className="text-base text-slate-700 leading-relaxed font-medium border-r-4 pr-4" style={{ borderColor: cat.hue }}>
                                {g(card.why)}
                              </p>
                            </div>
                          )}

                          {backTab === "steps" && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                              {card.steps.map((step, i) => (
                                <div key={i} className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <div 
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                                    style={{ background: `linear-gradient(135deg, ${cat.gFrom}, ${cat.gTo})` }}
                                  >
                                    {i + 1}
                                  </div>
                                  <p className="text-sm text-slate-800 font-semibold leading-relaxed pt-1">{g(step)}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {backTab === "tip" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                              <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
                                <p className="text-sm text-indigo-900 font-medium leading-relaxed italic">
                                  "{TIP_MAP[catKey]}"
                                </p>
                              </div>
                              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                                <span className="text-xl">💡</span>
                                <p className="text-xs text-amber-900 font-bold leading-relaxed">
                                  {gender === 'f' ? 'ככל שתתרגלי, כך הפעולה תהפוך לאוטומטית ומרגיעה — המוח לומד דרך חזרתיות ועקביות.' : 'ככל שתתרגל, כך הפעולה תהפוך לאוטומטית ומרגיעה — המוח לומד דרך חזרתיות ועקביות.'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer Card Part */}
                        <div className="p-6 pt-0 bg-white">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
                            className="w-full py-3.5 rounded-2xl border-2 font-bold text-sm transition-all hover:bg-slate-50 flex items-center justify-center gap-2"
                            style={{ borderColor: `${cat.hue}20`, color: cat.hue }}
                          >
                            <RotateCcw size={16} />
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

        <footer className="w-full text-center py-6 mt-auto">
          <p className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">
            © {currentYear} המצפן הרגשי • כל הזכויות שמורות ל<a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600 transition-colors">עמיר אייל</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
