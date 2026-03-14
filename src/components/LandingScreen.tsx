"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface LandingScreenProps {
  onComplete: (name: string, gender: "m" | "f") => void;
}

export default function LandingScreen({ onComplete }: LandingScreenProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"m" | "f">("m");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleSubmit = () => {
    if (name.trim()) {
      onComplete(name.trim(), gender);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_50%,#0F172A_100%)] overflow-y-auto">
      {/* Decorative background elements */}
      <div className="fixed top-[10%] right-[10%] w-48 h-48 rounded-full border border-indigo-500/10 pointer-events-none" />
      <div className="fixed bottom-[15%] left-[5%] w-72 h-72 rounded-full border border-indigo-500/5 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col gap-8 py-12 animate-fade-in-up">
        
        {/* Therapist Welcome Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative w-28 h-28 rounded-full border-4 border-indigo-500/30 overflow-hidden shadow-2xl">
            <Image 
              src="https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg"
              alt="עמיר אייל"
              fill
              className="object-cover"
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

        {/* Onboarding Form */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-indigo-500/20 shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase block pr-1">איך נקרא לך?</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="הכנס/י שם..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-indigo-500/20 bg-slate-900/50 text-slate-50 text-lg font-semibold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase block pr-1">איך לפנות אליך?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGender("m")}
                  className={`py-4 rounded-2xl text-base font-bold transition-all border-2 ${
                    gender === "m"
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-transparent border-slate-700 text-slate-500 hover:border-indigo-500/40"
                  }`}
                >
                  לשון זכר
                </button>
                <button
                  onClick={() => setGender("f")}
                  className={`py-4 rounded-2xl text-base font-bold transition-all border-2 ${
                    gender === "f"
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-transparent border-slate-700 text-slate-500 hover:border-indigo-500/40"
                  }`}
                >
                  לשון נקבה
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className={`w-full py-5 rounded-2xl text-xl font-black transition-all shadow-xl ${
                name.trim()
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/30 active:scale-[0.98] hover:brightness-110"
                  : "bg-indigo-500/20 text-indigo-300/30 cursor-not-allowed"
              }`}
            >
              להפעיל את המצפן
            </button>
          </div>
        </div>

        <footer className="text-center py-4 opacity-80">
          <p className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">
            © {currentYear} המצפן הרגשי • כל הזכויות <a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">עמיר אייל</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
