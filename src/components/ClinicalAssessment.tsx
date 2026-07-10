"use client";

import React, { useState, useEffect } from "react";
import { GAD7_ASSESSMENT, PHQ9_ASSESSMENT, getScoreInterpretation } from "@/lib/clinical-assessments";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, AlertTriangle, Loader2, Sparkles, Phone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import CrisisHelpDialog from "@/components/CrisisHelpDialog";

interface ClinicalAssessmentProps {
  gender: "m" | "f";
  onBack: () => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
  type: "gad7" | "phq9";
}

const RESPONSE_OPTIONS = [
  { value: 0, label: "כלל לא" },
  { value: 1, label: "כמה ימים" },
  { value: 2, label: "יותר מחצי מהימים" },
  { value: 3, label: "כמעט כל יום" }
];

export default function ClinicalAssessment({ gender, onBack, theme = "light", toggleTheme, type }: ClinicalAssessmentProps) {
  const isLight = theme === "light";
  const { user } = useUser();
  const firestore = useFirestore();

  const assessment = type === "gad7" ? GAD7_ASSESSMENT : PHQ9_ASSESSMENT;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Specific crisis warning flag if PHQ-9 Q9 is positive
  const [hasQ9Warning, setHasQ9Warning] = useState(false);

  const g = (m: string, f: string) => (gender === "f" ? f : m);

  useEffect(() => {
    if (user && firestore) {
      loadHistory();
    }
  }, [user, firestore, type, isFinished]);

  const loadHistory = async () => {
    if (!user || !firestore) return;
    setIsLoadingHistory(true);
    try {
      const q = query(
        collection(firestore, "clinicalAssessments"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        const d = doc.data();
        if (d.type === type) {
          list.push({
            id: doc.id,
            ...d,
            createdAtDate: new Date(d.createdAt)
          });
        }
      });
      // Sort chronologically in memory to avoid missing index errors
      list.sort((a, b) => a.createdAtDate.getTime() - b.createdAtDate.getTime());
      setHistory(list);
    } catch (e) {
      console.error("Failed to load clinical assessment history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectOption = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);

    if (currentIndex < assessment.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (answers[currentIndex] !== undefined && currentIndex < assessment.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.length < assessment.questions.length || isSubmitting) return;

    setIsSubmitting(true);
    const total = answers.reduce((acc, curr) => acc + curr, 0);
    setScore(total);

    // Clinical warning check: PHQ-9 Q9 (suicidal ideation/self harm)
    if (type === "phq9" && answers[8] > 0) {
      setHasQ9Warning(true);
    }

    try {
      if (user && firestore) {
        const collectionRef = collection(firestore, "clinicalAssessments");
        const interpretation = getScoreInterpretation(total, type).label;
        await addDocumentNonBlocking(collectionRef, {
          userId: user.uid,
          type,
          answers,
          totalScore: total,
          interpretation,
          createdAt: new Date().toISOString()
        });
      }
      setIsFinished(true);
    } catch (e) {
      console.error("Failed to save assessment:", e);
      setIsFinished(true); // Proceed to score screen anyway
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.round((answers.filter(a => a !== undefined).length / assessment.questions.length) * 100);
  const currentQuestion = assessment.questions[currentIndex];
  const selectedValue = answers[currentIndex];
  const interpretation = getScoreInterpretation(score, type);

  return (
    <div className={cn("min-h-screen flex flex-col transition-colors duration-500", isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-white")} dir="rtl">
      <header className={cn("p-6 lg:px-12 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-20", isLight ? "border-slate-200 bg-white/70" : "border-white/5 bg-slate-900/50")}>
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-full border flex items-center justify-center p-1.5 relative overflow-hidden", isLight ? "border-slate-200 bg-indigo-50 text-indigo-600" : "border-white/10 bg-indigo-950/40 text-indigo-400")}>
            <Logo variant="icon" className="w-full h-full" />
          </div>
          <div>
            <span className={cn("block text-[10px] font-black uppercase tracking-widest leading-none", isLight ? "text-indigo-600" : "text-indigo-400")}>הערכה עצמית</span>
            <span className="block text-sm font-bold">{assessment.title}</span>
          </div>
        </div>
        <button onClick={onBack} className={cn("text-xs font-black transition-colors", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-white")}>
          סגירה
        </button>
      </header>

      <main className="flex-1 p-6 max-w-lg lg:max-w-2xl mx-auto w-full flex flex-col justify-center py-12">
        {!isFinished ? (
          /* Questionnaire flow */
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500 tracking-wider">
                <span>שאלה {currentIndex + 1} מתוך {assessment.questions.length}</span>
                <span>{progressPercent}% הושלם</span>
              </div>
              <div className={cn("relative w-full h-1.5 rounded-full overflow-hidden", isLight ? "bg-slate-200" : "bg-white/5")}>
                <div
                  className="absolute top-0 right-0 h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div
              className={cn(
                "p-8 rounded-[2.5rem] border backdrop-blur-xl shadow-lg relative min-h-[160px] flex flex-col justify-center text-center",
                isLight ? "bg-white border-slate-200/60" : "bg-slate-900/40 border-white/5"
              )}
            >
              <h2 className="text-xl font-bold font-serif leading-relaxed px-4">
                {gender === "f" ? currentQuestion.text_f : currentQuestion.text_m}
              </h2>
            </div>

            {/* Options grid */}
            <div className="grid gap-3">
              {RESPONSE_OPTIONS.map((opt) => {
                const isSelected = selectedValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectOption(opt.value)}
                    className={cn(
                      "w-full p-5 rounded-2xl border text-right font-bold text-sm transition-all duration-300 active:scale-[0.98]",
                      isSelected
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                        : isLight
                          ? "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/10"
                          : "bg-slate-900/40 border-white/5 text-slate-200 hover:border-indigo-500/30 hover:bg-indigo-950/10"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span>{opt.label}</span>
                      <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full border", isSelected ? "border-white/20 text-white/80" : isLight ? "bg-slate-100 text-slate-400" : "bg-slate-950 text-slate-500")}>
                        +{opt.value} נק׳
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={cn("rounded-xl text-xs font-bold gap-1.5", isLight ? "hover:bg-slate-200" : "hover:bg-white/5")}
              >
                <ChevronRight size={14} />
                <span>קודם</span>
              </Button>

              {currentIndex === assessment.questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={answers.length < assessment.questions.length || isSubmitting}
                  className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-lg shadow-indigo-600/20 px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>שומר...</span>
                    </>
                  ) : (
                    <>
                      <span>סיים וחשב תוצאה</span>
                      <CheckCircle2 size={14} />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={selectedValue === undefined}
                  className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-lg shadow-indigo-600/10"
                >
                  <span>הבא</span>
                  <ChevronLeft size={14} />
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Finished score screen */
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-3xl font-black">הושלם בהצלחה!</h2>
              <p className={cn("text-sm", isLight ? "text-slate-500" : "text-slate-400")}>
                תוצאת השאלון תועדה ותשמש אותך למעקב אחר מגמות המצוקה.
              </p>
            </div>

            {/* Score card */}
            <div
              className={cn(
                "border rounded-[2.5rem] p-8 text-center space-y-6 relative overflow-hidden backdrop-blur-xl",
                isLight ? "bg-white border-slate-200" : "bg-slate-900/40 border-white/5"
              )}
            >
              <div className="space-y-1">
                <span className={cn("text-[10px] font-black uppercase tracking-widest", isLight ? "text-slate-400" : "text-slate-500")}>
                  הציון המשוקלל שלך
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-black font-mono text-indigo-500">{score}</span>
                  <span className={cn("text-sm font-bold", isLight ? "text-slate-400" : "text-slate-500")}>/ {assessment.questions.length * 3}</span>
                </div>
              </div>

              <div className={cn("inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-black", interpretation.color)}>
                {interpretation.label}
              </div>

              <p className={cn("text-sm leading-relaxed max-w-sm mx-auto", isLight ? "text-slate-600" : "text-slate-300")}>
                {interpretation.recommendation}
              </p>

              {/* Warning if Q9 was positive */}
              {hasQ9Warning && (
                <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-right space-y-4 mt-2">
                  <div className="flex items-center gap-3 text-rose-400">
                    <AlertTriangle size={20} />
                    <span className="font-black text-sm">התראת בטיחות חשובה</span>
                  </div>
                  <p className="text-xs text-rose-200 leading-relaxed font-bold">
                    {g(
                      "סימנת תשובה חיובית לגבי מחשבות על פגיעה עצמית. חשוב לנו להדגיש כי המצפן הרגשי אינו מהווה תחליף לטיפול נפשי מקצועי. בבקשה, אל תישאר עם התחושות האלה לבד, ופנה ברגע זה לשיחה חמה ותומכת באחד מערוצי החירום:",
                      "סימנת תשובה חיובית לגבי מחשבות על פגיעה עצמית. חשוב לנו להדגיש כי המצפן הרגשי אינו מהווה תחליף לטיפול נפשי מקצועי. בבקשה, אל תישארי עם התחושות האלה לבד, ופני ברגע זה לשיחה חמה ותומכת באחד מערוצי החירום:"
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a href="tel:1201" className="flex-1 min-w-[120px] py-2 px-3 bg-rose-500 text-white rounded-xl text-center text-xs font-black hover:bg-rose-600 transition-colors">
                      חיוג לער"ן (1201)
                    </a>
                    <a href="https://sahar.org.il/" target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[120px] py-2 px-3 bg-indigo-500 text-white rounded-xl text-center text-xs font-black hover:bg-indigo-600 transition-colors">
                      צ'אט סה"ר
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Trend History graph */}
            {history.length > 1 && (
              <div
                className={cn(
                  "border rounded-3xl p-6 space-y-4",
                  isLight ? "bg-white border-slate-200" : "bg-slate-900/40 border-white/5"
                )}
              >
                <div className="flex items-center gap-2 pr-1">
                  <Sparkles size={16} className="text-indigo-400" />
                  <span className={cn("text-xs font-black uppercase tracking-widest", isLight ? "text-slate-500" : "text-slate-400")}>
                    מגמת השינוי שלך
                  </span>
                </div>

                {/* SVG Sparkline Graph */}
                <div className="relative w-full h-32 pt-6 pb-2" dir="ltr">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="10" x2="100" y2="10" stroke={isLight ? "#F1F5F9" : "#1E293B"} strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke={isLight ? "#F1F5F9" : "#1E293B"} strokeWidth="0.5" />
                    <line x1="0" y1="90" x2="100" y2="90" stroke={isLight ? "#F1F5F9" : "#1E293B"} strokeWidth="0.5" />
                    
                    {/* SVG Line path */}
                    <path
                      d={`M ${history.map((h, idx) => {
                        const x = (idx / (history.length - 1)) * 100;
                        const maxVal = assessment.questions.length * 3;
                        const y = 100 - (h.totalScore / maxVal) * 80 - 10;
                        return `${x},${y}`;
                      }).join(" L ")}`}
                      fill="none"
                      stroke="#6366F1"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* SVG Points */}
                    {history.map((h, idx) => {
                      const x = (idx / (history.length - 1)) * 100;
                      const maxVal = assessment.questions.length * 3;
                      const y = 100 - (h.totalScore / maxVal) * 80 - 10;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="4"
                          fill={isLight ? "#FFFFFF" : "#0F172A"}
                          stroke="#6366F1"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>

                  {/* SVG Labels */}
                  <div className="absolute inset-x-0 bottom-[-16px] flex justify-between text-[8px] font-bold text-slate-500 font-mono">
                    {history.map((h, idx) => {
                      const dateObj = new Date(h.createdAt);
                      const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
                      return (
                        <span key={idx} className="w-10 text-center">
                          {formattedDate} ({h.totalScore})
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button
                onClick={onBack}
                className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-8"
              >
                חזור למסך הבית
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
