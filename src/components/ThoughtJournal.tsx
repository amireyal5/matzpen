"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, 
  BookText, 
  Send, 
  RotateCcw, 
  Volume2, 
  Loader2, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  Sparkles, 
  BrainCircuit, 
  Phone, 
  AlertTriangle, 
  UserPlus, 
  ChevronLeft,
  Check,
  Info,
  Play,
  Pause,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useWakeLock } from "@/hooks/use-wake-lock";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { generateSpeech } from "@/ai/flows/tts-flow";
import { analyzeJournal, JournalAnalysisOutput } from "@/ai/flows/journal-analysis-flow";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection } from "firebase/firestore";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ThoughtJournalProps {
  gender: "m" | "f";
  onBack: () => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

type EfratStep = "event" | "interpretation" | "feeling" | "reaction" | "analyzing" | "finish";

const DISTORTIONS_HELP = {
  "הכל או כלום": "ראיית דברים בשחור-לבן. אם משהו אינו מושלם, הוא נחשב כישלון מוחלט (למשל: 'אם איחרתי בחמש דקות, כל הפגישה הרוסה').",
  "חשיבה קטסטרופלית": "ניבוי העתיד בצורה שלילית באופן קיצוני ללא התחשבות בתוצאות סבירות יותר (למשל: 'אני בטוח אכשל ויפטרו אותי').",
  "קריאת מחשבות": "הנחה שאנו יודעים מה אנשים אחרים חושבים, מבלי שיש לנו הוכחות לכך (למשל: 'היא מסתכלת עליי ומצטערת שפגשה אותי').",
  "חשיבה רגשית": "הנחה שהרגשות השליליים שלנו משקפים את המציאות כפי שהיא (למשל: 'אני מרגיש אשם, לכן בטוח עשיתי משהו נורא').",
  "הכללה": "הסקת מסקנה גורפת על בסיס אירוע בודד (למשל: 'תמיד הכל מתקלקל לי', 'אף אחד לא אוהב אותי').",
  "פילטר שלילי": "התמקדות בלעדית בפרטים השליליים תוך התעלמות מכל ההיבטים החיוביים (למשל: 'היו עשר מחמאות אבל הערה אחת רעה אומרת שהכל גרוע').",
  "העצמה מזעור": "ניפוח של טעויות ומגרעות ומזעור של הצלחות ונקודות חוזק.",
  "הצהרות 'צריך'": "חוקים נוקשים לגבי האופן שבו אנו או אחרים צריכים להתנהג (למשל: 'אני חייב תמיד להצליח', 'הוא היה צריך לדעת')."
};

const MOOD_CHIPS = [
  { label: "כעס / עצבנות", emoji: "😡", baseClass: "border-rose-500/30 text-rose-400 bg-rose-500/5 hover:bg-rose-500/15", activeClass: "bg-rose-500/25 border-rose-500 text-rose-200 shadow-lg shadow-rose-500/20" },
  { label: "חרדה / לחץ", emoji: "😨", baseClass: "border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/15", activeClass: "bg-amber-500/25 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/20" },
  { label: "עצב / כאב", emoji: "😢", baseClass: "border-sky-500/30 text-sky-400 bg-sky-500/5 hover:bg-sky-500/15", activeClass: "bg-sky-500/25 border-sky-500 text-sky-200 shadow-lg shadow-sky-500/20" },
  { label: "אכזבה / תסכול", emoji: "😞", baseClass: "border-purple-500/30 text-purple-400 bg-purple-500/5 hover:bg-purple-500/15", activeClass: "bg-purple-500/25 border-purple-500 text-purple-200 shadow-lg shadow-purple-500/20" },
  { label: "בושה / אשמה", emoji: "😳", baseClass: "border-pink-500/30 text-pink-400 bg-pink-500/5 hover:bg-pink-500/15", activeClass: "bg-pink-500/25 border-pink-500 text-pink-200 shadow-lg shadow-pink-500/20" },
  { label: "דאגה / חשש", emoji: "😟", baseClass: "border-indigo-500/30 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/15", activeClass: "bg-indigo-500/25 border-indigo-500 text-indigo-200 shadow-lg shadow-indigo-500/20" },
];

export default function ThoughtJournal({ gender, onBack, theme = "light", toggleTheme }: ThoughtJournalProps) {
  const isLight = theme === "light";
  const { user } = useUser();
  const firestore = useFirestore();
  const [step, setStep] = useState<EfratStep>("event");
  const [data, setData] = useState({
    event: "",
    interpretation: "",
    feeling: "",
    reaction: ""
  });
  
  // Custom states for Feeling step
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [moodIntensity, setMoodIntensity] = useState<number>(50);
  const [additionalFeelingText, setAdditionalFeelingText] = useState("");

  const [analysis, setAnalysis] = useState<JournalAnalysisOutput | null>(null);
  const [activeDistortion, setActiveDistortion] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Custom audio player state
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  
  const recognitionRef = useRef<any>(null);

  useWakeLock(step !== 'finish');

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
      prompt: g("מה הרגשת באותו רגע? בחר או תאר את הרגש ועוצמתו.", "מה הרגשת באותו רגע? בחרי או תארי את הרגש ועוצמתו."),
      placeholder: g("איך זה הרגיש?", "איך זה הרגיש?")
    },
    reaction: {
      title: "ת - תגובה",
      prompt: g("איך פעלת או איך היית רוצה לפעול עכשיו מתוך מקום של חוסן?", "איך פעלת או איך היית רוצה לפעול עכשיו מתוך מקום של חוסן?"),
      placeholder: g("מה התגובה שבחרת?", "מה התגובה שבחרת?")
    }
  };

  const suggestionTags = {
    event: [
      g("שיחה לא נעימה בעבודה", "שיחה לא נעימה בעבודה"),
      g("ויכוח טעון עם בן הזוג", "ויכוח טעון עם בת הזוג"),
      g("עיכוב מתסכל בכביש", "עיכוב מתסכל בכביש"),
      g("הודעת חדשות מלחיצה", "הודעת חדשות מלחיצה")
    ],
    interpretation: [
      g("הם בטח חושבים שאני לא מספיק טוב", "הם בטח חושבים שאני לא מספיק טובה"),
      g("תמיד הכל קורה לי, אני חסר מזל", "תמיד הכל קורה לי, אני חסרת מזל"),
      g("הם עושים את זה בכוונה לפגוע בי", "הם עושים את זה בכוונה לפגוע בי"),
      g("זה ייגמר באסון ואין מה לעשות", "זה ייגמר באסון ואין מה לעשות")
    ],
    reaction: [
      g("הסתגרתי בתוך עצמי ולא דיברתי", "הסתגרתי בתוך עצמי ולא דיברתי"),
      g("הגבתי מיד בכעס ובצעקות", "הגבתי מיד בכעס ובצעקות"),
      g("לקחתי נשימה עמוקה ועניתי ברוגע", "לקחתי נשימה עמוקה ועניתי ברוגע"),
      g("התחלתי להעסיק את עצמי במשהו אחר", "התחלתי להעסיק את עצמי במשהו אחר")
    ]
  };

  // Sync Feeling step data
  useEffect(() => {
    const computed = [
      selectedMoods.length > 0 ? `רגשות: ${selectedMoods.join(", ")}` : "",
      `עוצמה: ${moodIntensity}%`,
      additionalFeelingText ? `תיאור נוסף: ${additionalFeelingText}` : ""
    ].filter(Boolean).join(" | ");
    
    setData(prev => ({ ...prev, feeling: computed }));
  }, [selectedMoods, moodIntensity, additionalFeelingText]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'he-IL';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              const transcript = event.results[i][0].transcript.trim();
              if (transcript) finalTranscript += transcript + ' ';
            }
          }
          
          if (finalTranscript.trim()) {
            if (step === "feeling") {
              setAdditionalFeelingText(prev => {
                if (prev.includes(finalTranscript.trim())) return prev;
                return (prev + ' ' + finalTranscript.trim()).trim();
              });
            } else {
              setData(prev => {
                const currentStepKey = step as keyof typeof data;
                const currentText = prev[currentStepKey];
                if (currentText.includes(finalTranscript.trim())) return prev;
                return { 
                  ...prev, 
                  [currentStepKey]: (currentText + ' ' + finalTranscript.trim()).trim() 
                };
              });
            }
          }
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.onplay = null;
        currentAudio.onpause = null;
        currentAudio.onended = null;
        currentAudio.ontimeupdate = null;
        currentAudio.onloadedmetadata = null;
      }
    };
  }, [step, currentAudio]);

  const handlePlayAudio = async (text: string) => {
    if (currentAudio) {
      if (isPlaying) {
        currentAudio.pause();
        setIsPlaying(false);
        return;
      } else {
        currentAudio.play();
        setIsPlaying(true);
        return;
      }
    }

    setIsLoadingAudio(true);
    try {
      const { audioUri } = await generateSpeech({ text, gender });
      const audio = new Audio(audioUri);
      
      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoadingAudio(false);
      };
      
      audio.onpause = () => {
        setIsPlaying(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setAudioProgress(0);
        setAudioCurrentTime(0);
      };

      audio.ontimeupdate = () => {
        setAudioCurrentTime(audio.currentTime);
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoadingAudio(false);
      };
      
      setCurrentAudio(audio);
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
    if (isRecording) {
      setIsRecording(false);
      recognitionRef.current?.stop();
      await new Promise(resolve => setTimeout(resolve, 600));
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
          const journalsRef = collection(firestore, "thoughtJournals");
          addDocumentNonBlocking(journalsRef, {
            userId: user.uid,
            ...data,
            analysis: result,
            createdAt: new Date().toISOString()
          });
        }

        setStep("finish");
      } catch (err) {
        console.error("Analysis failed", err);
        setStep("finish");
      }
    }
  };

  const handleTagClick = (tag: string) => {
    setData(prev => {
      const currentVal = prev[step as keyof typeof data] || "";
      const newVal = currentVal ? `${currentVal} ${tag}` : tag;
      return { ...prev, [step]: newVal };
    });
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentVal = data[step as keyof typeof data] || "";
  const isFeelingStepValid = selectedMoods.length > 0 || additionalFeelingText.trim() !== "";
  const isCurrentStepValid = step === "feeling" 
    ? isFeelingStepValid 
    : (currentVal.trim() !== "" || isRecording);

  // Stepper component
  const Stepper = () => {
    const stepsList: { key: EfratStep; label: string; name: string }[] = [
      { key: "event", label: "א", name: "אירוע" },
      { key: "interpretation", label: "פ", name: "פרשנות" },
      { key: "feeling", label: "ר", name: "רגש" },
      { key: "reaction", label: "ת", name: "תגובה" }
    ];
    
    const currentIdx = stepsList.findIndex(s => s.key === step);
    
    return (
      <div className="w-full flex items-center justify-between px-2 select-none" dir="rtl">
        {stepsList.map((s, idx) => {
          const isActive = s.key === step;
          const isCompleted = currentIdx > idx;
          
          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center relative">
                <button
                  type="button"
                  onClick={() => {
                    if (idx < currentIdx) {
                      setStep(s.key);
                    }
                  }}
                  disabled={idx >= currentIdx}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-300 text-sm border",
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-500 ring-4 ring-indigo-500/30 scale-110 shadow-lg shadow-indigo-500/30"
                      : isCompleted
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/40 cursor-pointer hover:bg-indigo-500/20"
                        : isLight ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-slate-900 text-slate-600 border-white/5 cursor-not-allowed"
                  )}
                >
                  {isCompleted ? <Check className="h-4.5 w-4.5" /> : s.label}
                </button>
                <span className={cn(
                  "absolute -bottom-6 text-[10px] font-black tracking-wider whitespace-nowrap transition-colors duration-300",
                  isActive ? (isLight ? "text-indigo-600" : "text-indigo-400") : isCompleted ? (isLight ? "text-slate-500" : "text-slate-400") : (isLight ? "text-slate-300" : "text-slate-600")
                )}>
                  {s.name}
                </span>
              </div>

              {idx < stepsList.length - 1 && (
                <div className={cn("flex-1 mx-3 h-[2px] relative", isLight ? "bg-slate-200" : "bg-slate-900")}>
                  <div 
                    className="absolute inset-0 bg-indigo-500 transition-all duration-500" 
                    style={{ width: isCompleted ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (step === "analyzing") {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700 transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100" : "bg-slate-950")}>
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <BrainCircuit size={48} className="animate-bounce" aria-hidden="true" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className={cn("text-2xl font-black", isLight ? "text-slate-900" : "text-white")}>מנתח את התובנות...</h2>
          <p className={cn("font-medium", isLight ? "text-slate-500" : "text-slate-400")}>כבר חוזר אליך עם זווית חדשה ומחזקת.</p>
        </div>
      </div>
    );
  }

  if (step === "finish") {
    return (
      <div className={cn("min-h-screen flex flex-col overflow-y-auto transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-slate-950 text-white")} dir="rtl">
        <header className={cn("p-6 lg:px-12 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-20", isLight ? "border-slate-200 bg-white/70" : "border-white/5 bg-slate-900/50")}>
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full border overflow-hidden relative", isLight ? "border-slate-200" : "border-white/10")}>
              <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
            </div>
            <div>
              <span className={cn("block text-[10px] font-black uppercase tracking-widest leading-none", isLight ? "text-indigo-600" : "text-indigo-400")}>ניתוח חכם</span>
              <span className="block text-sm font-bold">עמיר אייל</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {toggleTheme && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheme}
                    className={cn(
                      "w-9 h-9 rounded-full border flex items-center justify-center transition-all active:scale-95",
                      isLight ? "bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                    )}
                    aria-label={isLight ? "מעבר לתצוגה כהה" : "מעבר לתצוגה בהירה"}
                  >
                    {isLight ? <Moon size={16} /> : <Sun size={16} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isLight ? "תצוגה כהה" : "תצוגה בהירה"}</TooltipContent>
              </Tooltip>
            )}
            <button onClick={onBack} className={cn("text-xs font-black transition-colors", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-white")}>סגירה</button>
          </div>
        </header>

        <main className="p-8 max-w-lg lg:max-w-2xl mx-auto w-full space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          {analysis?.isCrisis ? (
            <div className="p-8 bg-rose-950/20 rounded-[2.5rem] border border-rose-500/30 text-right space-y-8 backdrop-blur-xl">
              <div className="flex items-center gap-4 text-rose-400">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <AlertTriangle size={28} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-black">זיהוי מצוקה קשה</h3>
              </div>
              
              <p className="text-rose-100 leading-relaxed font-bold text-lg">
                {analysis.summary}
              </p>

              <div className="grid gap-4">
                <a href="tel:1201" className="flex items-center justify-between p-5 bg-slate-900/80 border border-rose-500/20 rounded-2xl hover:bg-rose-950/30 transition-all group" aria-label="התקשר לערן">
                  <div className="flex items-center gap-4 text-right">
                    <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone size={20} />
                    </div>
                    <div>
                      <span className="block font-black text-rose-300">ער"ן - עזרה ראשונה נפשית</span>
                      <span className="block text-xs text-slate-400">חיוג חינם: 1201</span>
                    </div>
                  </div>
                  <ChevronLeft size={20} className="text-rose-400/50 rotate-180" />
                </a>

                <a href="tel:101" className="flex items-center justify-between p-5 bg-slate-900/80 border border-rose-500/20 rounded-2xl hover:bg-rose-950/30 transition-all group" aria-label="התקשר למדא">
                  <div className="flex items-center gap-4 text-right">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone size={20} />
                    </div>
                    <div>
                      <span className="block font-black text-emerald-300">מד"א - חירום רפואי</span>
                      <span className="block text-xs text-slate-400">חיוג חירום: 101</span>
                    </div>
                  </div>
                  <ChevronLeft size={20} className="text-rose-400/50 rotate-180" />
                </a>

                <div className="p-6 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex items-center gap-4 text-right">
                  <UserPlus className="text-indigo-400 shrink-0" size={24} aria-hidden="true" />
                  <p className="text-sm font-bold text-indigo-200 leading-relaxed">
                    {g(
                      "בבקשה, פנה עכשיו לחבר קרוב או בן משפחה. אל תישאר לבד.",
                      "בבקשה, פני עכשיו לחבר קרוב או בן משפחה. אל תישארי לבד."
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
                  <CheckCircle2 size={32} aria-hidden="true" />
                </div>
                <h2 className="text-3xl font-black">השלמת את התרגול!</h2>
                <p className={cn("text-sm", isLight ? "text-slate-500" : "text-slate-400")}>היומן נשמר במרחב האישי שלך לצפייה חוזרת.</p>
              </div>

              {analysis ? (
                <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
                  {/* Cognitive Distortions Card */}
                  <div className={cn("space-y-4 border rounded-3xl p-6", isLight ? "bg-white/70 border-slate-200" : "bg-slate-900/40 border-white/5")}>
                    <div className="flex items-center gap-2 pr-2">
                      <Sparkles size={16} className="text-amber-400" aria-hidden="true" />
                      <h3 className={cn("text-xs font-black uppercase tracking-widest", isLight ? "text-slate-500" : "text-slate-400")}>עיוותי חשיבה שזיהינו</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.distortions.map((d, i) => {
                        const cleanName = Object.keys(DISTORTIONS_HELP).find(k => d.includes(k) || k.includes(d)) || d;
                        const hasExplanation = !!DISTORTIONS_HELP[cleanName as keyof typeof DISTORTIONS_HELP];
                        const isSelected = activeDistortion === cleanName;
                        
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (hasExplanation) {
                                setActiveDistortion(isSelected ? null : cleanName);
                              }
                            }}
                            className={cn(
                              "px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-1.5 border",
                              isSelected 
                                ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10"
                                : "bg-amber-500/5 border-amber-500/10 text-amber-400 hover:bg-amber-500/10"
                            )}
                          >
                            {d}
                            {hasExplanation && (
                              <Info size={14} className={cn("shrink-0 transition-transform duration-300 text-amber-500/70", isSelected ? "rotate-180" : "")} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    {activeDistortion && (
                      <div className={cn("mt-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/25 text-sm leading-relaxed animate-in slide-in-from-top-2 duration-300", isLight ? "text-slate-600" : "text-slate-300")}>
                        <strong className="block text-amber-500 mb-1 font-bold">{activeDistortion}:</strong>
                        {DISTORTIONS_HELP[activeDistortion as keyof typeof DISTORTIONS_HELP]}
                      </div>
                    )}
                  </div>

                  {/* Healthy Perspective Card */}
                  <div className={cn("space-y-3 bg-gradient-to-br border rounded-[2.5rem] p-7 relative overflow-hidden backdrop-blur-xl", isLight ? "from-indigo-50 to-purple-50 border-indigo-200" : "from-indigo-950/20 to-purple-950/25 border-indigo-500/20")}>
                    <div className="absolute top-4 right-4 text-indigo-500/10 text-8xl font-serif pointer-events-none select-none">"</div>
                    <div className="flex items-center gap-2 pr-1 mb-2">
                      <BrainCircuit size={18} className={isLight ? "text-indigo-600" : "text-indigo-400"} aria-hidden="true" />
                      <h3 className={cn("text-xs font-black uppercase tracking-widest", isLight ? "text-indigo-600" : "text-indigo-400")}>זווית חדשה ומאוזנת יותר</h3>
                    </div>
                    <p className={cn("text-xl leading-relaxed font-medium italic relative z-10", isLight ? "text-slate-800" : "text-slate-100")}>
                      "{analysis.healthyPerspective}"
                    </p>
                  </div>

                  {/* Process Summary Card */}
                  <div className={cn("space-y-4 border rounded-3xl p-6", isLight ? "bg-white/70 border-slate-200" : "bg-slate-900/40 border-white/5")}>
                    <div className="flex items-center gap-2 pr-1">
                      <BookText size={18} className="text-emerald-400" aria-hidden="true" />
                      <h3 className={cn("text-xs font-black uppercase tracking-widest", isLight ? "text-slate-500" : "text-slate-400")}>סיכום התהליך</h3>
                    </div>

                    {/* Custom Audio Player */}
                    <div className={cn("border rounded-2xl p-4 shadow-xl flex flex-col gap-3 relative overflow-hidden", isLight ? "bg-slate-50 border-slate-100" : "bg-slate-950 border-white/5")}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(analysis.summary)}
                            disabled={isLoadingAudio}
                            className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shrink-0 shadow-lg shadow-indigo-600/30"
                          >
                            {isLoadingAudio ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : isPlaying ? (
                              <Pause className="h-5 w-5 fill-white" />
                            ) : (
                              <Play className="h-5 w-5 fill-white translate-x-[1px]" />
                            )}
                          </button>
                          <div>
                            <h4 className={cn("text-sm font-bold", isLight ? "text-slate-900" : "text-white")}>הקראת סיכום התהליך</h4>
                            <p className="text-[10px] text-slate-500">קריינות מותאמת אישית של עמיר אייל</p>
                          </div>
                        </div>

                        {isPlaying && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mt-1">
                        <div className={cn("relative w-full h-1 rounded-full overflow-hidden", isLight ? "bg-slate-200" : "bg-white/5")}>
                          <div
                            className="absolute top-0 right-0 h-full bg-gradient-to-l from-indigo-500 to-purple-500 rounded-full transition-all duration-100"
                            style={{ width: `${audioProgress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>{formatTime(audioCurrentTime)}</span>
                          <span>{formatTime(audioDuration)}</span>
                        </div>
                      </div>
                    </div>

                    <p className={cn("leading-relaxed text-base", isLight ? "text-slate-600" : "text-slate-300")}>
                      {analysis.summary}
                    </p>
                  </div>
                </div>
              ) : (
                <div className={cn("p-8 rounded-[2.5rem] border text-center", isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-white/5 border-white/10 text-slate-400")}>
                  התרגול נשמר, אך הניתוח המורחב לא היה זמין ברגע זה. ניתן לנסות שוב מאוחר יותר דרך היסטוריית היומנים.
                </div>
              )}
            </>
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
    <div className={cn("min-h-screen flex flex-col transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-slate-950 text-white")}>
      <header className={cn("p-6 lg:px-12 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-20", isLight ? "border-slate-200 bg-white/70" : "border-white/5 bg-slate-900/50")}>
        <button onClick={onBack} className={cn("flex items-center gap-2 text-xs font-black transition-colors", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-white")}>
          <ArrowRight size={18} />
          סגירה
        </button>
        <div className="flex flex-col items-center">
          <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none mb-0.5", isLight ? "text-indigo-600" : "text-indigo-400")}>מודל אפר"ת</span>
          <span className="text-sm font-bold">{currentConfig.title}</span>
        </div>
        <div className="flex items-center gap-3">
          {toggleTheme && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "w-9 h-9 rounded-full border flex items-center justify-center transition-all active:scale-95",
                    isLight ? "bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                  )}
                  aria-label={isLight ? "מעבר לתצוגה כהה" : "מעבר לתצוגה בהירה"}
                >
                  {isLight ? <Moon size={16} /> : <Sun size={16} />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isLight ? "תצוגה כהה" : "תצוגה בהירה"}</TooltipContent>
            </Tooltip>
          )}
          <div className={cn("w-10 h-10 rounded-full border overflow-hidden relative", isLight ? "border-slate-200" : "border-white/10")}>
            <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
          </div>
        </div>
      </header>

      {/* Visual Stepper */}
      <div className={cn("border-b px-6 py-4 sticky top-[88px] z-10 backdrop-blur-sm", isLight ? "border-slate-200 bg-white/30" : "border-white/5 bg-slate-950/30")}>
        <div className="max-w-lg lg:max-w-2xl mx-auto w-full pb-3">
          <Stepper />
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center p-8 max-w-lg lg:max-w-2xl mx-auto w-full space-y-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className={cn(
            "w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 transition-all duration-500 border border-indigo-500/10",
            (isPlaying || isLoadingAudio) ? "scale-110 shadow-2xl shadow-indigo-500/20 border-indigo-500/30" : ""
          )}>
            <BookText size={32} aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <div className={cn("inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest", isLight ? "text-indigo-600" : "text-indigo-400")}>
              {currentConfig.title}
            </div>
            <h3 className={cn("text-xl md:text-2xl lg:text-3xl font-bold leading-tight px-4", isLight ? "text-slate-900" : "text-white")}>
              {currentConfig.prompt}
            </h3>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handlePlayAudio(currentConfig.prompt)}
                disabled={isLoadingAudio}
                className={cn("text-xs font-black flex items-center gap-2 transition-colors disabled:opacity-50", isLight ? "text-indigo-600 hover:text-slate-900" : "text-indigo-400 hover:text-white")}
                aria-label="השמע הנחיה"
              >
                {isLoadingAudio ? <Loader2 size={14} className="animate-spin" /> : isPlaying ? <RotateCcw size={14} /> : <Volume2 size={14} />}
                {isLoadingAudio ? "מייצר קריינות..." : isPlaying ? "שמע שוב" : "השמע הנחיה"}
              </button>
            </TooltipTrigger>
            <TooltipContent>השמע את השאלה בקול</TooltipContent>
          </Tooltip>
        </div>

        {/* Dynamic Inputs depending on current Step */}
        <div className="w-full relative">
          
          {step === "feeling" ? (
            <div className="w-full space-y-6 animate-in fade-in duration-500">
              {/* Mood Selector Grid */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-500 block pr-1">איך זה מרגיש בגוף ובלב? (ניתן לבחור יותר מרגש אחד)</span>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOOD_CHIPS.map((chip) => {
                    const isSelected = selectedMoods.includes(chip.label);
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => {
                          const updated = isSelected 
                            ? selectedMoods.filter(m => m !== chip.label) 
                            : [...selectedMoods, chip.label];
                          setSelectedMoods(updated);
                        }}
                        className={cn(
                          "flex items-center gap-2.5 p-4 rounded-2xl border text-sm font-bold transition-all duration-300 text-right justify-start",
                          isSelected ? chip.activeClass : chip.baseClass
                        )}
                      >
                        <span className="text-lg">{chip.emoji}</span>
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Intensity Slider */}
              <div className={cn("space-y-3 p-5 rounded-2xl border", isLight ? "bg-white/70 border-slate-200" : "bg-white/5 border-white/5")}>
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-black", isLight ? "text-slate-500" : "text-slate-400")}>עוצמת הרגש</span>
                  <span className={cn("text-sm font-bold font-mono", isLight ? "text-indigo-600" : "text-indigo-400")}>{moodIntensity}%</span>
                </div>
                <Slider
                  value={[moodIntensity]}
                  onValueChange={(val) => setMoodIntensity(val[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="py-2 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <span>קל</span>
                  <span>בינוני</span>
                  <span>עוצמתי מאוד</span>
                </div>
              </div>

              {/* Additional Feeling Textbox */}
              <div className="space-y-2 relative">
                <span className="text-xs font-black text-slate-500 block pr-1">פרטים נוספים או תחושות גופניות:</span>
                <Textarea
                  value={additionalFeelingText}
                  onChange={(e) => setAdditionalFeelingText(e.target.value)}
                  placeholder="לדוגמה: הרגשתי מועקה חזקה בחזה, קוצר נשימה או דופק מהיר..."
                  className={cn("min-h-[120px] rounded-[2rem] p-6 focus:border-indigo-500/50 transition-all text-lg resize-none", isLight ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400" : "bg-slate-900 border-white/10 text-white")}
                  aria-label="תיאור נוסף של הרגש"
                />

                {/* Voice button for Feeling step */}
                <div className="absolute left-4 bottom-4 flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                          isRecording ? "bg-rose-500 animate-pulse text-white" : isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-white/10 hover:bg-white/20 text-white"
                        )}
                        aria-label="הקלטת שמע"
                      >
                        {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>דבר/י במקום להקליד</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4 animate-in fade-in duration-500 relative">
              <Textarea
                value={currentVal}
                onChange={(e) => setData(prev => ({ ...prev, [step]: e.target.value }))}
                placeholder={currentConfig.placeholder}
                className={cn("min-h-[220px] rounded-[2rem] p-6 focus:border-indigo-500/50 transition-all text-lg resize-none", isLight ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400" : "bg-slate-900 border-white/10 text-white")}
                aria-label={currentConfig.title}
              />

              {/* Voice button for Standard step */}
              <div className="absolute left-4 bottom-4 flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                        isRecording ? "bg-rose-500 animate-pulse text-white" : isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-white/10 hover:bg-white/20 text-white"
                      )}
                      aria-label={isRecording ? "עצור הקלטה" : "דבר אליי (הקלטה)"}
                    >
                      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{isRecording ? "עצור הקלטה" : "השתמש בקול במקום להקליד"}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Voice recording overlay */}
          {isRecording && (
            <div className={cn("absolute inset-0 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center p-6 space-y-6 animate-in fade-in duration-300 z-30 border", isLight ? "bg-white/90 border-slate-200" : "bg-slate-950/90 border-white/5")}>
              <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 rounded-full bg-rose-500/20 animate-ping" />
                <div className="absolute w-20 h-20 rounded-full bg-rose-500/30 animate-pulse" />
                <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center text-white relative shadow-lg shadow-rose-500/50">
                  <Mic className="h-6 w-6 animate-pulse" />
                </div>
              </div>

              <div className="text-center space-y-1.5">
                <p className="text-base font-black text-rose-500">אני מקשיב לך...</p>
                <p className={cn("text-xs", isLight ? "text-slate-500" : "text-slate-400")}>הקול שלך מתורגם לטקסט בזמן אמת</p>
              </div>

              {/* Glowing animated wave bars */}
              <div className="flex items-center gap-1.5 h-10 justify-center">
                <div className="w-1 bg-rose-500 rounded-full animate-bounce duration-300 [animation-delay:0.1s] h-5" />
                <div className="w-1 bg-rose-500 rounded-full animate-bounce duration-300 [animation-delay:0.3s] h-8" />
                <div className="w-1 bg-rose-500 rounded-full animate-bounce duration-300 [animation-delay:0.5s] h-10" />
                <div className="w-1 bg-rose-500 rounded-full animate-bounce duration-300 [animation-delay:0.2s] h-6" />
                <div className="w-1 bg-rose-500 rounded-full animate-bounce duration-300 [animation-delay:0.4s] h-4" />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={toggleRecording}
                className="border-rose-500/30 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 rounded-2xl h-12 px-6"
              >
                סיום הקלטה והמשך
              </Button>
            </div>
          )}

          {/* Tag Suggestions */}
          {step !== "feeling" && suggestionTags[step as keyof typeof suggestionTags] && (
            <div className="space-y-2 mt-4 animate-in fade-in duration-500">
              <span className="text-[10px] font-black text-slate-500 block pr-1">הצעות להתחלה:</span>
              <div className="flex flex-wrap gap-2">
                {suggestionTags[step as keyof typeof suggestionTags].map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={cn("text-xs px-3 py-1.5 rounded-xl border transition-all active:scale-95 text-right", isLight ? "bg-white/70 border-slate-200 text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700" : "bg-white/5 border-white/5 text-slate-400 hover:bg-indigo-600/15 hover:border-indigo-500/30 hover:text-indigo-300")}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="p-8 max-w-lg lg:max-w-2xl mx-auto w-full grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const sequence: EfratStep[] = ["event", "interpretation", "feeling", "reaction"];
            const currentIdx = sequence.indexOf(step as any);
            if (currentIdx > 0) setStep(sequence[currentIdx - 1]);
          }}
          disabled={step === "event"}
          className={cn("h-16 rounded-[1.5rem] font-bold bg-transparent", isLight ? "border-slate-200 text-slate-500 hover:bg-slate-100" : "border-white/10 text-slate-400 hover:bg-white/5")}
        >
          הקודם
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!isCurrentStepValid}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-16 rounded-[1.5rem] text-lg shadow-lg active:scale-95 transition-all"
        >
          {step === "reaction" ? "ניתוח התהליך" : "המשך"}
          <Send size={20} className="mr-2 rotate-180" />
        </Button>
      </footer>
    </div>
  );
}
