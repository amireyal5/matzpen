"use client";

import { useState, useEffect, useRef } from "react";
import { CATS, BANK } from "@/lib/data";
import { Compass, Sparkles, User as UserIcon, Anchor, BookText, Flower2, Zap, ArrowLeft, ChevronLeft, Phone, AlertTriangle, UserPlus, X, MessageCircle, Loader2, Play, Music, Wind, Moon, Sun, Brain, LifeBuoy, Cloud } from "lucide-react";
import { getRecommendation, RecommendationOutput } from "@/ai/flows/recommendation-flow";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { doc } from "firebase/firestore";
import { LegalDialog } from "@/components/LegalDialogs";
import ProfileDialog from "@/components/ProfileDialog";
import CategoryCard from "@/components/CategoryCard";
import NotificationCenter from "@/components/NotificationCenter";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AMBIENT_SOUNDS } from "@/lib/ambient-sound-engine";
import { BREATHING_EXERCISES } from "@/lib/breathing-exercises";

interface HomeScreenProps {
  name: string;
  gender: "m" | "f";
  onSelectCategory: (key: string) => void;
  onStartGuided: (catKey: string, practiceIdx: number) => void;
  onGoToJournal: () => void;
  onGoToSounds: (soundId?: any) => void;
  onGoToBreathing: (breathingId?: string) => void;
  onGoToBilateral: () => void;
  onGoToImagery: () => void;
  onBack: () => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

const PROFESSIONAL_PHOTO_URL = "https://res.cloudinary.com/dcdadfrpi/image/upload/v1751467502/userImages/pch7nqycdv0ezsxtfus6.jpg";

type Message = { role: 'user' | 'model', content: string };

interface HomeItem {
  id: string;
  type: "practice" | "breathing" | "sound";
  label: string;
  description: string;
  tag: string;
  image: string;
  hue: string;
  gradient: string;
  catKey?: string;
  index?: number;
  breathingId?: string;
  soundId?: any;
}

const TOPIC_SECTIONS: {
  id: string;
  title: string;
  description: string;
  icon: any;
  hue: string;
  items: HomeItem[];
}[] = [
  {
    id: "sos",
    title: "עזרה מיידית וקרקוע (SOS)",
    description: "כלים מהירים להפחתת חרדה והצפה רגשית ברגעים קשים",
    icon: LifeBuoy,
    hue: "#DC2626",
    items: [
      {
        id: "sos-practice-0",
        type: "practice",
        catKey: "SOS",
        index: 0,
        label: "שטוף פנים במים קרים",
        description: "הפעלת רפלקס הצלילה להאטת הדופק והרגעת הגוף",
        tag: "תרגיל מהיר",
        image: "https://images.unsplash.com/photo-1548676924-48e71ceac151?q=80&w=600",
        hue: "#DC2626",
        gradient: "from-red-950/40 via-slate-900 to-slate-950"
      },
      {
        id: "sos-breathing-ptsd",
        type: "breathing",
        breathingId: "ptsd-grounding",
        label: "ויסות הצפה (קרקוע מרגיע)",
        description: "נשימה מרגיעה ללא עצירות להרגעת מערכת העצבים",
        tag: "תרגיל נשימה",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600",
        hue: "#10B981",
        gradient: "from-emerald-950/40 via-slate-900 to-slate-950"
      },
      {
        id: "sos-practice-3",
        type: "practice",
        catKey: "SOS",
        index: 3,
        label: "קרקוע חושי 5–4–3–2–1",
        description: "העברת הקשב מהמחשבות הטורדניות אל החושים במציאות",
        tag: "תרגיל מהיר",
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600",
        hue: "#DC2626",
        gradient: "from-red-950/40 via-slate-900 to-slate-950"
      },
      {
        id: "sos-sound-calm",
        type: "sound",
        soundId: "ambient-calm",
        label: "רוגע עדין",
        description: "צלילי אמביינט מלטפים ליצירת מרחב בטוח",
        tag: "סאונד מרגיע",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600",
        hue: "#6366F1",
        gradient: "from-indigo-950/40 via-slate-900 to-slate-950"
      }
    ]
  },
  {
    id: "body",
    title: "גוף ונשימה (ויסות פיזיולוגי)",
    description: "חיבור מחדש לתחושות הפיזיות ושחרור מתחים צבורים",
    icon: Wind,
    hue: "#059669",
    items: [
      {
        id: "body-practice-0",
        type: "practice",
        catKey: "BODY",
        index: 0,
        label: "סריקת גוף (Body Scan)",
        description: "חיבור מחדש לגוף וזיהוי היכן המתח שוכן",
        tag: "תרגיל מהיר",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600",
        hue: "#059669",
        gradient: "from-emerald-950/40 via-slate-900 to-slate-950"
      },
      {
        id: "body-breathing-calm",
        type: "breathing",
        breathingId: "calm-circle",
        label: "נשימה מרגיעה (מעגל)",
        description: "תרגול נשימה מינימליסטי להפחתת מתח מהירה",
        tag: "תרגיל נשימה",
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600",
        hue: "#10B981",
        gradient: "from-emerald-950/40 via-slate-900 to-slate-950"
      },
      {
        id: "body-practice-4",
        type: "practice",
        catKey: "BODY",
        index: 4,
        label: "חיבוק פרפר (EMDR)",
        description: "טכניקת גירוי דו-צדדי לעיבוד רגשי מהיר",
        tag: "תרגיל מהיר",
        image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600",
        hue: "#059669",
        gradient: "from-emerald-950/40 via-slate-900 to-slate-950"
      },
      {
        id: "body-sound-bowl",
        type: "sound",
        soundId: "tibetan-bowl",
        label: "קערה טיבטית",
        description: "צלילי קערה מסורתית להרפיית מתחים מהירה",
        tag: "סאונד מרגיע",
        image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600",
        hue: "#6366F1",
        gradient: "from-indigo-950/40 via-slate-900 to-slate-950"
      }
    ]
  },
  {
    id: "sleep",
    title: "שינה ורוגע (השקטת התודעה)",
    description: "טקסי מעבר רכים מעשייה למנוחה ושקיעה בשינה בריאה",
    icon: Moon,
    hue: "#4F46E5",
    items: [
      {
        id: "sleep-practice-0",
        type: "practice",
        catKey: "SLEEP",
        index: 0,
        label: "רשימת פריקת דאגות",
        description: "רישום המשימות המעסיקות אותך בלילה מחוץ למוח",
        tag: "תרגיל מהיר",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600",
        hue: "#4F46E5",
        gradient: "from-indigo-950/40 via-slate-900 to-slate-950"
      },
      {
        id: "sleep-breathing-nebula",
        type: "breathing",
        breathingId: "cosmic-nebula",
        label: "הרפיה עמוקה לשינה",
        description: "שיטת 4-7-8 המפורסמת להרגעת הגוף לפני שינה",
        tag: "תרגיל נשימה",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600",
        hue: "#10B981",
        gradient: "from-emerald-950/40 via-slate-900 to-slate-950"
      },
      {
        id: "sleep-practice-4",
        type: "practice",
        catKey: "SLEEP",
        index: 4,
        label: "הכרת תודה לפני שינה",
        description: "סיום היום בהפניית קשב חיובי לשינה שלווה",
        tag: "תרגיל מהיר",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600",
        hue: "#4F46E5",
        gradient: "from-indigo-950/40 via-slate-900 to-slate-950"
      },
      {
        id: "sleep-sound-dreamscape",
        type: "sound",
        soundId: "dreamscape",
        label: "חלום בהקיץ",
        description: "נוף קול רגוע ומחבר להרפיה ונשימה שקטה",
        tag: "סאונד מרגיע",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600",
        hue: "#6366F1",
        gradient: "from-indigo-950/40 via-slate-900 to-slate-950"
      }
    ]
  },
  {
    id: "mind",
    title: "חוסן וניהול מחשבות (ויסות קוגניטיבי)",
    description: "שחרור מלופים מחשבתיים, פוקוס ואיזון רגשי מעמיק",
    icon: Brain,
    hue: "#D97706",
    items: [
      {
        id: "mind-practice-resilience-0",
        type: "practice",
        catKey: "RESILIENCE",
        index: 0,
        label: "רשימת ניצחונות",
        description: "כתיבת הצלחות עבר לבניית תחושת מסוגלות מחודשת",
        tag: "תרגיל מהיר",
        image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600",
        hue: "#2563EB",
        gradient: "from-blue-950/40 via-slate-900 to-slate-950"
      },
      {
        id: "mind-breathing-box",
        type: "breathing",
        breathingId: "box-mandala",
        label: "נשימת קופסה (Navy SEALs)",
        description: "שיטת Navy SEALs לריכוז תחת לחץ קיצוני ואיזון O₂/CO₂",
        tag: "תרגיל נשימה",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600",
        hue: "#10B981",
        gradient: "from-emerald-950/40 via-slate-900 to-slate-950"
      },
      {
        id: "mind-practice-acceptance-0",
        type: "practice",
        catKey: "ACCEPTANCE",
        index: 0,
        label: "מחשבות הן עננים",
        description: "התבוננות על המחשבות הטורדניות מבחוץ כעננים חולפים",
        tag: "תרגיל מהיר",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600",
        hue: "#7C3AED",
        gradient: "from-purple-950/40 via-slate-900 to-slate-950"
      },
      {
        id: "mind-sound-frequency",
        type: "sound",
        soundId: "hz-frequency-258",
        label: "תדר ריפוי 258Hz",
        description: "מוזיקת זן ותדר מיוחד לאיזון האנרגיה במוח",
        tag: "סאונד מרגיע",
        image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600",
        hue: "#6366F1",
        gradient: "from-indigo-950/40 via-slate-900 to-slate-950"
      }
    ]
  }
];

interface UnifiedHomeCardProps {
  item: HomeItem;
  onStartGuided: (catKey: string, practiceIdx: number) => void;
  onGoToSounds: (soundId?: any) => void;
  onGoToBreathing: (breathingId?: string) => void;
}

function UnifiedHomeCard({ item, onStartGuided, onGoToSounds, onGoToBreathing }: UnifiedHomeCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const handlePlay = () => {
    if (item.type === "practice") {
      onStartGuided(item.catKey!, item.index!);
    } else if (item.type === "breathing") {
      onGoToBreathing(item.breathingId);
    } else if (item.type === "sound") {
      onGoToSounds(item.soundId);
    }
  };

  const IconComponent = item.type === "practice" ? BookText :
                        item.type === "breathing" ? Wind : Music;

  return (
    <button
      onClick={handlePlay}
      className="snap-start shrink-0 w-[72vw] xs:w-[75vw] sm:w-[260px] lg:w-full h-36 rounded-[2rem] overflow-hidden border border-white/5 bg-slate-900/40 backdrop-blur-xl transition-all duration-500 shadow-lg relative p-5 flex flex-col justify-between text-right group hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] active:scale-95"
    >
      <div className="absolute inset-0 z-0">
        {item.type !== "practice" && !imageError ? (
          <Image
            src={item.image}
            alt={item.label}
            fill
            className="object-cover transition-transform duration-700 brightness-[0.3] group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-500 opacity-60", item.gradient)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      <div className="relative z-10 flex justify-between items-start w-full">
        <div 
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300"
        >
          {item.type === "practice" ? (
            <Play size={16} className="fill-current translate-x-[1px] text-white" />
          ) : (
            <IconComponent size={16} className="text-white" />
          )}
        </div>
        <div className="text-right pr-2">
          <span className="block font-black text-sm text-white leading-snug">{item.label}</span>
          <span className="block text-[10px] text-slate-300 font-bold opacity-90 line-clamp-2 mt-0.5 leading-tight">{item.description}</span>
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-center w-full">
        <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-350 border border-white/5 backdrop-blur-sm">
          {item.tag}
        </span>
      </div>
    </button>
  );
}

export default function HomeScreen({ 
  name: initialName, 
  gender: initialGender, 
  onSelectCategory, 
  onStartGuided, 
  onGoToJournal, 
  onGoToSounds, 
  onGoToBreathing, 
  onGoToBilateral,
  onGoToImagery,
  onBack,
  theme = "light",
  toggleTheme
}: HomeScreenProps) {
  const isLight = theme === "light";
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationOutput | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
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

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isSearching, recommendation]);

