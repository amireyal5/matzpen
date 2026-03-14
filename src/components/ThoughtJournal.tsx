"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, BookText, Send, Check, RotateCcw, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateSpeech } from "@/ai/flows/tts-flow";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ThoughtJournalProps {
  gender: "m" | "f";
  onBack: () => void;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

export default function ThoughtJournal({ gender, onBack }: ThoughtJournalProps) {
  const [step, setStep] = useState<"write" | "reflect" | "reframe" | "finish">("write");
  const [thought, setThought] = useState("");
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const g = (m: string, f: string) => gender === 'f' ? f : m;

  const prompts = {
    write: g(
      "אני כאן איתך. מה עובר לך בראש כרגע? פשוט תכתוב הכל, ללא צנזורה.",
      "אני כאן איתך. מה עובר לך בראש כרגע? פשוט תכתבי הכל, ללא צנזורה."
    ),
    reflect: g(
      "תודה ששיתפת. עכשיו, תסתכל על מה שכתבת. האם זו עובדה מוחלטת, או שזו רק מחשבה?",
      "תודה ששיתפת. עכשיו, תסתכלי על מה שכתבת. האם זו עובדה מוחלטת, או שזו רק מחשבה?"
    ),
    reframe: g(
      "בוא ננסה לראות את זה אחרת. איך היית מסביר את המצב הזה לחבר טוב שאתה מאוד אוהב?",
      "בואי ננסה לראות את זה אחרת. איך היית מסבירה את המצב הזה לחברה טובה שאת מאוד אוהבת?"
    )
  };

  useEffect(() => {
    if (step !== "finish") {
      handlePlayAudio(prompts[step as keyof typeof prompts]);
    }
  }, [step]);

  const handlePlayAudio = async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsLoadingAudio(true);
    try {
      const { audioUri } = await generateSpeech({ text, gender });
      if (audioRef.current) {
        audioRef.current.src = audioUri;
        audioRef.current.play();
        setIsPlaying(true);
        audioRef.current.onended = () => setIsPlaying(false);
      }
    } catch (err) {
      console.error("Audio failed", err);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleNext = () => {
    if (step === "write" && thought.trim()) setStep("reflect");
    else if (step === "reflect") setStep("reframe");
    else if (step === "reframe") setStep("finish");
  };

  if (step === "finish") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150" />
          <div className="relative w-24 h-24 rounded-full border-4 border-indigo-500 overflow-hidden shadow-2xl">
            <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
          </div>
        </div>
        <div className="space-y-4 max-w-sm">
          <h2 className="text-3xl font-black text-white">השחרור מתחיל בכתיבה</h2>
          <p className="text-slate-400 font-medium">
            {g("הוצאת את המחשבות מהראש אל הדף. זהו צעד ענק לוויסות רגשי.", "הוצאת את המחשבות מהראש אל הדף. זהו צעד ענק לוויסות רגשי.")}
          </p>
        </div>
        <Button 
          onClick={onBack}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-8 px-12 rounded-[2rem] text-xl shadow-xl active:scale-95 transition-all"
        >
          חזרה למסך הבית
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <audio ref={audioRef} hidden />
      
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white transition-colors">
          <ArrowRight size={18} />
          סגירה
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">ליווי אישי</span>
          <span className="text-sm font-bold">יומן מחשבות</span>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden relative">
          <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-8 max-w-lg mx-auto w-full space-y-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className={cn(
            "w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 transition-all duration-500",
            isPlaying ? "scale-110 shadow-2xl shadow-indigo-500/20" : ""
          )}>
            <BookText size={32} />
          </div>
          <h3 className="text-xl md:text-2xl font-bold leading-tight">
            {prompts[step as keyof typeof prompts]}
          </h3>
          <button 
            onClick={() => handlePlayAudio(prompts[step as keyof typeof prompts])}
            className="text-xs font-black text-indigo-400 flex items-center gap-2 hover:text-white transition-colors"
          >
            {isLoadingAudio ? <Loader2 className="animate-spin size-4" /> : (isPlaying ? <RotateCcw size={14} /> : <Volume2 size={14} />)}
            {isPlaying ? "שמע שוב" : "השמע הנחיה"}
          </button>
        </div>

        {step === "write" ? (
          <div className="w-full space-y-4 animate-in fade-in duration-700">
            <Textarea 
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder={g("מה עובר עליך?", "מה עובר עלייך?")}
              className="min-h-[200px] bg-slate-900 border-white/10 text-white rounded-[2rem] p-6 focus:border-indigo-500/50 transition-all text-lg"
            />
          </div>
        ) : (
          <div className="w-full p-8 bg-slate-900/50 rounded-[2.5rem] border border-white/5 animate-in slide-in-from-bottom-4 duration-700">
            <p className="text-slate-400 text-sm font-bold mb-4">המחשבה שכתבת:</p>
            <p className="text-xl font-medium text-white italic border-r-4 border-indigo-500 pr-5">
              "{thought}"
            </p>
          </div>
        )}
      </main>

      <footer className="p-8 max-w-lg mx-auto w-full">
        <Button 
          onClick={handleNext}
          disabled={step === "write" && !thought.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black h-16 rounded-[1.5rem] text-lg shadow-lg active:scale-95 transition-all"
        >
          {step === "reframe" ? "סיום פריקה" : "המשך"}
          <Send size={20} className="mr-2 rotate-180" />
        </Button>
      </footer>
    </div>
  );
}
