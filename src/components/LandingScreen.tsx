
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Compass } from "lucide-react";
import { LegalDialog } from "@/components/LegalDialogs";

interface LandingScreenProps {
  onComplete: (name: string, gender: "m" | "f") => void;
  onGoToAuth: () => void;
  initialName?: string;
  initialGender?: "m" | "f";
}

export default function LandingScreen({ onComplete, onGoToAuth, initialName = "", initialGender = "m" }: LandingScreenProps) {
  const [name, setName] = useState(initialName);
  const [gender, setGender] = useState<"m" | "f">(initialGender);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (initialName) setName(initialName);
    if (initialGender) setGender(initialGender);
  }, [initialName, initialGender]);

  const handleSubmit = () => {
    if (name.trim()) {
      onComplete(name.trim(), gender);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-slate-900 overflow-y-auto selection:bg-indigo-500 selection:text-white">
      <div className="fixed top-[10%] right-[10%] w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="fixed bottom-[15%] left-[5%] w-96 h-96 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="w-full max-w-md relative z-10 flex flex-col gap-10 py-12 animate-fade-in-up">
        
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-28 h-28 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl">
              <Image 
                src="https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg"
                alt="עמיר אייל, פסיכולוג קליני מפתח המצפן הרגשי"
                fill
                className="object-cover"
                data-ai-hint="portrait psychologist"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Compass size={18} className="text-white" />
              </div>
              <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">The Compass</span>
            </div>
            <h1 className="font-headline text-4xl font-black text-slate-50 tracking-tight leading-none">
              המצפן הרגשי 🧭
            </h1>
            <p className="text-slate-400 font-medium text-sm">ארגז הכלים לחוסן ושקט נפשי</p>
          </div>

          <div className="dark-glass-panel rounded-[2.5rem] p-8 text-right">
            <p className="text-slate-200 text-sm leading-relaxed font-medium">
              שלום, אני <a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors font-bold" aria-label="בקר באתר הרשמי של עמיר אייל">עמיר אייל</a>. יצרתי עבורכם את ה"מצפן הרגשי" כדי שילווה אתכם גם בין המפגשים שלנו. כאן תמצאו כלים פרקטיים לניהול רגשות, בניית חוסן ומציאת שקט נפשי בכל רגע שתזדקקו לו.
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
          <div className="space-y-6">
             <div className="space-y-4">
              <label className="text-sm font-bold text-indigo-400 block pr-1">כדי להתחיל, אנא השלימו את הפרטים:</label>
              
              <div className="space-y-2">
                <label htmlFor="landing-name" className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase block pr-1">איך נקרא לך?</label>
                <input
                  id="landing-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="הכנס/י שם..."
                  aria-label="הכנס שם"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-white/10 bg-slate-900/50 text-slate-50 text-lg font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase block pr-1">איך לפנות אליך?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGender("m")}
                  aria-label="בחר פנייה בלשון זכר"
                  className={`py-4 rounded-2xl text-base font-black transition-all border-2 ${
                    gender === "m" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-transparent border-white/10 text-slate-500 hover:bg-white/5"
                  }`}
                >
                  לשון זכר
                </button>
                <button
                  onClick={() => setGender("f")}
                  aria-label="בחר פנייה בלשון נקבה"
                  className={`py-4 rounded-2xl text-base font-black transition-all border-2 ${
                    gender === "f" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-transparent border-white/10 text-slate-500 hover:bg-white/5"
                  }`}
                >
                  לשון נקבה
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              aria-label="המשך להרשמה והתחלה"
              className="w-full py-5 rounded-[1.5rem] text-xl font-black bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3 transition-all hover:bg-indigo-700"
            >
              <UserPlus size={22} aria-hidden="true" />
              הרשמה והתחלה
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true"><span className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-600"><span className="bg-[#1a1f2e] px-4">או</span></div>
          </div>

          <button 
            onClick={onGoToAuth}
            aria-label="עבור למסך התחברות למשתמשים קיימים"
            className="w-full py-5 rounded-2xl border-2 border-white/10 text-slate-300 font-black hover:bg-white/5 transition-all flex items-center justify-center gap-3"
          >
            <LogIn size={20} aria-hidden="true" />
            כניסה למשתמשים קיימים
          </button>
          
          <p className="text-[10px] text-slate-500 text-center font-bold">ההרשמה הכרחית כדי להבטיח את פרטיותך ושמירת התקדמותך האישית במערכת.</p>
        </div>

        <footer className="text-center py-8 space-y-4">
          <div className="flex justify-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <LegalDialog type="terms" trigger={<button className="hover:text-white transition-colors" aria-label="קרא תנאי שימוש">תנאי שימוש</button>} />
            <span className="opacity-20">|</span>
            <LegalDialog type="disclaimer" trigger={<button className="hover:text-white transition-colors" aria-label="קרא דיסקליימר">דיסקליימר</button>} />
            <span className="opacity-20">|</span>
            <LegalDialog type="accessibility" trigger={<button className="hover:text-white transition-colors" aria-label="קרא הצהרת נגישות">נגישות</button>} />
          </div>
          <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
            © {currentYear} המצפן הרגשי • כל הזכויות שמורות ל<a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white" aria-label="אתר עמיר אייל">עמיר אייל</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