  const favorites = profileData?.favorites || [];
  const completedCards = profileData?.completed || [];
  const displayName = profileData?.name || initialName || "משתמש";
  const displayGender = (profileData?.gender || initialGender) as "m" | "f";

  const sendQuery = async (query: string) => {
    if (!query) return;
    
    const newUserMessage: Message = { role: 'user', content: query };
    const updatedMessages = [...messages, newUserMessage];
    
    setMessages(updatedMessages);
    setSearchQuery("");
    setIsSearching(true);
    
    try {
      const currentName = profileData?.name || displayName;
      
      const res = await getRecommendation({ 
        feeling: query, 
        gender: displayGender,
        name: currentName,
        history: messages 
      });
      
      setRecommendation(res);
      setMessages([...updatedMessages, { role: 'model', content: res.explanation }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    await sendQuery(query);
  };

  const handleResetChat = () => {
    setRecommendation(null);
    setMessages([]);
    setSearchQuery("");
  };

  const welcomeText = displayGender === "f" ? `במה נתרכז היום, ${displayName}?` : `במה נתמקד היום, ${displayName}?`;
  const subActionText = displayGender === "f" ? "בחרי תחום כדי להתחיל בתרגול" : "בחר תחום כדי להתחיל בתרגול";
  const placeholderText = displayGender === "f" ? "מה מעסיקה אותך היום?" : "מה מעסיק אותך היום?";

  return (
    <div className={cn("min-h-screen relative overflow-hidden select-none transition-colors duration-500", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-[#0B0F19] text-white")}>
      {/* Background style overrides for animations */}
      <style>{`
        @keyframes bento-bls {
          0% { left: 10%; opacity: 0.25; }
          50% { left: 90%; opacity: 0.85; }
          100% { left: 10%; opacity: 0.25; }
        }
        @keyframes bento-breath {
          0% { transform: scale(0.95); opacity: 0.15; }
          50% { transform: scale(1.15); opacity: 0.45; }
          100% { transform: scale(0.95); opacity: 0.15; }
        }
        @keyframes eq-bar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .eq-bar-1 { animation: eq-bar 0.8s ease-in-out infinite; }
        .eq-bar-2 { animation: eq-bar 0.5s ease-in-out -0.3s infinite; }
        .eq-bar-3 { animation: eq-bar 0.7s ease-in-out -0.15s infinite; }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Ambient background glows */}
      <div className={cn("absolute top-[-10%] left-[-20%] w-[70%] h-[50%] rounded-full blur-[120px] pointer-events-none transition-colors duration-700", isLight ? "bg-indigo-200/40" : "bg-indigo-500/10")} />
      <div className={cn("absolute bottom-[10%] right-[-10%] w-[60%] h-[50%] rounded-full blur-[120px] pointer-events-none transition-colors duration-700", isLight ? "bg-emerald-200/30" : "bg-emerald-500/10")} />
      <div className={cn("absolute top-[30%] right-[-15%] w-[50%] h-[40%] rounded-full blur-[100px] pointer-events-none transition-colors duration-700", isLight ? "bg-purple-200/20" : "bg-purple-500/5")} />

      {/* Content wrapper */}
      <div className="relative z-10">
        <header className="bg-transparent pt-8 pb-6 px-6">
          <div className="max-w-xl lg:max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
            <div className="w-full flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg overflow-hidden p-1.5 transition-colors", isLight ? "bg-white border-slate-200" : "bg-white/5 border-white/10")}>
                  <Logo variant="icon" />
                </div>
                <p className={cn("text-[10px] font-black uppercase tracking-widest", isLight ? "text-indigo-600" : "text-indigo-400")}>המצפן הרגשי</p>
              </div>
              
              <div className="flex items-center gap-2">
                <NotificationCenter isLight={isLight} />

                {toggleTheme && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={toggleTheme}
                        className={cn(
                          "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-90",
                          isLight 
                            ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 shadow-sm" 
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                        )}
                        aria-label={isLight ? "מצב כהה" : "מצב בהיר"}
                      >
                        {isLight ? <Moon size={18} /> : <Sun size={18} />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{isLight ? "מצב כהה" : "מצב בהיר"}</TooltipContent>
                  </Tooltip>
                )}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setIsProfileOpen(true)} className={cn("w-10 h-10 rounded-full border-2 hover:border-indigo-500 transition-all overflow-hidden relative", isLight ? "border-slate-200" : "border-white/10")} aria-label="פרופיל והגדרות">
                      {user?.photoURL ? (
                        <Image src={user.photoURL} alt="פרופיל אישי" width={40} height={40} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className={cn("w-full h-full flex items-center justify-center", isLight ? "bg-slate-100 text-slate-500" : "bg-slate-800 text-slate-400")}>
                          <UserIcon size={16} />
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>פרופיל והגדרות</TooltipContent>
                </Tooltip>
              </div>
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

            <div className="space-y-1.5">
              <h2 className={cn("text-3xl font-headline font-black tracking-tight leading-tight", isLight ? "text-slate-900" : "text-white")}>{welcomeText}</h2>
              <p className={cn("text-xs font-bold", isLight ? "text-slate-500" : "text-slate-400")}>{subActionText}</p>
            </div>
          </div>
        </header>

        {/* Intelligent Dialogue Section */}
        <div className="max-w-xl lg:max-w-4xl mx-auto px-6 relative z-20">
          {recommendation && recommendation.isCrisis ? (
            <div className="mt-6 p-8 bg-rose-955/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-rose-500/30 shadow-2xl animate-in fade-in zoom-in duration-500 space-y-8" dir="rtl">
              <div className="flex items-center gap-4 text-rose-455">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <LifeBuoy size={28} />
                </div>
                <h3 className="text-xl font-black">סיוע ותמיכה מיידית</h3>
              </div>
              
              <p className="text-rose-100 leading-relaxed font-bold text-base whitespace-pre-line">
                {recommendation.explanation}
              </p>

              <div className="grid gap-4">
                <a href="tel:1201" className="flex items-center justify-between p-5 bg-slate-900/60 hover:bg-slate-900 border border-rose-500/20 rounded-2xl transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone size={18} />
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-rose-200">ער"ן - עזרה ראשונה נפשית</span>
                      <span className="block text-xs text-rose-400 font-mono">חיוג חינם ומיידי: 1201</span>
                    </div>
                  </div>
                  <ChevronLeft size={20} className="text-rose-400/50" />
                </a>

                <a href="tel:101" className="flex items-center justify-between p-5 bg-slate-900/60 hover:bg-slate-900 border border-rose-500/20 rounded-2xl transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone size={18} />
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-emerald-200">מד"א - מצבי חירום רפואיים</span>
                      <span className="block text-xs text-emerald-400 font-mono">חיוג חירום: 101</span>
                    </div>
                  </div>
                  <ChevronLeft size={20} className="text-rose-400/50" />
                </a>

                <div className="p-6 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex items-center gap-4 text-right">
                  <UserPlus className="text-indigo-400 shrink-0" size={24} />
                  <p className="text-xs font-bold text-indigo-200 leading-relaxed">
                    {displayGender === "f" 
                      ? `${displayName}, בבקשה פני עכשיו לחבר קרוב, בן משפחה או אדם שאת סומכת עליו. אל תישארי לבד עם התחושות האלה.`
                      : `${displayName}, בבקשה פנה עכשיו לחבר קרוב, בן משפחה או אדם שאתה סומך עליו. אל תישאר לבד עם התחושות האלה.`
                    }
                  </p>
                </div>
              </div>

              <button 
                onClick={handleResetChat}
                className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-400 transition-colors"
              >
                סגור וחזור לכלים הרגילים
              </button>
            </div>
          ) : messages.length > 0 ? (
            <div className="mb-6 bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col overflow-hidden h-[550px] relative" dir="rtl">
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <MessageCircle size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">הדיאלוג החכם</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">מלווה אותך צעד אחר צעד</span>
                  </div>
                </div>
                <button onClick={handleResetChat} className="text-[10px] font-black text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full hover:bg-white/5">
                  <X size={12} /> איפוס שיחה
                </button>
              </div>
              
              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar scroll-smooth"
              >
                {messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "w-9 h-9 rounded-full shrink-0 flex items-center justify-center overflow-hidden border shadow-sm",
                      msg.role === 'user' ? "border-white/10 bg-slate-800" : "border-indigo-500/20 bg-indigo-600"
                    )}>
                      {msg.role === 'user' ? (
                        user?.photoURL ? (
                          <Image src={user.photoURL} alt={displayName} width={36} height={36} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={16} className="text-slate-400" />
                        )
                      ) : (
                        <div className="p-1.5 w-full h-full flex items-center justify-center">
                          <Logo variant="icon" className="w-full h-full" />
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-sm",
                      msg.role === 'user' 
                        ? "bg-slate-800/60 text-slate-200 border border-white/5 rounded-tr-none" 
                        : "bg-indigo-950/40 text-indigo-200 border border-indigo-500/15 rounded-tl-none font-bold"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isSearching && (
                  <div className="flex gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center p-1.5 border border-indigo-500/20">
                      <Logo variant="icon" />
                    </div>
                    <div className="bg-indigo-950/30 border border-indigo-500/10 h-12 w-32 rounded-2xl rounded-tl-none" />
                  </div>
                )}

                {!isSearching && recommendation && (
                  <div className="space-y-4 pt-2">
                    {recommendation.quickReplies && recommendation.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {recommendation.quickReplies.map((reply, i) => (
                          <button 
                            key={i}
                            onClick={() => sendQuery(reply)}
                            className="px-4 py-2 bg-slate-800/80 border border-white/5 hover:border-indigo-500/30 rounded-full text-xs font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}

                    {recommendation.options && recommendation.options.length > 0 && (
                      <div className="grid gap-3 pt-2 animate-in fade-in duration-1000">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pr-2">{displayName}, הנה כמה דרכים שיכולות לעזור עכשיו:</span>
                        {recommendation.options.map((opt, i) => (
                          <button 
                            key={i}
                            onClick={() => {
                              if (opt.categoryKey === "JOURNAL") onGoToJournal();
                              else if (opt.categoryKey === "SOUNDS" || opt.categoryKey === "MEDITATION") onGoToSounds();
                              else if (opt.categoryKey === "BREATHING") onGoToBreathing();
                              else if (opt.categoryKey === "BILATERAL") onGoToBilateral();
                              else if (opt.practiceIndex !== undefined) onStartGuided(opt.categoryKey, opt.practiceIndex);
                              else onSelectCategory(opt.categoryKey);
                            }}
                            className="group w-full p-4 bg-slate-900/40 hover:bg-indigo-950/20 border border-white/5 hover:border-indigo-500/30 rounded-[1.5rem] transition-all text-right flex items-center justify-between active:scale-[0.98] shadow-sm"
                          >
                            <div className="space-y-0.5">
                              <span className="block font-black text-white group-hover:text-indigo-400 transition-colors text-sm">{opt.label}</span>
                              <span className="block text-[11px] text-slate-400 font-bold">{opt.description}</span>
                            </div>
                            <ChevronLeft className="text-slate-500 group-hover:text-indigo-400 transition-colors" size={16} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div ref={chatEndRef} className="h-4 shrink-0" />
              </div>

              <div className="p-4 bg-white/[0.01] border-t border-white/5 shrink-0">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative rounded-2xl p-1 flex items-center shadow-lg overflow-hidden bg-slate-900/80 border border-white/5 focus-within:border-indigo-500/30 transition-all duration-300">
                    <input 
                      type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                      placeholder={recommendation?.needsMoreInfo ? "הוסף/י עוד פרטים..." : "מה תרצה/י להוסיף?"} 
                      className="flex-1 bg-transparent px-4 py-3 focus:outline-none font-medium text-white placeholder:text-slate-500 text-sm text-right" dir="rtl"
                    />
                    <button type="submit" disabled={isSearching || !searchQuery.trim()} className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 transition-all" aria-label="שלח">
                      {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSearch} className="relative group">
              <div className={cn("absolute -inset-1 rounded-[2.2rem] blur-md opacity-75 group-hover:opacity-100 transition duration-500", isLight ? "bg-gradient-to-r from-indigo-300/30 to-purple-300/30" : "bg-gradient-to-r from-indigo-500/20 to-purple-500/20")}></div>
              <div className={cn("relative rounded-[2rem] p-2 flex items-center overflow-hidden min-h-[72px] backdrop-blur-xl border focus-within:border-indigo-500/30 transition-all duration-500 shadow-2xl", isLight ? "bg-white/80 border-slate-200" : "bg-slate-900/60 border-white/10")}>
                <div className={cn(
                  "flex-shrink-0 transition-all duration-1000 ease-out overflow-hidden ml-2",
                  (isMinimized && messages.length === 0) ? "w-10 h-10 opacity-100" : "w-0 opacity-0"
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
                  placeholder={placeholderText} 
                  className={cn("flex-1 bg-transparent px-4 py-5 focus:outline-none font-bold text-sm text-right", isLight ? "text-slate-900 placeholder:text-slate-400" : "text-white placeholder:text-slate-500")} dir="rtl"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      type="submit" 
                      disabled={isSearching || !searchQuery.trim()} 
                      className="w-14 h-14 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 transition-all border border-indigo-500/30"
                      aria-label="שלח לדיאלוג החכם"
                    >
                      {isSearching ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>שלח לדיאלוג החכם</TooltipContent>
                </Tooltip>
              </div>
            </form>
          )}
        </div>

        {/* Main Section */}
        <div className="max-w-xl lg:max-w-5xl mx-auto px-6 lg:px-8 mt-10 space-y-10 lg:space-y-14 pb-20">
          
          {/* Strategic Tools Bento Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Sparkles size={14} className="text-indigo-400" />
              <h3 className={cn("text-[10px] font-black tracking-widest uppercase text-right", isLight ? "text-slate-500" : "text-slate-400")}>כלים אסטרטגיים</h3>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              {/* CBT Journal */}
              <button 
                onClick={onGoToJournal}
                className={cn("col-span-1 p-5 rounded-[2rem] backdrop-blur-xl border shadow-lg flex flex-col justify-between items-start text-right min-h-[160px] active:scale-95 transition-all group overflow-hidden relative", isLight ? "bg-white/70 border-slate-200 hover:border-indigo-400/50 hover:shadow-indigo-100/50" : "bg-slate-900/40 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60")}
                aria-label="יומן מחשבות CBT"
              >
                <div className="absolute top-[-30%] right-[-30%] w-24 h-24 rounded-full bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <BookText size={20} />
                </div>
                <div className="space-y-1 mt-4 z-10">
                  <span className={cn("block text-sm font-black leading-tight", isLight ? "text-slate-900" : "text-white")}>יומן מחשבות</span>
                  <span className="block text-[10px] text-indigo-400 font-black tracking-widest uppercase">CBT • אפר"ת</span>
                  <span className="block text-[9px] text-slate-400 font-bold leading-normal mt-1 opacity-80">וויסות רגשי דרך שינוי דפוסי חשיבה</span>
                </div>
              </button>

              {/* Bilateral EMDR */}
              <button 
                onClick={onGoToBilateral}
                className={cn("col-span-1 p-5 rounded-[2rem] backdrop-blur-xl border shadow-lg flex flex-col justify-between items-start text-right min-h-[160px] active:scale-95 transition-all group overflow-hidden relative", isLight ? "bg-white/70 border-slate-200 hover:border-indigo-400/50 hover:shadow-indigo-100/50" : "bg-slate-900/40 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60")}
                aria-label="עיבוד בילטרלי EMDR"
              >
                {/* Visual back and forth tracking orb decoration in background */}
                <div className="absolute top-[35%] left-0 right-0 h-[1px] bg-indigo-500/5 pointer-events-none" />
                <div className="absolute top-[35%] left-0 right-0 -translate-y-1/2 h-4 pointer-events-none opacity-30">
                  <div className="absolute w-2 h-2 rounded-full bg-indigo-400 blur-[1px] animate-bls-bento" style={{ animation: 'bento-bls 3.5s infinite ease-in-out' }} />
                </div>
                
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                  <Zap size={20} className="fill-current" />
                </div>
                <div className="space-y-1 mt-4 z-10">
                  <span className={cn("block text-sm font-black leading-tight", isLight ? "text-slate-900" : "text-white")}>עיבוד בילטרלי</span>
                  <span className="block text-[10px] text-indigo-400 font-black tracking-widest uppercase">EMDR Style</span>
                  <span className="block text-[9px] text-slate-400 font-bold leading-normal mt-1 opacity-80">נטרול רגשות קשים והטמעת משאבים</span>
                </div>
              </button>

              {/* Breathing Exercises */}
              <button 
                onClick={() => onGoToBreathing()}
                className={cn("col-span-1 p-5 rounded-[2rem] backdrop-blur-xl border shadow-lg flex flex-col justify-between items-start text-right min-h-[160px] active:scale-95 transition-all group overflow-hidden relative", isLight ? "bg-white/70 border-slate-200 hover:border-emerald-400/50 hover:shadow-emerald-100/50" : "bg-slate-900/40 border-white/5 hover:border-emerald-500/30 hover:bg-slate-900/60")}
                aria-label="תרגולי נשימה מווסתים"
              >
                <div className="absolute top-[-30%] right-[-30%] w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                <div className="absolute left-4 top-4 w-12 h-12 rounded-full border border-emerald-500/10 pointer-events-none flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/5 border border-emerald-500/20" style={{ animation: 'bento-breath 4s infinite ease-in-out' }} />
                </div>
                
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Wind size={20} />
                </div>
                <div className="space-y-1 mt-4 z-10">
                  <span className={cn("block text-sm font-black leading-tight", isLight ? "text-slate-900" : "text-white")}>תרגולי נשימה</span>
                  <span className="block text-[10px] text-emerald-400 font-black tracking-widest uppercase">ויסות והרגעה</span>
                  <span className="block text-[9px] text-slate-400 font-bold leading-normal mt-1 opacity-80">קצב ויזואלי מונחה עם פעמון עדין</span>
                </div>
              </button>

              {/* Ambient Sounds */}
              <button 
                onClick={() => onGoToSounds()}
                className={cn("col-span-1 p-5 rounded-[2rem] backdrop-blur-xl border shadow-lg flex flex-col justify-between items-start text-right min-h-[160px] active:scale-95 transition-all group overflow-hidden relative", isLight ? "bg-white/70 border-slate-200 hover:border-indigo-400/50 hover:shadow-indigo-100/50" : "bg-slate-900/40 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60")}
                aria-label="צלילי מרחב לשלווה"
              >
                <div className="absolute top-[-30%] right-[-30%] w-24 h-24 rounded-full bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
                <div className="absolute left-4 top-4 flex items-end gap-0.5 h-6 w-8 pointer-events-none opacity-25">
                  <span className="w-1 bg-indigo-400 rounded-full eq-bar-1" style={{ height: "40%" }} />
                  <span className="w-1 bg-indigo-400 rounded-full eq-bar-2" style={{ height: "80%" }} />
                  <span className="w-1 bg-indigo-400 rounded-full eq-bar-3" style={{ height: "50%" }} />
                </div>

                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Music size={20} />
                </div>
                <div className="space-y-1 mt-4 z-10">
                  <span className={cn("block text-sm font-black leading-tight", isLight ? "text-slate-900" : "text-white")}>צלילי מרחב</span>
                  <span className="block text-[10px] text-indigo-400 font-black tracking-widest uppercase">מוזיקה מרגיעה</span>
                  <span className="block text-[9px] text-slate-400 font-bold leading-normal mt-1 opacity-80">נעימות סביבתיות וקערות טיבטיות</span>
                </div>
              </button>

              {/* Guided Imagery */}
              <button
                onClick={onGoToImagery}
                className={cn("col-span-1 p-5 rounded-[2rem] backdrop-blur-xl border shadow-lg flex flex-col justify-between items-start text-right min-h-[160px] active:scale-95 transition-all group overflow-hidden relative", isLight ? "bg-white/70 border-slate-200 hover:border-violet-400/50 hover:shadow-violet-100/50" : "bg-slate-900/40 border-white/5 hover:border-violet-500/30 hover:bg-slate-900/60")}
                aria-label="דימיון מודרך"
              >
                <div className="absolute top-[-30%] right-[-30%] w-24 h-24 rounded-full bg-violet-500/5 blur-2xl group-hover:bg-violet-500/10 transition-colors pointer-events-none" />
                <div className="absolute left-4 top-4 w-10 h-10 pointer-events-none opacity-25" style={{ animation: 'bento-breath 6s infinite ease-in-out' }}>
                  <Cloud size={32} className="text-violet-400" />
                </div>

                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                  <Sparkles size={20} />
                </div>
                <div className="space-y-1 mt-4 z-10">
                  <span className={cn("block text-sm font-black leading-tight", isLight ? "text-slate-900" : "text-white")}>דימיון מודרך</span>
                  <span className="block text-[10px] text-violet-400 font-black tracking-widest uppercase">מסעות ויזואליים</span>
                  <span className="block text-[9px] text-slate-400 font-bold leading-normal mt-1 opacity-80">וידאו, מוזיקה והכוונה כתובה להרפיה עמוקה</span>
                </div>
              </button>

            </div>
          </div>

          {/* Topic Sections */}
          {TOPIC_SECTIONS.map((section) => (
            <div key={section.id} className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <section.icon size={14} style={{ color: section.hue }} />
                <h3 className={cn("text-[10px] font-black tracking-widest uppercase text-right", isLight ? "text-slate-500" : "text-slate-400")}>
                  {section.title}
                </h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-6 px-6 lg:grid lg:grid-cols-4 lg:overflow-visible lg:snap-none lg:mx-0 lg:px-0 lg:pb-0" dir="rtl">
                {section.items.map((item) => (
                  <UnifiedHomeCard
                    key={item.id}
                    item={item}
                    onStartGuided={onStartGuided}
                    onGoToSounds={onGoToSounds}
                    onGoToBreathing={onGoToBreathing}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Categories Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Compass size={14} className="text-indigo-400" />
              <h3 className={cn("text-[10px] font-black tracking-widest uppercase text-right", isLight ? "text-slate-500" : "text-slate-400")}>כל הנושאים והתחומים</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-6 px-6 lg:grid lg:grid-cols-4 lg:overflow-visible lg:snap-none lg:mx-0 lg:px-0 lg:pb-0" dir="rtl">
              {CATS.map((c) => (
                <div key={c.key} className="snap-start shrink-0 w-[42vw] xs:w-[45vw] sm:w-[200px] lg:w-full">
                  <CategoryCard
                    category={c}
                    count={(BANK[c.key] || []).length}
                    completedCount={(completedCards as string[]).filter((id: string) => id.startsWith(`${c.key}:`)).length}
                    onClick={onSelectCategory}
                    isLight={isLight}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Anchors / Favorites */}
          {favorites.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-700">
              <div className="flex items-center gap-2 px-2">
                <Anchor size={14} className="text-rose-400" />
                <h3 className={cn("text-[10px] font-black tracking-widest uppercase text-right", isLight ? "text-slate-500" : "text-slate-400")}>העוגנים שלי</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-6 px-6 lg:flex-wrap lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0" dir="rtl">
                {favorites.map((fav: string, i: number) => {
                  const [catKey] = fav.split(":");
                  const cat = CATS.find(c => c.key === catKey);
                  if (!cat) return null;
                  return (
                    <button 
                      key={i} 
                      onClick={() => onSelectCategory(catKey)} 
                      className={cn("flex-shrink-0 px-8 py-5 rounded-[2rem] backdrop-blur-xl border shadow-md flex items-center gap-4 active:scale-95 snap-start transition-all", isLight ? "bg-white/70 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-indigo-300" : "bg-slate-900/40 border-white/5 text-slate-200 hover:text-white hover:border-indigo-500/20")}
                    >
                      <cat.icon size={18} style={{ color: cat.hue }} />
                      <span className="block text-sm font-black">{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className={cn("text-center py-16 border-t space-y-6", isLight ? "border-slate-200" : "border-white/5")}>
            <div className="flex justify-center gap-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">
              <LegalDialog type="terms" trigger={<button className="hover:text-indigo-400 transition-colors">תנאי שימוש</button>} />
              <LegalDialog type="disclaimer" trigger={<button className="hover:text-indigo-400 transition-colors">הבהרה משפטית</button>} />
              <LegalDialog type="accessibility" trigger={<button className="hover:text-indigo-400 transition-colors">נגישות</button>} />
            </div>
            <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
              © {currentYear} המצפן הרגשי • כל הזכויות שמורות ל<a href="https://www.amireyal.co.il/" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400 transition-colors">עמיר אייל</a>
            </p>
          </footer>
        </div>
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