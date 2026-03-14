
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
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
    <div className="min-h-screen flex flex-col items-center p-6 bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_50%,#0F172A_100%)] overflow-y-auto">
      <div className="fixed top-[10%] right-[10%] w-48 h-48 rounded-full border border-indigo-500/10 pointer-events-none" />
      <div className="fixed bottom-[15%] left-[5%] w-72 h-72 rounded-full border border-indigo-500/5 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col gap-8 py-12 animate-fade-in-up">
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative w-28 h-28 rounded-full border-4 border-indigo-500/30 overflow-hidden shadow-2xl">
            <Image 
              src="https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg"
              alt="עמיר אייל"
              fill
              className="object-cover"
              data-ai-hint="portrait psychologist"
            />
          </div>
          <div className="space-y-2">
            <h1 className="font-headline text-3xl font-black text-slate-50 tracking-tight leading-none">
              המצפן הרגשי 🧭
            </h1>
            <p className="text-indigo-400 font-bold text-sm">ברוכים הבאים למרחב התמיכה שלכם</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-right">
            <p className="text-slate-200 text-sm leading-relaxed font-medium">
              שלום, אני <a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors font-bold">עמיר אייל</a>. יצרתי עבורכם את ה"מצפן הרגשי" כדי שילווה אתכם גם בין המפגשים שלנו. כאן תמצאו כלים פרקטיים לניהול רגשות, בניית חוסן ומציאת שקט נפשי בכל רגע שתזדקקו לו.
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-indigo-500/20 shadow-2xl space-y-6">
          <div className="space-y-4">
             <div className="space-y-4">
              <label className="text-sm font-bold text-indigo-400 block pr-1">כדי להתחיל, אנא השלימו את הפרטים:</label>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase block pr-1">איך נקרא לך?</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="הכנס/י שם..."
                  className="w-full px-5 py-4 rounded-2xl border-2 border-indigo-500/20 bg-slate-900/50 text-slate-50 text-lg font-semibold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase block pr-1">איך לפנות אליך?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGender("m")}
                  className={`py-4 rounded-2xl text-base font-bold transition-all border-2 ${
                    gender === "m" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-transparent border-slate-700 text-slate-500"
                  }`}
                >
                  לשון זכר
                </button>
                <button
                  onClick={() => setGender("f")}
                  className={`py-4 rounded-2xl text-base font-bold transition-all border-2 ${
                    gender === "f" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-transparent border-slate-700 text-slate-500"
                  }`}
                >
                  לשון נקבה
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="w-full py-5 rounded-2xl text-xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3"
            >
              <UserPlus size={22} />
              הרשמה והתחלה
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-700" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-800 px-2 text-slate-500">או</span></div>
          </div>

          <Button 
            onClick={onGoToAuth}
            variant="outline" 
            className="w-full py-6 rounded-2xl border-indigo-500/40 text-indigo-400 font-bold hover:bg-indigo-500/10"
          >
            <LogIn className="ml-2 h-5 w-5" />
            כניסה למשתמשים קיימים
          </Button>
          
          <p className="text-[10px] text-slate-500 text-center">ההרשמה הכרחית כדי להבטיח את פרטיותך ושמירת התקדמותך האישית במערכת.</p>
        </div>

        <footer className="text-center py-4 space-y-4">
          <div className="flex justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <LegalDialog type="terms" trigger={<button className="hover:text-white transition-colors">תנאי שימוש</button>} />
            <span className="opacity-30">|</span>
            <LegalDialog type="disclaimer" trigger={<button className="hover:text-white transition-colors">דיסקליימר</button>} />
            <span className="opacity-30">|</span>
            <LegalDialog type="accessibility" trigger={<button className="hover:text-white transition-colors">נגישות</button>} />
          </div>
          <p className="text-[10px] font-bold tracking-widest text-slate-300 uppercase opacity-80">
            © {currentYear} המצפן הרגשי • כל הזכויות שמורות ל<a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">עמיר אייל</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
