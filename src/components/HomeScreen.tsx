"use client";

import { useState, useEffect } from "react";
import { CATS, BANK } from "@/lib/data";
import { Compass, Sparkles, User as UserIcon, Anchor, BookText, Flower2, Zap, ArrowLeft, ChevronLeft, Phone, AlertTriangle, UserPlus } from "lucide-react";
import { getRecommendation, RecommendationOutput } from "@/ai/flows/recommendation-flow";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { doc } from "firebase/firestore";
import { LegalDialog } from "@/components/LegalDialogs";
import ProfileDialog from "@/components/ProfileDialog";
import CategoryCard from "@/components/CategoryCard";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HomeScreenProps {
  name: string;
  gender: "m" | "f";
  onSelectCategory: (key: string) => void;
  onStartGuided: (catKey: string, practiceIdx: number) => void;
  onGoToJournal: () => void;
  onGoToMeditation: () => void;
  onGoToBilateral: () => void;
  onBack: () => void;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

export default function HomeScreen({ 
  name: initialName, 
  gender: initialGender, 
  onSelectCategory, 
  onStartGuided, 
  onGoToJournal, 
  onGoToMeditation, 
  onGoToBilateral,
  onBack 
}: HomeScreenProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationOutput | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const { user } = useUser();
  const firestore = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "userProfiles", user.uid);
  }, [user, firestore]);

  const { data: profileData } = useDoc(profileRef);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const favorites = profileData?.favorites || [];
  const completedCards = profileData?.completed || [];
  const displayName = profileData?.name || initialName;
  const displayGender = (profileData?.gender || initialGender) as "m" | "f";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setRecommendation(null);
    try {
      const res = await getRecommendation({ feeling: searchQuery, gender: displayGender });
      setRecommendation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const CrisisSupport = () => (
    <div className="mt-6 p-8 bg-rose-50 rounded-[2.5rem] border-2 border-rose-200 shadow-xl animate-in fade-in zoom-in duration-500 space-y-8" dir="rtl">
      <div className="flex items-center gap-4 text-rose-600">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
          <AlertTriangle size={28} />
        </div>
        <h3 className="text-xl font-black">סיוע ותמיכה מיידית</h3>
      </div>
      
      <p className="text-slate-800 leading-relaxed font-bold text-lg">
        {recommendation?.explanation}
      </p>

      <div className="grid gap-4">
        <a href="tel:1201" className="flex items-center justify-between p-5 bg-white border border-rose-200 rounded-2xl hover:bg-rose-100 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone size={20} />
            </div>
            <div>
              <span className="block font-black text-rose-700">ער"ן - עזרה ראשונה נפשית</span>
              <span className="block text-xs text-slate-500">חיוג חינם ומיידי: 1201</span>
            </div>
          </div>
          <ChevronLeft size={20} className="text-rose-300" />
        </a>

        <a href="tel:101" className="flex items-center justify-between p-5 bg-white border border-rose-200 rounded-2xl hover:bg-rose-100 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone size={20} />
            </div>
            <div>
              <span className="block font-black text-emerald-700">מד"א - מצבי חירום רפואיים</span>
              <span className="block text-xs text-slate-500">חיוג חירום: 101</span>
            </div>
          </div>
          <ChevronLeft size={20} className="text-rose-300" />
        </a>

        <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
          <UserPlus className="text-indigo-500 shrink-0" size={24} />
          <p className="text-sm font-bold text-indigo-900 leading-relaxed">
            {displayGender === "f" 
              ? "בבקשה, פני עכשיו לחבר קרוב, בן משפחה או אדם שאת סומכת עליו. אל תישארי לבד עם התחושות האלה."
              : "בבקשה, פנה עכשיו לחבר קרוב, בן משפחה או אדם שאתה סומך עליו. אל תישאר לבד עם התחושות האלה."
            }
          </p>
        </div>
      </div>

      <button 
        onClick={() => setRecommendation(null)}
        className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
      >
        סגור וחזור לכלים הרגילים
      </button>
    </div>
  );

  const welcomeText = displayGender === "f" ? `במה נתרכז היום, ${displayName}?` : `במה נתמקד היום, ${displayName}?`;
  const subActionText = displayGender === "f" ? "בחרי תחום כדי להתחיל בתרגול" : "בחר תחום כדי להתחיל בתרגול";
  const placeholderText = displayGender === "f" ? "ספרי לי מה עובר עלייך..." : "ספר לי מה עובר עליך...";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-slate-950 text-white pt-10 pb-16 px-6 relative z-10 overflow-hidden transition-all duration-1000 ease-in-out">
        <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-6">
          <div className="w-full flex justify-between items-center mb-4">
             <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1.5">
                <Logo variant="icon" />
              </div>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">המצפן הרגשי</p>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setIsProfileOpen(true)} className="w-10 h-10 rounded-full border-2 border-white/10 hover:border-indigo-500 transition-all overflow-hidden relative">
                  {user?.photoURL ? (
                    <Image src={user.photoURL} alt="פרופיל" width={40} height={40} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <UserIcon size={16} />
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>פרופיל אישי</TooltipContent>
            </Tooltip>
          </div>

          <div className={cn(
            "w-full flex justify-center items-center relative transition-all duration-1000 ease-in-out overflow-hidden",
            isMinimized ? "h-0 opacity-0 mb-0" : "h-24 opacity-100 mb-4"
          )}>
            <div className={cn(
              "absolute z-30 transition-welcome-photo",
              isMinimized 
                ? "translate-y-[148px] translate-x-[240px] scale-[0.4] opacity-0 pointer-events-none" 
                : "translate-y-0 translate-x-0 scale-100 opacity-100"
            )}>
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 animate-pulse-soft" />
                <div className="relative w-24 h-24">
                  <div className="w-full h-full rounded-full border-4 border-white/20 shadow-2xl overflow-hidden relative">
                    <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
                  </div>
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-lg z-40" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-black text-white tracking-tight leading-tight">{welcomeText}</h2>
            <p className="text-sm font-medium text-white/50">{subActionText}</p>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 -mt-12 relative z-20">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-25"></div>
          <div className="relative glass-panel rounded-[2rem] p-2 flex items-center diffused-shadow overflow-hidden">
            <div className={cn(
              "flex-shrink-0 transition-all duration-1000 ease-out overflow-hidden ml-2",
              isMinimized ? "w-10 h-10 opacity-100" : "w-0 opacity-0"
            )}>
              <div className="relative w-10 h-10">
                <div className="w-full h-full rounded-full border-2 border-indigo-500 shadow-lg overflow-hidden relative">
                  <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border border-slate-950 rounded-full shadow-lg z-40" />
              </div>
            </div>

            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder={placeholderText} className="flex-1 bg-transparent px-4 py-5 focus:outline-none font-medium text-slate-900 placeholder:text-slate-400 text-sm"
            />
            <button type="submit" disabled={isSearching} className="w-14 h-14 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50">
              {isSearching ? <Sparkles className="animate-spin" size={24} /> : <Sparkles size={24} />}
            </button>
          </div>
        </form>

        {recommendation && recommendation.isCrisis ? (
          <CrisisSupport />
        ) : recommendation && (
          <div className="mt-6 p-8 bg-white rounded-[2.5rem] border border-indigo-100 diffused-shadow animate-in fade-in slide-in-from-top-4 duration-500 space-y-8" dir="rtl">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Sparkles size={16} />
                </div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">הכוונה מותאמת</span>
              </div>
              <p className="text-lg text-slate-800 leading-relaxed font-bold border-r-4 border-indigo-500 pr-5">
                {recommendation.explanation}
              </p>
            </div>

            <div className="grid gap-3">
              {recommendation.options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    if (opt.categoryKey === "JOURNAL") onGoToJournal();
                    else if (opt.categoryKey === "MEDITATION") onGoToMeditation();
                    else if (opt.categoryKey === "BILATERAL") onGoToBilateral();
                    else if (opt.practiceIndex !== undefined) onStartGuided(opt.categoryKey, opt.practiceIndex);
                    else onSelectCategory(opt.categoryKey);
                  }}
                  className="group w-full p-5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-[1.5rem] transition-all text-right flex items-center justify-between active:scale-[0.98]"
                >
                  <div className="space-y-1">
                    <span className="block font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{opt.label}</span>
                    <span className="block text-xs text-slate-500 font-medium">{opt.description}</span>
                  </div>
                  <ChevronLeft className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={18} />
                </button>
              ))}
            </div>

            <button 
              onClick={() => setRecommendation(null)}
              className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              סגור הכוונה וחזור לספריית הכלים
            </button>
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto px-6 mt-12 space-y-12 pb-20">
        
        {/* Strategic Tools Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Sparkles size={14} className="text-indigo-600" />
            <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">כלים אסטרטגיים</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={onGoToJournal}
              className="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center gap-2 active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <BookText size={20} />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[11px] font-black text-slate-900">יומן מחשבות</span>
                <span className="block text-[8px] text-slate-400 font-bold">CBT</span>
              </div>
            </button>
            <button 
              onClick={onGoToBilateral}
              className="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center gap-2 active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Zap size={20} className="fill-current" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[11px] font-black text-slate-900">עיבוד בילטרלי</span>
                <span className="block text-[8px] text-slate-400 font-bold">EMDR Style</span>
              </div>
            </button>
            <button 
              onClick={onGoToMeditation}
              className="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center gap-2 active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Flower2 size={20} />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[11px] font-black text-slate-900">מדיטציה</span>
                <span className="block text-[8px] text-slate-400 font-bold">שקט פנימי</span>
              </div>
            </button>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-700">
            <div className="flex items-center gap-2 px-2">
              <Anchor size={14} className="text-rose-500" />
              <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">העוגנים שלי</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
              {favorites.map((fav: string, i: number) => {
                const [catKey] = fav.split(":");
                const cat = CATS.find(c => c.key === catKey);
                if (!cat) return null;
                return (
                  <button key={i} onClick={() => onSelectCategory(catKey)} className="flex-shrink-0 px-8 py-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center gap-4 active:scale-95 snap-start">
                    <cat.icon size={18} style={{ color: cat.hue }} />
                    <span className="block text-sm font-black text-slate-900">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Compass size={14} className="text-indigo-600" />
            <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">ספריית הכלים</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {CATS.map((c) => (
              <CategoryCard 
                key={c.key} 
                category={c} 
                count={(BANK[c.key] || []).length} 
                completedCount={completedCards.filter(id => id.startsWith(`${c.key}:`)).length}
                onClick={onSelectCategory}
              />
            ))}
          </div>
        </div>

        <footer className="text-center py-16 border-t border-slate-100 space-y-6">
          <div className="flex justify-center gap-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <LegalDialog type="terms" trigger={<button className="hover:text-indigo-600 transition-colors">תנאי שימוש</button>} />
            <LegalDialog type="disclaimer" trigger={<button className="hover:text-indigo-600 transition-colors">הבהרה משפטית</button>} />
            <LegalDialog type="accessibility" trigger={<button className="hover:text-indigo-600 transition-colors">נגישות</button>} />
          </div>
          <p className="text-[10px] font-bold tracking-widest text-slate-900 uppercase opacity-50">
            © {currentYear} המצפן הרגשי • כל הזכויות שמורות ל<a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100 transition-opacity">עמיר אייל</a>
          </p>
        </footer>
      </div>

      <ProfileDialog 
        isOpen={isProfileOpen} 
        onOpenChange={setIsProfileOpen} 
        profileData={profileData} 
        profileRef={profileRef}
      />
    </div>
  );
}
