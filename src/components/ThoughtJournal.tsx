
"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, BookText, Send, RotateCcw, Volume2, Loader2, Mic, MicOff, CheckCircle2, Sparkles, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { generateSpeech } from "@/ai/flows/tts-flow";
import { analyzeJournal, JournalAnalysisOutput } from "@/ai/flows/journal-analysis-flow";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection } from "firebase/firestore";

interface ThoughtJournalProps {
  gender: "m" | "f";
  onBack: () => void;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

type EfratStep = "event" | "interpretation" | "feeling" | "reaction" | "analyzing" | "finish";

export default function ThoughtJournal({ gender, onBack }: ThoughtJournalProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [step, setStep] = useState<EfratStep>("event");
  const [data, setData] = useState({
    event: "",
    interpretation: "",
    feeling: "",
    reaction: ""
  });
  const [analysis, setAnalysis] = useState<JournalAnalysisOutput | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
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
    if (step !== "finish" && step !== "analyzing") {
      handlePlayAudio(stepsConfig[step as keyof typeof stepsConfig].prompt);
    }
    
    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'he-IL';

        recognitionRef.current.onresult = (event: any) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              currentText += event.results[i][0].transcript;
            }
          }
          
          if (currentText) {
            setData(prev => ({ 
              ...prev, 
              [step]: (prev[step as keyof typeof data] + ' ' + currentText).trim() 
            }));
          }
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (currentAudio) currentAudio.pause();
    };
  }, [step]);

  const handlePlayAudio = async (text: string) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    setIsLoadingAudio(true);
    try {
      const { audioUri } = await generateSpeech({ text, gender });
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

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Speech recognition start failed", e);
      }
    }
  };

  const handleNext = async () => {
    // Stop recording automatically if user clicks next while recording
    if (isRecording) {
      recognitionRef.current?.stop();
    }

    const sequence: EfratStep[] = ["event", "interpretation", "feeling", "reaction"];
    const currentIdx = sequence.indexOf(step as any);
    
    if (currentIdx < sequence.length - 1) {
      setStep(sequence[currentIdx + 1]);
    } else {
      setStep("analyzing");
      try {
        const result = await analyzeJournal({ ...data, gender });
        setAnalysis(result);
        
        if (user && firestore) {
          const journalsRef = collection(firestore, "userProfiles", user.uid, "journals");
          addDocumentNonBlocking(journalsRef, {
            ...data,
            analysis: result,
            createdAt: new Date().toISOString()
          });
        }

        setStep("finish");
        handlePlayAudio(result.summary);
      } catch (err) {
        console.error("Analysis failed", err);
        setStep("finish");
      }
    }
  };

  const currentVal = data[step as keyof typeof data] || "";

  if (step === "analyzing") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <BrainCircuit size={48} className="animate-bounce" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">מנתח את התובנות...</h2>
          <p className="text-slate-400 font-medium">כבר חוזר אליך עם זווית חדשה ומחזקת.</p>
        </div>
      </div>
    );
  }

  if (step === "finish") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-y-auto" dir="rtl">
        <header className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden relative">
              <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
            </div>
            <div>
              <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">ניתוח חכם</span>
              <span className="block text-sm font-bold">עמיר אייל</span>
            </div>
          </div>
          <button onClick={onBack} className="text-xs font-black text-slate-500 hover:text-white transition-colors">סגירה</button>
        </header>

        <main className="p-8 max-w-lg mx-auto w-full space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-3xl font-black">השלמת את התרגול!</h2>
            <p className="text-slate-400 text-sm">היומן נשמר במרחב האישי שלך לצפייה חוזרת.</p>
          </div>

          {analysis && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pr-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">מה זיהיתי בפרשנות שלך?</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.distortions.map((d, i) => (
                    <span key={i} className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 pr-2">
                  <BrainCircuit size={16} className="text-indigo-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">זווית חדשה ומאוזנת יותר</h3>
                </div>
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 text-lg leading-relaxed italic border-r-4 border-r-indigo-500">
                  "{analysis.healthyPerspective}"
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 pr-2">
                  <BookText size={16} className="text-emerald-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">סיכום התהליך</h3>
                </div>
                <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 text-slate-200">
                  {analysis.summary}
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={onBack}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-8 rounded-[2rem] text-xl shadow-xl active:scale-95 transition-all"
          >
            חזרה למסך הבית
          </Button>
        </main>
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
            (isPlaying || isLoadingAudio) ? "scale-110 shadow-2xl shadow-indigo-500/20" : ""
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
            disabled={isLoadingAudio}
            className="text-xs font-black text-indigo-400 flex items-center gap-2 hover:text-white transition-colors disabled:opacity-50"
          >
            {isLoadingAudio ? <Loader2 size={14} className="animate-spin" /> : isPlaying ? <RotateCcw size={14} /> : <Volume2 size={14} />}
            {isLoadingAudio ? "מייצר קריינות..." : isPlaying ? "שמע שוב" : "השמע הנחיה"}
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
            const sequence: EfratStep[] = ["event", "interpretation", "feeling", "reaction"];
            const currentIdx = sequence.indexOf(step as any);
            if (currentIdx > 0) setStep(sequence[currentIdx - 1]);
          }}
          disabled={step === "event"}
          className="border-white/10 bg-transparent text-slate-400 h-16 rounded-[1.5rem] font-bold hover:bg-white/5"
        >
          הקודם
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!currentVal.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-16 rounded-[1.5rem] text-lg shadow-lg active:scale-95 transition-all"
        >
          {step === "reaction" ? "ניתוח התהליך" : "המשך"}
          <Send size={20} className="mr-2 rotate-180" />
        </Button>
      </footer>
    </div>
  );
}
