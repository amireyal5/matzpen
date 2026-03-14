
"use client";

import { useState, useEffect } from "react";
import { CATS, BANK } from "@/lib/data";
import { Compass, Search, Sparkles, Heart, CheckCircle2, X, LogOut, User as UserIcon, Check, Anchor } from "lucide-react";
import { getRecommendation, RecommendationOutput } from "@/ai/flows/recommendation-flow";
import { cn } from "@/lib/utils";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { LegalDialog } from "@/components/LegalDialogs";

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
  
  const [editName, setEditName] = useState(initialName);
  const [editGender, setEditGender] = useState<"m" | "f">(initialGender);
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "userProfiles", user.uid);
  }, [user, firestore]);

  const { data: profileData } = useDoc(profileRef);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (isProfileOpen && profileData) {
      setEditName(profileData.name || "");
      setEditGender(profileData.gender || "m");
    }
  }, [isProfileOpen, profileData]);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSaveProfile = () => {
    if (!profileRef) return;
    setIsSaving(true);
    updateDocumentNonBlocking(profileRef, {
      name: editName,
      gender: editGender
    });
    setTimeout(() => {
      setIsSaving(false);
      setIsProfileOpen(false);
    }, 500);
  };

  const favorites = profileData?.favorites || [];
  const completedCards = profileData?.completed || [];

  const displayName = profileData?.name || initialName;
  const displayGender = profileData?.gender || initialGender;

  const welcomeText = "שלום, ";
  const actionText = displayGender === "f" ? "על מה תרצי לעבוד?" : "מה תרצה לעבוד עליו?";
  const placeholderText = displayGender === "f" ? "איך את מרגישה כרגע?" : "איך אתה מרגיש כרגע?";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header: Straight edge, no overlap */}
      <header className="bg-slate-900 text-white pt-8 pb-10 px-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="max-w-xl mx-auto flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Compass size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-black tracking-tight">המצפן הרגשי</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">ארגז הכלים לחוסן</p>
            </div>
          </div>

          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button
                    aria-label="פתח פרופיל אישי"
                    className="w-12 h-12 rounded-full border-2 border-white/20 hover:border-indigo-500 transition-all overflow-hidden relative group"
                  >
                    {user?.photoURL ? (
                      <Image 
                        src={user.photoURL} 
                        alt={`תמונת הפרופיל של ${displayName}`} 
                        width={48} 
                        height={48} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <UserIcon size={20} aria-hidden="true" />
                      </div>
                    )}
                  </button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>פרופיל אישי</TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white" dir="rtl">
              <DialogHeader className="sr-only">
                <DialogTitle>פרופיל אישי</DialogTitle>
                <DialogDescription>עריכת פרטים וניהול החשבון שלך</DialogDescription>
              </DialogHeader>
              <div className="h-24 bg-slate-900 w-full" />
              <div className="px-8 pb-8 -mt-12">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 mx-auto">
                    {user?.photoURL ? (
                      <Image src={user.photoURL} alt={`תמונת הפרופיל של ${displayName}`} width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <UserIcon size={40} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-1">איך נקרא לך?</Label>
                    <Input 
                      id="edit-name" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      className="rounded-xl border-slate-100 focus:border-indigo-500 font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-1">לשון פנייה</Label>
                    <RadioGroup 
                      value={editGender} 
                      onValueChange={(val) => setEditGender(val as "m" | "f")}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="relative">
                        <RadioGroupItem value="m" id="r-male" className="sr-only" />
                        <Label 
                          htmlFor="r-male" 
                          className={cn(
                            "flex items-center justify-center py-3 rounded-xl border-2 transition-all cursor-pointer font-bold",
                            editGender === "m" ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 text-slate-400 hover:bg-slate-50"
                          )}
                        >
                          גבר {editGender === "m" && <Check size={14} className="mr-2" />}
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="f" id="r-female" className="sr-only" />
                        <Label 
                          htmlFor="r-female" 
                          className={cn(
                            "flex items-center justify-center py-3 rounded-xl border-2 transition-all cursor-pointer font-bold",
                            editGender === "f" ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 text-slate-400 hover:bg-slate-50"
                          )}
                        >
                          אישה {editGender === "f" && <Check size={14} className="mr-2" />}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">כרטיסיות שבוצעו</p>
                    <p className="text-xl font-black text-indigo-600">{completedCards.length}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">עוגנים</p>
                    <p className="text-xl font-black text-rose-500">{favorites.length}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full py-6 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    aria-label="שמור שינויים בפרופיל"
                  >
                    {isSaving ? "שומר..." : "שמירת שינויים"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full py-6 rounded-2xl text-rose-500 font-bold hover:bg-rose-50"
                    onClick={handleLogout}
                    aria-label="התנתק מהמערכת"
                  >
                    <LogOut className="ml-2 h-4 w-4" aria-hidden="true" />
                    התנתקות
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 mt-10 space-y-8 pb-12 animate-fade-in-up">
        {/* Main Interaction Card */}
        <div className="glass-panel rounded-[2rem] p-8 space-y-2">
          <p className="text-xs font-bold text-indigo-600 tracking-wider">{welcomeText}{displayName} 🌿</p>
          <h2 className="text-2xl font-headline font-black text-slate-900 leading-tight">{actionText}</h2>
          
          <form onSubmit={handleSearch} className="relative mt-6">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholderText}
              aria-label={placeholderText}
              className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none transition-all pr-12 font-medium"
            />
            <button 
              type="submit"
              disabled={isSearching}
              aria-label="חפש המלצה"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSearching ? <Sparkles className="animate-spin" size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
            </button>
          </form>

          {recommendation && (
            <div className="mt-6 p-6 bg-white rounded-2xl border-2 border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300 relative shadow-inner">
              <button 
                onClick={clearRecommendation} 
                aria-label="סגור המלצה"
                className="absolute top-3 left-3 text-slate-300 hover:text-indigo-600 transition-colors"
              >
                <X size={18} aria-hidden="true" />
              </button>
              
              <div className="flex gap-3 mb-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-md">
                  <Image 
                    src={PROFESSIONAL_PHOTO_URL}
                    alt="תמונת המטפל עמיר אייל"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest leading-none mb-1">המלצת המצפן 🧭</p>
                  <p className="text-xs font-black text-slate-900 leading-none">עמיר אייל</p>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed mb-5 font-medium border-r-4 border-indigo-500 pr-4">{recommendation.explanation}</p>
              
              <button 
                onClick={() => onSelectCategory(recommendation.categoryKey)}
                aria-label={`עבור לקטגוריית ${CATS.find(c => c.key === recommendation.categoryKey)?.label}`}
                className="w-full py-4 bg-indigo-600 rounded-xl text-white font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                {displayGender === 'f' ? 'לכי' : 'לך'} לעמוד {CATS.find(c => c.key === recommendation.categoryKey)?.label}
              </button>
            </div>
          )}
        </div>

        {/* Anchors (Favorites) Section */}
        {favorites.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Anchor size={14} className="text-rose-500" aria-hidden="true" />
              <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">העוגנים שלי</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
              {favorites.map((fav, i) => {
                const [catKey] = fav.split(":");
                const cat = CATS.find(c => c.key === catKey);
                if (!cat) return null;
                const Icon = cat.icon;
                return (
                  <button 
                    key={i}
                    onClick={() => onSelectCategory(catKey)}
                    aria-label={`עבור למועדף: ${cat.label}`}
                    className="flex-shrink-0 px-6 py-4 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm flex items-center gap-3 hover:border-rose-200 transition-all hover:shadow-md active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50">
                      <Icon size={16} style={{ color: cat.hue }} aria-hidden="true" />
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-black text-slate-900 leading-none mb-1">{cat.label}</span>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest">תרגיל שמור</span>
                    </div>
                    <Heart size={12} className="text-rose-500 fill-rose-500 ml-1" aria-hidden="true" />
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
            const categoryCompletedCount = completedCards.filter(id => id.startsWith(`${c.key}:`)).length;
            const isFullyCompleted = categoryCompletedCount === count;

            return (
              <button
                key={c.key}
                onClick={() => onSelectCategory(c.key)}
                aria-label={`קטגוריית ${c.label}. ${c.tagLine}`}
                className="group relative flex flex-col gap-3 p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 text-right overflow-hidden active:scale-95"
                style={{ backgroundColor: c.light }}
              >
                <div 
                  className="absolute -top-4 -left-4 w-20 h-20 rounded-full opacity-10 pointer-events-none" 
                  style={{ backgroundColor: c.hue }}
                />
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-sm" 
                  style={{ backgroundColor: `white` }}
                >
                  <Icon size={24} style={{ color: c.hue }} aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">{c.label}</h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{c.tagLine}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                   <div 
                    className="inline-flex items-center text-[9px] font-black px-2.5 py-1 rounded-full bg-white/50 border border-black/5"
                    style={{ color: c.hue }}
                  >
                    {count} כרטיסיות
                  </div>
                  {categoryCompletedCount > 0 && (
                    <div className={cn("flex items-center gap-1", isFullyCompleted ? "text-emerald-600" : "text-slate-400")}>
                      <CheckCircle2 size={12} aria-hidden="true" />
                      <span className="text-[9px] font-bold">{categoryCompletedCount}/{count}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <footer className="text-center py-12 border-t border-slate-100 space-y-4">
          <div className="flex justify-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <LegalDialog type="terms" trigger={<button className="hover:text-indigo-600 transition-colors" aria-label="קרא תנאי שימוש">תנאי שימוש</button>} />
            <span className="opacity-20">|</span>
            <LegalDialog type="disclaimer" trigger={<button className="hover:text-indigo-600 transition-colors" aria-label="קרא דיסקליימר">דיסקליימר</button>} />
            <span className="opacity-20">|</span>
            <LegalDialog type="accessibility" trigger={<button className="hover:text-indigo-600 transition-colors" aria-label="קרא הצהרת נגישות">נגישות</button>} />
          </div>
          <p className="text-[10px] font-bold tracking-widest text-slate-900 uppercase opacity-50">
            © {currentYear} המצפן הרגשי • כל הזכויות שמורות לעמיר אייל
          </p>
        </footer>
      </div>
    </div>
  );
}
