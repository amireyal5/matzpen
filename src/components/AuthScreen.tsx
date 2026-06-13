
"use client";

import { useState } from "react";
import { useAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2, User as UserIcon, Check, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AuthScreenProps {
  onSuccess: () => void;
  onBack: () => void;
  localProfile?: { name: string, gender: "m" | "f" };
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

export default function AuthScreen({ onSuccess, onBack, localProfile, theme = "light", toggleTheme }: AuthScreenProps) {
  const isLight = theme === "light";
  const auth = useAuth();
  const firestore = useFirestore();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(localProfile?.name || "");
  const [gender, setGender] = useState<"m" | "f">(localProfile?.gender || "m");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const syncProfileOnAuth = (user: any, customName?: string, customGender?: string) => {
    if (firestore) {
      const docRef = doc(firestore, "userProfiles", user.uid);
      setDocumentNonBlocking(docRef, {
        id: user.uid,
        name: customName || name || user.displayName || "משתמש",
        gender: customGender || gender,
        email: user.email,
        createdAt: new Date().toISOString(),
        favorites: [],
        completed: []
      }, { merge: true });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (mode === "login") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (!user.emailVerified) {
          setError("נא אמתו את חשבונכם באמצעות הקישור שנשלח לאימייל לפני הכניסה.");
          await signOut(auth);
          setLoading(false);
          return;
        }
        
        onSuccess();
      } else if (mode === "signup") {
        if (!name.trim()) {
          setError("נא להזין שם כדי להמשיך.");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await sendEmailVerification(user);
        syncProfileOnAuth(user);
        setVerificationSent(true);
      } else if (mode === "forgot") {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg("קישור לאיפוס סיסמה נשלח לאימייל שלך.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("כתובת האימייל הזו כבר רשומה במערכת.");
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("אימייל או סיסמה לא נכונים.");
      } else if (err.code === 'auth/weak-password') {
        setError("הסיסמה חלשה מדי. השתמש/י בלפחות 6 תווים.");
      } else {
        setError("שגיאה בתהליך. וודא שהפרטים נכונים.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      if (userCredential.user) {
        syncProfileOnAuth(userCredential.user);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("שגיאה בהתחברות עם גוגל");
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-6 text-right transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100" : "bg-slate-950")} dir="rtl">
        <Card className={cn("w-full max-w-md p-8 text-center space-y-6 rounded-[2.5rem]", isLight ? "bg-white border-slate-200 text-slate-900 shadow-xl" : "bg-slate-900 border-slate-800 text-slate-50")}>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={40} />
            </div>
          </div>
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-black">אימייל אימות נשלח!</CardTitle>
            <CardDescription className={cn("pt-2 leading-relaxed", isLight ? "text-slate-500" : "text-slate-400")}>
              שלחנו קישור אימות לכתובת: <br/> <strong className={isLight ? "text-indigo-600" : "text-indigo-400"}>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("p-0 text-sm leading-relaxed", isLight ? "text-slate-600" : "text-slate-300")}>
            אנא לחצו על הקישור באימייל שלכם כדי להפעיל את החשבון. לאחר מכן תוכלו לחזור לכאן ולהתחבר.
          </CardContent>
          <CardFooter className="p-0 flex flex-col gap-4">
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-12 rounded-2xl"
              onClick={() => {
                setVerificationSent(false);
                setMode("login");
              }}
            >
              חזרה להתחברות
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-6 text-right selection:bg-indigo-500 selection:text-white transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100" : "bg-slate-950")} dir="rtl">
      {toggleTheme && (
        <div className="fixed top-6 left-6 z-20">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className={cn(
                  "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95",
                  isLight ? "bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                )}
                aria-label={isLight ? "מעבר לתצוגה כהה" : "מעבר לתצוגה בהירה"}
              >
                {isLight ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{isLight ? "תצוגה כהה" : "תצוגה בהירה"}</TooltipContent>
          </Tooltip>
        </div>
      )}
      <Card className={cn("w-full max-w-md lg:max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border-indigo-500/5", isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-slate-50")}>
        <CardHeader className="space-y-4 pt-12 pb-6 flex flex-col items-center">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden mb-2 p-2", isLight ? "bg-slate-100 border border-slate-200" : "bg-white/5")}>
            <Logo variant="icon" />
          </div>
          <div className="space-y-1 text-center">
            <CardTitle className="text-3xl font-black">
              {mode === "login" ? "ברוכים השבים" : mode === "signup" ? "הצטרפות למצפן" : "שחזור סיסמה"}
            </CardTitle>
            <CardDescription className={cn("font-medium text-sm", isLight ? "text-slate-500" : "text-slate-400")}>
              {mode === "login" ? "הכנס/י פרטים כדי להמשיך" : mode === "signup" ? "צרו חשבון כדי לשמור את ההתקדמות שלכם" : "נשלח לך קישור לאיפוס הסיסמה"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-8">
          <form onSubmit={handleAuth} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <Label htmlFor="name" className="block pr-1 text-[10px] font-black uppercase tracking-widest text-slate-500">איך נקרא לך?</Label>
                  <div className="relative">
                    <UserIcon className="absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="name"
                      placeholder="שם מלא..."
                      className={cn("pr-10 h-12 rounded-xl focus:border-indigo-500/50 transition-colors", isLight ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400" : "bg-slate-950 border-slate-800 text-white placeholder:text-slate-500")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={mode === "signup"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="block pr-1 text-[10px] font-black uppercase tracking-widest text-slate-500">לשון פנייה</Label>
                  <RadioGroup value={gender} onValueChange={(val) => setGender(val as "m" | "f")} className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <RadioGroupItem value="m" id="m-male" className="sr-only" />
                      <Label htmlFor="m-male" className={cn(
                        "flex items-center justify-center h-12 rounded-xl border-2 transition-all cursor-pointer font-bold text-sm",
                        gender === "m"
                          ? (isLight ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-600/5" : "border-indigo-600 bg-indigo-600/10 text-white shadow-lg shadow-indigo-600/5")
                          : (isLight ? "border-slate-200 text-slate-500 hover:bg-slate-50" : "border-slate-800 text-slate-500 hover:bg-slate-800/50")
                      )}>
                        זכר {gender === "m" && <Check size={14} className="mr-2" />}
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem value="f" id="f-female" className="sr-only" />
                      <Label htmlFor="f-female" className={cn(
                        "flex items-center justify-center h-12 rounded-xl border-2 transition-all cursor-pointer font-bold text-sm",
                        gender === "f"
                          ? (isLight ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-600/5" : "border-indigo-600 bg-indigo-600/10 text-white shadow-lg shadow-indigo-600/5")
                          : (isLight ? "border-slate-200 text-slate-500 hover:bg-slate-50" : "border-slate-800 text-slate-500 hover:bg-slate-800/50")
                      )}>
                        נקבה {gender === "f" && <Check size={14} className="mr-2" />}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="block pr-1 text-[10px] font-black uppercase tracking-widest text-slate-500">אימייל</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={cn("pr-10 h-12 rounded-xl focus:border-indigo-500/50 transition-colors", isLight ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400" : "bg-slate-950 border-slate-800 text-white placeholder:text-slate-500")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center pr-1">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">סיסמה</Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className={cn("text-[10px] font-bold transition-colors", isLight ? "text-indigo-600 hover:text-indigo-700" : "text-indigo-400 hover:text-indigo-300")}
                    >
                      שכחתי סיסמה
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="לפחות 6 תווים..."
                    className={cn("pr-10 h-12 rounded-xl focus:border-indigo-500/50 transition-colors", isLight ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400" : "bg-slate-950 border-slate-800 text-white placeholder:text-slate-500")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center leading-relaxed">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center leading-relaxed">
                {successMsg}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 font-black h-14 rounded-2xl text-lg shadow-xl shadow-indigo-500/10 transition-all active:scale-95 mt-4"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : (mode === "login" ? "התחברות" : mode === "signup" ? "הרשמה ואימות" : "שליחת קישור איפוס")}
            </Button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className={cn("w-full border-t", isLight ? "border-slate-200" : "border-slate-800")} /></div>
                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.2em]"><span className={cn("px-4 text-slate-500", isLight ? "bg-white" : "bg-slate-900")}>או דרך</span></div>
              </div>

              <Button
                variant="outline"
                className={cn("w-full bg-transparent h-14 rounded-2xl font-bold transition-all active:scale-95", isLight ? "border-slate-200 hover:bg-slate-50 text-slate-900" : "border-slate-800 hover:bg-slate-800/50 hover:text-slate-50 text-slate-50")}
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="ml-3 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                כניסה מהירה עם Google
              </Button>
            </>
          )}
        </CardContent>
        <CardFooter className={cn("flex flex-col gap-6 border-t mt-6 pt-8 pb-10", isLight ? "border-slate-200 bg-slate-50/50" : "border-slate-800 bg-slate-950/20")}>
          {mode === "forgot" ? (
            <button
              onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
              className={cn("text-sm font-black transition-colors", isLight ? "text-indigo-600 hover:text-indigo-700" : "text-indigo-400 hover:text-indigo-300")}
            >
              חזרה להתחברות
            </button>
          ) : (
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccessMsg(""); }}
              className={cn("text-sm font-black transition-colors", isLight ? "text-indigo-600 hover:text-indigo-700" : "text-indigo-400 hover:text-indigo-300")}
            >
              {mode === "login" ? "אין לך חשבון? הרשמה למצפן" : "כבר יש לך חשבון? חזרה להתחברות"}
            </button>
          )}
          <button
            onClick={onBack}
            className={cn("flex items-center gap-2 text-xs transition-colors font-bold tracking-wide", isLight ? "text-slate-400 hover:text-slate-700" : "text-slate-500 hover:text-slate-300")}
          >
            <ArrowRight size={14} /> חזרה לדף הראשי
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
