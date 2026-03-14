
"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Info } from "lucide-react";
import { BANK, CATS } from "@/lib/data";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { generateSpeech } from "@/ai/flows/tts-flow";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import PracticeCard from "./PracticeCard";

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
    if (isPlaying) { stopAudio(); return; }
    const cacheKey = `${catKey}:${idx}:${gender}`;
    if (audioCache[cacheKey]) { playFromUri(audioCache[cacheKey]); return; }

    setIsLoadingAudio(true);
    try {
      const g = (obj: any) => gender === 'f' ? (obj.f || obj.m) : (obj.m || obj.f);
      const textToSpeak = `${g(card.t)}. הרציונל: ${g(card.why)}. השלבים: ${card.steps.map((s: any, i: number) => `שלב ${i + 1}, ${g(s)}`).join(". ")}`;
      const { audioUri } = await generateSpeech({ text: textToSpeak, gender });
      setAudioCache(prev => ({ ...prev, [cacheKey]: audioUri }));
      playFromUri(audioUri);
    } catch (err) {
      console.error(err);
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
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F8FAFC]">
      <audio ref={audioRef} hidden />
      
      <header className="bg-slate-950 text-white relative z-20 shadow-xl overflow-hidden">
        <div className="max-w-lg mx-auto w-full flex items-center justify-between pt-8 pb-10 px-6">
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-widest transition-colors hover:text-indigo-300">
            <ArrowRight className="size-5" /> חזרה
          </button>
          
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setShowIntro(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 text-white font-black text-xs hover:bg-white/20 transition-all"
            >
              <cat.icon className="size-3.5" /> {cat.label}
            </button>
            <button onClick={() => setShowIntro(true)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <Info className="size-4" />
            </button>
          </div>

          <div className="text-[10px] font-black text-white/40 tracking-widest">{idx + 1}/{cards.length}</div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
          <div 
            className="h-full transition-all duration-700 ease-out" 
            style={{ 
              width: `${((idx + 1) / cards.length) * 100}%`, 
              background: `linear-gradient(90deg, ${cat.gFrom}, ${cat.gTo})` 
            }} 
          />
        </div>
      </header>
      
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-8 max-w-md w-full diffused-shadow flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ backgroundColor: `${cat.hue}15` }}>
              <cat.icon className="size-10" style={{ color: cat.hue }} />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-headline font-black text-slate-900">{cat.label}</h2>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">{gender === 'f' ? (cat.intro.f || cat.intro.m) : (cat.intro.m || cat.intro.f)}</p>
            </div>
            <button 
              onClick={() => { setShowIntro(false); localStorage.setItem(`has_seen_intro_${catKey}`, "true"); }}
              className="w-full py-5 rounded-2xl text-white font-black text-lg shadow-lg"
              style={{ background: `linear-gradient(135deg, ${cat.gFrom}, ${cat.gTo})` }}
            >
              הבנתי, בוא נתחיל
            </button>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto w-full flex flex-col items-center flex-1 py-8 px-6">
        <div className="w-full">
          <Carousel setApi={setApi} className="w-full" opts={{ direction: "rtl" }}>
            <CarouselContent className="-ml-0 py-2">
              {cards.map((card, i) => (
                <CarouselItem key={i} className="pl-0 flex items-center justify-center px-2">
                  <PracticeCard 
                    card={card} idx={i} total={cards.length}
                    isFlipped={flipped && idx === i} onFlip={setFlipped}
                    isFavorite={favorites.includes(`${catKey}:${i}`)} onToggleFavorite={() => toggleFavorite(i)}
                    isCompleted={completedCards.includes(`${catKey}:${i}`)} onToggleComplete={() => toggleComplete(i)}
                    onPlayAudio={() => handleAudioPlay(card)} isLoadingAudio={isLoadingAudio} isPlaying={isPlaying && idx === i}
                    gender={gender} category={cat} backTab={backTab} onTabChange={setBackTab}
                    onShowIntro={() => setShowIntro(true)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
