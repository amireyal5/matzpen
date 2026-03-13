"use client";

import { useState, useEffect } from "react";
import { Compass } from "lucide-react";

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_50%,#0F172A_100%)]">
      <div className="absolute top-[10%] right-[10%] w-48 h-48 rounded-full border border-indigo-500/10 pointer-events-none" />
      <div className="absolute bottom-[15%] left-[5%] w-72 h-72 rounded-full border border-indigo-500/5 pointer-events-none" />

      <div className="w-full max-sm relative z-10 flex flex-col gap-8 animate-fade-in-up">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_20px_60px_rgba(99,102,241,0.4)]">
            <Compass size={36} className="text-white" />
          </div>
          <div>
            <h1 className="font-headline text-4xl font-black text-slate-50 tracking-tight leading-none">המצפן הרגשי 🧭</h1>
            <p className="text-slate-400 text-sm mt-2 tracking-wide font-medium">ארגז הכלים לחוסן ושקט נפשי</p>
          </div>
          <div className="flex gap-3 mt-2">
            {["CBT", "ACT", "EMDR", "Mindfulness"].map((t) => (
              <span
                key={t}
                className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-xl rounded-[2rem] p-8 border border-indigo-500/20 shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase block">שמך</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="איך נקרא לך?..."
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-indigo-500/20 bg-slate-900/50 text-slate-50 text-lg font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase block">פנייה</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGender("m")}
                  className={`py-3.5 rounded-2xl text-base font-bold transition-all border-2 ${
                    gender === "m"
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-transparent border-slate-700 text-slate-500 hover:border-indigo-500/40"
                  }`}
                >
                  זכר
                </button>
                <button
                  onClick={() => setGender("f")}
                  className={`py-3.5 rounded-2xl text-base font-bold transition-all border-2 ${
                    gender === "f"
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-transparent border-slate-700 text-slate-500 hover:border-indigo-500/40"
                  }`}
                >
                  נקבה
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className={`w-full py-4 rounded-2xl text-lg font-black transition-all shadow-xl ${
                name.trim()
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/30 active:scale-[0.98]"
                  : "bg-indigo-500/20 text-indigo-300/30 cursor-not-allowed"
              }`}
            >
              להפעיל את המצפן
            </button>
          </div>
        </div>

        <footer className="text-center py-4 opacity-80">
          <p className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">
            © {currentYear} המצפן הרגשי • כל הזכויות עמיר אייל
          </p>
        </footer>
      </div>
    </div>
  );
}
