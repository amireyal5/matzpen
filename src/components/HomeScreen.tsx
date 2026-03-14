"use client";

import { useState, useEffect } from "react";
import { CATS, BANK } from "@/lib/data";
import { Compass, Sparkles, User as UserIcon, Anchor } from "lucide-react";
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

interface HomeScreenProps {
  name: string;
  gender: "m" | "f";
  onSelectCategory: (key: string) => void;
  onBack: () => void;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

export default function HomeScreen({ name: initialName, gender: initialGender, onSelectCategory, onBack }: HomeScreenProps) {
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
    
    // Welcome animation timer: shrink and move photo after 5 seconds
    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const favorites = profileData?.favorites || [];
  const completedCards = profileData?.completed || [];
  const displayName = profileData?.name || initialName;
  const displayGender = profileData?.gender || initialGender;

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

  const welcomeText = displayGender === "f" ? `במה נתרכז היום, ${displayName}?` : `במה נתמקד היום, ${displayName}?`;
  const subActionText = displayGender === "f" ? "בחרי תחום כדי להתחיל בתרגול" : "בחר תחום כדי להתחיל בתרגול";
  const placeholderText = displayGender === "f" ? "ספרי לי מה עובר עלייך..." : "ספר לי מה עובר עליך...";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-slate-950 text-white pt-10 pb-20 px-6 relative z-10 overflow-hidden">
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

          {/* Placeholder to maintain header height during animation */}
          <div className="h-24 w-full flex justify-center items-center relative">
            <div className={cn(
              "absolute z-30 transition-welcome-photo",
              isMinimized 
                ? "translate-y-[148px] translate-x-[240px] scale-[0.4] opacity-0 pointer-events-none" 
                : "translate-y-0 translate-x-0 scale-100 opacity-100"
            )}>
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 animate-pulse-soft" />
                <div className="relative w-24 h-24 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden">
                  <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-lg" />
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
            
            {/* The minimized photo that appears inside the search bar */}
            <div className={cn(
              "flex-shrink-0 transition-all duration-1000 ease-out overflow-hidden ml-2",
              isMinimized ? "w-10 h-10 opacity-100" : "w-0 opacity-0"
            )}>
              <div className="relative w-10 h-10 rounded-full border-2 border-indigo-500 shadow-lg overflow-hidden">
                <Image src={PROFESSIONAL_PHOTO_URL} alt="עמיר אייל" fill className="object-cover" />
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

        {recommendation && (
          <div className="mt-6 p-8 bg-white rounded-[2rem] border border-indigo-100 diffused-shadow animate-in fade-in slide-in-from-top-4 duration-500">
            <p className="text-base text-slate-700 leading-relaxed mb-6 font-medium border-r-4 border-indigo-500 pr-5">{recommendation.explanation}</p>
            <button 
              onClick={() => onSelectCategory(recommendation.categoryKey)}
              className="w-full py-5 bg-indigo-600 rounded-2xl text-white font-black text-sm"
            >
              בוא {displayGender === 'f' ? 'נצלול' : 'נצלול'} ל{CATS.find(c => c.key === recommendation.categoryKey)?.label}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto px-6 mt-12 space-y-12 pb-20">
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
            <LegalDialog type="disclaimer" trigger={<button className="hover:text-indigo-600 transition-colors">דיסקליימר</button>} />
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
