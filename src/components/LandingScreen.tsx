
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, Compass, Loader2 } from "lucide-react";
import { LegalDialog } from "@/components/LegalDialogs";
import { useAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc } from "firebase/firestore";

interface LandingScreenProps {
  onComplete: (name: string, gender: "m" | "f") => void;
  onGoToAuth: () => void;
  initialName?: string;
  initialGender?: "m" | "f";
}

export default function LandingScreen({ onComplete, onGoToAuth, initialName = "", initialGender = "m" }: LandingScreenProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const [name, setName] = useState(initialName);
  const [gender, setGender] = useState<"m" | "f">(initialGender);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // If the user already started filling details, sync them now
      if (firestore && user) {
        const docRef = doc(firestore, "userProfiles", user.uid);
        setDocumentNonBlocking(docRef, {
          id: user.uid,
          name: name.trim() || user.displayName || "",
          gender: gender,
          email: user.email,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.error("Google sign in failed", err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-slate-900 overflow-y-auto selection:bg-indigo-500 selection:text-white" dir="rtl">
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
                className="object-cover rounded-full"
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
            <Button 
              variant="outline" 
              className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white h-14 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-3"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              aria-label="התחברות מהירה עם גוגל"
            >
              {isGoogleLoading ? <Loader2 className="animate-spin" /> : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  המשך עם גוגל
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true"><span className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-600"><span className="bg-[#1a1f2e] px-4">או הרשמה ידנית</span></div>
            </div>

             <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="landing-name" className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase block pr-1">איך נקרא לך?</label>
                <input
                  id="landing-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="הכנס/י שם..."
                  className="w-full px-6 py-4 rounded-2xl border-2 border-white/10 bg-slate-900/50 text-slate-50 text-lg font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase block pr-1">איך לפנות אליך?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGender("m")}
                    className={`py-4 rounded-2xl text-base font-black transition-all border-2 ${
                      gender === "m" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-transparent border-white/10 text-slate-500 hover:bg-white/5"
                    }`}
                  >
                    לשון זכר
                  </button>
                  <button
                    onClick={() => setGender("f")}
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
                className="w-full py-5 rounded-[1.5rem] text-xl font-black bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3 transition-all hover:bg-indigo-700"
              >
                <UserPlus size={22} aria-hidden="true" />
                יצירת חשבון
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-center">
            <button 
              onClick={onGoToAuth}
              className="text-sm text-slate-400 hover:text-white transition-all font-bold flex items-center justify-center gap-2 mx-auto"
            >
              <LogIn size={16} aria-hidden="true" />
              כבר יש לך חשבון? התחברות
            </button>
          </div>
          
          <p className="text-[10px] text-slate-500 text-center font-bold">ההרשמה הכרחית כדי להבטיח את פרטיותך ושמירת התקדמותך האישית במערכת.</p>
        </div>

        <footer className="text-center py-8 space-y-4">
          <div className="flex justify-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <LegalDialog type="terms" trigger={<button className="hover:text-white transition-colors">תנאי שימוש</button>} />
            <span className="opacity-20">|</span>
            <LegalDialog type="disclaimer" trigger={<button className="hover:text-white transition-colors">דיסקליימר</button>} />
            <span className="opacity-20">|</span>
            <LegalDialog type="accessibility" trigger={<button className="hover:text-white transition-colors">נגישות</button>} />
          </div>
          <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
            © {currentYear} המצפן הרגשי • כל הזכויות שמורות ל<a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">עמיר אייל</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
