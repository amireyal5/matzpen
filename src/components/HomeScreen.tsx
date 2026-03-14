
"use client";

import { useState, useEffect } from "react";
import { CATS, BANK } from "@/lib/data";
import { Compass, Search, Sparkles, Heart, CheckCircle2, X } from "lucide-react";
import { getRecommendation, RecommendationOutput } from "@/ai/flows/recommendation-flow";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import Image from "next/image";

interface HomeScreenProps {
  name: string;
  gender: "m" | "f";
  onSelectCategory: (key: string) => void;
  onBack: () => void;
}

export default function HomeScreen({ name, gender, onSelectCategory, onBack }: HomeScreenProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationOutput | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  
  const { user } = useUser();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    // Load favorites and completed from localStorage
    const savedFavs = localStorage.getItem("compass_favorites");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    
    const savedCompleted = localStorage.getItem("compass_completed");
    if (savedCompleted) setCompletedCards(JSON.parse(savedCompleted));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setRecommendation(null);
    try {
      const res = await getRecommendation({ feeling: searchQuery });
      setRecommendation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearRecommendation = () => {
    setRecommendation(null);
    setSearchQuery("");
  };

  const welcomeText = "שלום, ";
  const actionText = gender === "f" ? "על מה תרצי לעבוד?" : "מה תרצה לעבוד עליו?";
  const placeholderText = gender === "f" ? "איך את מרגישה כרגע?" : "איך אתה מרגיש כרגע?";
  const favTitle = "מועדפים ששמרת";
  const cardsText = "כרטיסיות";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-xl mx-auto space-y-8 py-4 animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 tracking-wider">{welcomeText}{name} 🌿</p>
            <h2 className="text-3xl font-headline font-black text-slate-900 leading-tight">{actionText}</h2>
            <p className="text-xs text-slate-400 font-medium">{CATS.length} קטגוריות • {Object.values(BANK).flat().length} כרטיסיות חוסן</p>
          </div>
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors overflow-hidden"
          >
            {user?.photoURL ? (
              <Image 
                src={user.photoURL} 
                alt={name} 
                width={48} 
                height={48} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Compass size={20} />
            )}
          </button>
        </div>

        {/* AI Search Section */}
        <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 border border-indigo-100 shadow-xl shadow-indigo-500/5">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholderText}
              className="w-full bg-white px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none transition-all pr-12 font-medium"
            />
            <button 
              type="submit"
              disabled={isSearching}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSearching ? <Sparkles className="animate-spin" size={18} /> : <Search size={18} />}
            </button>
          </form>

          {recommendation && (
            <div className="mt-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300 relative">
              <button onClick={clearRecommendation} className="absolute top-2 left-2 text-indigo-300 hover:text-indigo-600">
                <X size={16} />
              </button>
              <p className="text-sm font-bold text-indigo-900 mb-2">המלצת המצפן 🧭</p>
              <p className="text-sm text-indigo-700 leading-relaxed mb-4">{recommendation.explanation}</p>
              <button 
                onClick={() => onSelectCategory(recommendation.categoryKey)}
                className="w-full py-3 bg-white border-2 border-indigo-200 rounded-xl text-indigo-600 font-black text-sm hover:bg-indigo-100 transition-all"
              >
                {gender === 'f' ? 'לכי' : 'לך'} לעמוד {CATS.find(c => c.key === recommendation.categoryKey)?.label}
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats / Favorites (If any) */}
        {favorites.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 tracking-[0.2em] uppercase pr-2">{favTitle}</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {favorites.map((fav, i) => {
                const [catKey] = fav.split(":");
                const cat = CATS.find(c => c.key === catKey);
                if (!cat) return null;
                return (
                  <button 
                    key={i}
                    onClick={() => onSelectCategory(catKey)}
                    className="flex-shrink-0 px-5 py-3 rounded-full bg-white border border-slate-100 shadow-sm flex items-center gap-2 hover:border-indigo-200 transition-all"
                  >
                    <Heart size={14} className="text-rose-500 fill-rose-500" />
                    <span className="text-xs font-bold text-slate-700">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-4">
          {CATS.map((c) => {
            const Icon = c.icon;
            const count = (BANK[c.key] || []).length;
            const completedCount = completedCards.filter(id => id.startsWith(c.key)).length;
            const isFullyCompleted = completedCount === count;

            return (
              <button
                key={c.key}
                onClick={() => onSelectCategory(c.key)}
                className="group relative flex flex-col gap-3 p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 text-right overflow-hidden active:scale-95"
                style={{ backgroundColor: c.light }}
              >
                <div 
                  className="absolute -top-4 -left-4 w-20 h-20 rounded-full opacity-10 pointer-events-none" 
                  style={{ backgroundColor: c.hue }}
                />
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300" 
                  style={{ backgroundColor: `${c.hue}15` }}
                >
                  <Icon size={20} style={{ color: c.hue }} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-lg font-bold tracking-tight" style={{ color: c.hue }}>{c.label}</h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{c.tagLine}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                   <div 
                    className="inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${c.hue}15`, color: c.hue }}
                  >
                    {count} {cardsText}
                  </div>
                  {completedCount > 0 && (
                    <div className={cn("flex items-center gap-1", isFullyCompleted ? "text-emerald-600" : "text-slate-400")}>
                      <CheckCircle2 size={12} />
                      <span className="text-[9px] font-bold">{completedCount}/{count}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <footer className="text-center py-8 opacity-80">
          <p className="text-[10px] font-bold tracking-widest text-slate-900 uppercase">
            © {currentYear} המצפן הרגשי • כל הזכויות שמורות ל<a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600 transition-colors">עמיר אייל</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
