
"use client";

import { useState } from "react";
import { useAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

interface AuthScreenProps {
  onSuccess: () => void;
  onBack: () => void;
  localProfile?: { name: string, gender: "m" | "f" };
}

export default function AuthScreen({ onSuccess, onBack, localProfile }: AuthScreenProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const syncProfileOnAuth = (user: any) => {
    if (localProfile?.name && firestore) {
      const docRef = doc(firestore, "userProfiles", user.uid);
      setDocumentNonBlocking(docRef, {
        id: user.uid,
        name: localProfile.name,
        gender: localProfile.gender,
        email: user.email,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      if (userCredential.user) {
        syncProfileOnAuth(userCredential.user);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError("שגיאה בתהליך ההתחברות. וודא שהפרטים נכונים.");
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-slate-50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-black text-center">
            {isLogin ? "ברוכים השבים" : "הצטרפות למצפן"}
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            {isLogin ? "הכנס/י פרטים כדי להמשיך" : "צור/י חשבון כדי לשמור את ההתקדמות שלך"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="bg-slate-900 border-slate-700 pr-10 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                <Input 
                  id="password" 
                  type="password" 
                  className="bg-slate-900 border-slate-700 pr-10 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-rose-400 text-xs font-bold text-center">{error}</p>}
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-12"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "התחברות" : "הרשמה")}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-700" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-800 px-2 text-slate-500">או</span></div>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-slate-700 bg-transparent hover:bg-slate-700 text-slate-50 h-12"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            כניסה עם גוגל
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-sm text-indigo-400 hover:text-indigo-300 font-bold"
          >
            {isLogin ? "אין לך חשבון? הרשמה" : "כבר יש לך חשבון? התחברות"}
          </button>
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300"
          >
            <ArrowRight size={14} /> חזרה לדף הראשי
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
