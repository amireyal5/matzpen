
"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Info, Volume2, RotateCcw, Loader2 } from "lucide-react";
import { BANK, CATS } from "@/lib/data";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { generateSpeech } from "@/ai/flows/tts-flow";
import PracticeCard from "./PracticeCard";
import { cn } from "@/lib/utils";

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
  const [showIntro, setShowIntro] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

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
    const hasSeen = localStorage.getItem(`has_seen_intro_${catKey}`);
    if (!hasSeen) setShowIntro(true);
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

  const favorites = profileData?.favorites || [];
  const completedCards = profileData?.completed || [];

  const toggleFavorite = (cardIdx: number) => {
    if (!profileRef) return;
    const id = `${catKey}:${cardIdx}`;
    const newFavs = favorites.includes(id) ? favorites.filter((f: string) => f !== id) : [...favorites, id];
    updateDocumentNonBlocking(profileRef, { favorites: newFavs });
  };

  const toggleComplete = (cardIdx: number) => {
    if (!profileRef) return;
    const id = `${catKey}:${cardIdx}`;
    const newCompleted = completedCards.includes(id) ? completedCards.filter((c: string) => c !== id) : [...completedCards, id];
    updateDocumentNonBlocking(profileRef, { completed: newCompleted });
  };

  const handleAudioPlay = async (card: any) => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    const g = (obj: any) => gender === 'f' ? (obj.f || obj.m) : (obj.m || obj.f);
    const textToSpeak = `${g(card.t)}. הרציונל: ${g(card.why)}. השלבים: ${card.steps.map((s: any, i: number) => `שלב ${i + 1}, ${g(s)}`).join(". ")}`;
    
    setIsLoadingAudio(true);
    try {
      const { audioUri } = await generateSpeech({ text: textToSpeak, gender });
      const audio = new Audio(audioUri);
      setCurrentAudio(audio);
      
      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoadingAudio(false);
      };
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoadingAudio(false);
      };
      
      audio.play();
    } catch (err) {
      console.error("Audio generation failed", err);
      setIsLoadingAudio(false);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Ambient Glow Background */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[60%] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 ease-in-out z-0"
        style={{ backgroundColor: `${cat.hue}10` }}
      />

      <header className="relative z-20 flex items-center justify-between pt-8 pb-4 px-6 max-w-lg mx-auto w-full">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors group">
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" /> חזרה
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{cat.label}</span>
          <div className="flex gap-1">
            {cards.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  idx === i ? "w-4" : "w-1"
                )}
                style={{ backgroundColor: idx === i ? cat.hue : "#CBD5E1" }}
              />
            ))}
          </div>
        </div>

        <button 
          onClick={() => setShowIntro(true)} 
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors border border-slate-100"
        >
          <Info className="size-4" />
        </button>
      </header>
      
      {showIntro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center" style={{ backgroundColor: `${cat.hue}15` }}>
              <cat.icon className="size-10" style={{ color: cat.hue }} />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-headline font-black text-slate-900">{cat.label}</h2>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">{gender === 'f' ? (cat.intro.f || cat.intro.m) : (cat.intro.m || cat.intro.f)}</p>
            </div>
            <button 
              onClick={() => { setShowIntro(false); localStorage.setItem(`has_seen_intro_${catKey}`, "true"); }}
              className="w-full py-5 rounded-2xl text-white font-black text-lg shadow-xl transition-all active:scale-95"
              style={{ background: `linear-gradient(135deg, ${cat.gFrom}, ${cat.gTo})` }}
            >
              הבנתי, בוא נתחיל
            </button>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto w-full flex flex-col items-center justify-center flex-1 py-4 px-6 relative z-10">
        <Carousel setApi={setApi} className="w-full" opts={{ direction: "rtl" }}>
          <CarouselContent className="-ml-0 items-center">
            {cards.map((card, i) => (
              <CarouselItem key={i} className="pl-0 flex items-center justify-center px-2">
                <PracticeCard 
                  card={card} idx={i} total={cards.length}
                  isFlipped={flipped && idx === i} onFlip={setFlipped}
                  isFavorite={favorites.includes(`${catKey}:${i}`)} onToggleFavorite={() => toggleFavorite(i)}
                  isCompleted={completedCards.includes(`${catKey}:${i}`)} onToggleComplete={() => toggleComplete(i)}
                  onPlayAudio={() => handleAudioPlay(card)} isLoadingAudio={isLoadingAudio && idx === i} isPlaying={isPlaying && idx === i}
                  gender={gender} category={cat} backTab={backTab} onTabChange={setBackTab}
                  onShowIntro={() => setShowIntro(true)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </main>

      <footer className="relative z-20 pb-12 pt-4 flex flex-col items-center gap-4">
        <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
          כרטיסייה {idx + 1} מתוך {cards.length}
        </div>
      </footer>
    </div>
  );
}
