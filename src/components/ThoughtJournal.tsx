"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, BookText, Send, RotateCcw, Volume2, Loader2, Mic, MicOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ThoughtJournalProps {
  gender: "m" | "f";
  onBack: () => void;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

type EfratStep = "event" | "interpretation" | "feeling" | "reaction" | "finish";

export default function ThoughtJournal({ gender, onBack }: ThoughtJournalProps) {
  const [step, setStep] = useState<EfratStep>("event");
  const [data, setData] = useState({
    event: "",
    interpretation: "",
    feeling: "",
    reaction: ""
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const recognitionRef = useRef<any>(null);

  const g = (m: string, f: string) => gender === 'f' ? f : m;

  const stepsConfig = {
    event: {
      title: "א - אירוע",
      prompt: g("מה קרה? תאר את העובדות היבשות של המקרה.", "מה קרה? תארי את העובדות היבשות של המקרה."),
      placeholder: g("תאר את האירוע...", "תארי את האירוע...")
    },
    interpretation: {
      title: "פ - פרשנות",
      prompt: g("איזה סיפור סיפרת לעצמך על מה שקרה? מה המחשבה שעברה לך בראש?", "איזה סיפור סיפרת לעצמך על מה שקרה? מה המחשבה שעברה לך בראש?"),
      placeholder: g("מה חשבת על המקרה?", "מה חשבת על המקרה?")
    },
    feeling: {
      title: "ר - רגש",
      prompt: g("מה הרגשת באותו רגע? נסה לדייק את הרגש (כעס, עצב, עלבון, פחד).", "מה הרגשת באותו רגע? נסי לדייק את הרגש (כעס, עצב, עלבון, פחד)."),
      placeholder: g("איך זה הרגיש?", "איך זה הרגיש?")
    },
    reaction: {
      title: "ת - תגובה",
      prompt: g("איך פעלת או איך היית רוצה לפעול עכשיו מתוך מקום של חוסן?", "איך פעלת או איך היית רוצה לפעול עכשיו מתוך מקום של חוסן?"),
      placeholder: g("מה התגובה שבחרת?", "מה התגובה שבחרת?")
    }
  };

  useEffect(() => {
    if (step !== "finish") {
      handlePlayAudio(stepsConfig[step as keyof typeof stepsConfig].prompt);
    }
    
    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'he-IL';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          
          setData(prev => ({ ...prev, [step]: transcript }));
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [step]);

  const handlePlayAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.9;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleNext = () => {
    const sequence: EfratStep[] = ["event", "interpretation", "feeling", "reaction", "finish"];
    const nextIdx = sequence.indexOf(step) + 1;
    setStep(sequence[nextIdx]);
  };

  const currentVal = data[step as keyof typeof data] || "";

  if (step === "finish") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150" />
          <div className="relative w-24 h-24 rounded-full border-4 border-indigo-500 overflow-hidden shadow-2xl">
            <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
          </div>
        </div>
        <div className="space-y-4 max-w-sm">
          <h2 className="text-3xl font-black text-white">השלמת את מודל אפר"ת</h2>
          <p className="text-slate-400 font-medium">
            {g("הצלחת לפרק את האירוע ולהבין את המנגנון שמפעיל אותך. זהו כלי אדיר לשליטה רגשית.", "הצלחת לפרק את האירוע ולהבין את המנגנון שמפעיל אותך. זהו כלי אדיר לשליטה רגשית.")}
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

  const currentConfig = stepsConfig[step as keyof typeof stepsConfig];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white transition-colors">
          <ArrowRight size={18} />
          סגירה
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">מודל אפר"ת</span>
          <span className="text-sm font-bold">{currentConfig.title}</span>
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
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              {currentConfig.title}
            </div>
            <h3 className="text-xl md:text-2xl font-bold leading-tight px-4">
              {currentConfig.prompt}
            </h3>
          </div>
          <button 
            onClick={() => handlePlayAudio(currentConfig.prompt)}
            className="text-xs font-black text-indigo-400 flex items-center gap-2 hover:text-white transition-colors"
          >
            {isPlaying ? <RotateCcw size={14} /> : <Volume2 size={14} />}
            {isPlaying ? "שמע שוב" : "השמע הנחיה"}
          </button>
        </div>

        <div className="w-full space-y-4 animate-in fade-in duration-700 relative">
          <Textarea 
            value={currentVal}
            onChange={(e) => setData(prev => ({ ...prev, [step]: e.target.value }))}
            placeholder={currentConfig.placeholder}
            className="min-h-[220px] bg-slate-900 border-white/10 text-white rounded-[2rem] p-6 focus:border-indigo-500/50 transition-all text-lg resize-none"
          />
          
          <div className="absolute left-4 bottom-4 flex gap-2">
            <button 
              onClick={toggleRecording}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                isRecording ? "bg-rose-500 animate-pulse" : "bg-white/10 hover:bg-white/20 text-white"
              )}
              title={isRecording ? "עצור הקלטה" : "דבר אליי (הקלטה)"}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center">
          {isRecording && (
            <p className="text-[10px] font-black text-rose-500 animate-pulse uppercase tracking-[0.2em]">
              מבצע המרה של הקול שלך לטקסט...
            </p>
          )}
        </div>
      </main>

      <footer className="p-8 max-w-lg mx-auto w-full grid grid-cols-2 gap-4">
        <Button 
          variant="outline"
          onClick={() => {
            const sequence: EfratStep[] = ["event", "interpretation", "feeling", "reaction", "finish"];
            const prevIdx = sequence.indexOf(step) - 1;
            if (prevIdx >= 0) setStep(sequence[prevIdx]);
          }}
          disabled={step === "event"}
          className="border-white/10 bg-transparent text-slate-400 h-16 rounded-[1.5rem] font-bold hover:bg-white/5"
        >
          הקודם
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!currentVal.trim() || isRecording}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-16 rounded-[1.5rem] text-lg shadow-lg active:scale-95 transition-all"
        >
          {step === "reaction" ? "סיום התהליך" : "המשך"}
          <Send size={20} className="mr-2 rotate-180" />
        </Button>
      </footer>
    </div>
  );
}