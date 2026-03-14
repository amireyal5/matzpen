
"use client";

import { ArrowRight, ExternalLink, ShieldCheck, BrainCircuit, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface AboutScreenProps {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: AboutScreenProps) {
  const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center p-6 selection:bg-indigo-500 overflow-y-auto" dir="rtl">
      {/* Background Decor */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 py-12 space-y-12">
        {/* Header Navigation */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest hover:text-indigo-300 transition-colors"
        >
          <ArrowRight size={18} />
          <span>חזרה למסך הראשי</span>
        </button>

        {/* Profile Section */}
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-110" />
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[3rem] border-4 border-white/10 overflow-hidden shadow-2xl">
              <Image 
                src={PROFESSIONAL_PHOTO_URL} 
                alt="עמיר אייל" 
                fill 
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black font-headline leading-tight">
              אודות: פסיכותרפיה וחוסן בעידן הדיגיטלי
            </h1>
            <p className="text-lg md:text-xl text-indigo-300 font-bold leading-relaxed max-w-md mx-auto">
              שמי עמיר אייל, פסיכותרפיסט (MSW), מומחה CBT וטיפול גוף-נפש (SE).
            </p>
          </div>

          <div className="dark-glass-panel rounded-[2.5rem] p-8 text-right border-indigo-500/10">
            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
              עם למעלה מ-20 שנות ניסיון בליווי אנשים למציאת שקט וויסות פנימי, פיתחתי את "המצפן הרגשי" מתוך הרצון להנגיש <span className="text-white font-bold">כלי חוסן מעשיים</span> לכולם. זהו <span className="text-white font-bold">מרחב דיגיטלי בטוח</span> שנועד ללוות אתכם ברגעים שבין המפגשים או ככלי עצמאי לוויסות.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid gap-4">
          <div className="flex items-center gap-2 mb-2 pr-2">
            <div className="w-6 h-1 bg-indigo-500 rounded-full" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">מה תמצאו כאן?</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { 
                icon: ShieldCheck, 
                title: "ויסות בשפת הגוף", 
                desc: "תרגילים מבוססי SE לשחרור מתח ממערכת העצבים.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10"
              },
              { 
                icon: BrainCircuit, 
                title: "חיווט מחדש של המחשבה", 
                desc: "כלים מעשיים מעולם ה-CBT לשינוי דפוסי חשיבה מעכבים.",
                color: "text-amber-400",
                bg: "bg-amber-500/10"
              },
              { 
                icon: Zap, 
                title: "ביטחון בהישג יד", 
                desc: "טכנולוגיה שנועדה להעניק שליטה וחוסן בכל זמן ומכל מקום.",
                color: "text-indigo-400",
                bg: "bg-indigo-500/10"
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-5 p-6 rounded-[2rem] bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/80 transition-all group">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", item.bg)}>
                  <item.icon className={item.color} size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-50">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="text-center space-y-8 pt-8 border-t border-white/5">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">רוצים להכיר אותי ואת הגישה שלי לעומק?</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              אני מזמין אתכם לקרוא עוד על הניסיון המקצועי שלי, על שיטות הטיפול ועל הדרך שבה אני מלווה אנשים בתהליכי שינוי.
            </p>
          </div>

          <Button 
            asChild
            className="w-full py-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg transition-all shadow-xl shadow-indigo-600/10 active:scale-95"
          >
            <a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
              למידע נוסף באתר הבית של עמיר אייל
              <ExternalLink size={20} />
            </a>
          </Button>
        </div>

        {/* Footer Credit */}
        <footer className="text-center pt-8 pb-12">
          <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
            © {new Date().getFullYear()} המצפן הרגשי • פותח על ידי <a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">עמיר אייל</a>
          </p>
        </footer>
      </div>
    </div>
  );
}

// Utility function for isolation
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
