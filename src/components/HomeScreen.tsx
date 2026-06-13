"use client";

import { useState, useEffect, useRef } from "react";
import { CATS, BANK } from "@/lib/data";
import { Compass, Sparkles, User as UserIcon, Anchor, BookText, Flower2, Zap, ArrowLeft, ChevronLeft, Phone, AlertTriangle, UserPlus, X, MessageCircle, Loader2, Play, Music, Wind, Moon, Brain } from "lucide-react";
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
  onGoToMeditation: (tab?: "sounds" | "breathing", soundId?: any, breathingId?: string) => void;
  onGoToBilateral: () => void;
  onBack: () => void;
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
    icon: AlertTriangle,
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
        label: "ויסות הצפה (PTSD)",
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
        label: "נשימת קופסה",
        description: "טכניקה צבאית לחידוד הפוקוס ואיפוס רמת המתח",
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
  onGoToMeditation: (tab?: "sounds" | "breathing", soundId?: any, breathingId?: string) => void;
}

function UnifiedHomeCard({ item, onStartGuided, onGoToMeditation }: UnifiedHomeCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const handlePlay = () => {
    if (item.type === "practice") {
      onStartGuided(item.catKey!, item.index!);
    } else if (item.type === "breathing") {
      onGoToMeditation("breathing", undefined, item.breathingId);
    } else if (item.type === "sound") {
      onGoToMeditation("sounds", item.soundId);
    }
  };

  const IconComponent = item.type === "practice" ? BookText :
                        item.type === "breathing" ? Wind : Music;

  return (
    <button
      onClick={handlePlay}
      className="snap-start shrink-0 w-[72vw] xs:w-[75vw] sm:w-[260px] h-36 rounded-[2rem] overflow-hidden border border-slate-100 hover:border-indigo-200 transition-all duration-500 shadow-sm hover:shadow-lg relative p-5 flex flex-col justify-between text-right group"
    >
      <div className="absolute inset-0 z-0">
        {item.type !== "practice" && !imageError ? (
          <Image
            src={item.image}
            alt={item.label}
            fill
            className="object-cover transition-transform duration-700 brightness-[0.4] group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-500 opacity-90", item.gradient)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      <div className="relative z-10 flex justify-between items-start w-full">
        <div 
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300"
        >
          {item.type === "practice" ? (
            <Play size={16} className="fill-current translate-x-[1px] text-white" />
          ) : (
            <IconComponent size={16} className="text-white" />
          )}
        </div>
        <div className="text-right pr-2">
          <span className="block font-black text-sm text-white leading-snug">{item.label}</span>
          <span className="block text-[10px] text-slate-300 font-medium opacity-90 line-clamp-2 mt-0.5 leading-tight">{item.description}</span>
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-center w-full">
        <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/10 backdrop-blur-sm">
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
  onGoToMeditation, 
  onGoToBilateral,
  onBack 
}: HomeScreenProps) {
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
      // וידוא שהשם המדויק נשלח ל-Flow
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
  const placeholderText = displayGender === "f" ? "ספרי לי מה עובר עלייך..." : "ספר לי מה עובר עליך...";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-slate-950 text-white pt-8 pb-10 px-6 relative z-10 overflow-hidden transition-all duration-1000 ease-in-out">
        <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-6">
          <div className="w-full flex justify-between items-center mb-4">
             <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1.5">
                <Logo variant="icon" />
              </div>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">המצפן הרגשי</p>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationCenter />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setIsProfileOpen(true)} className="w-10 h-10 rounded-full border-2 border-white/10 hover:border-indigo-500 transition-all overflow-hidden relative" aria-label="פרופיל והגדרות">
                    {user?.photoURL ? (
                      <Image src={user.photoURL} alt="פרופיל אישי" width={40} height={40} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
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

          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-black text-white tracking-tight leading-tight">{welcomeText}</h2>
            <p className="text-sm font-medium text-white/50">{subActionText}</p>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 -mt-12 relative z-20">
        
        {recommendation && recommendation.isCrisis ? (
          <div className="mt-6 p-8 bg-rose-50 rounded-[2.5rem] border-2 border-rose-200 shadow-xl animate-in fade-in zoom-in duration-500 space-y-8" dir="rtl">
            <div className="flex items-center gap-4 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-black">סיוע ותמיכה מיידית</h3>
            </div>
            
            <p className="text-slate-800 leading-relaxed font-bold text-lg whitespace-pre-line">
              {recommendation.explanation}
            </p>

            <div className="grid gap-4">
              <a href="tel:1201" className="flex items-center justify-between p-5 bg-white border border-rose-200 rounded-2xl hover:bg-rose-100 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone size={20} />
                  </div>
                  <div className="text-right">
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
                  <div className="text-right">
                    <span className="block font-black text-emerald-700">מד"א - מצבי חירום רפואיים</span>
                    <span className="block text-xs text-slate-500">חיוג חירום: 101</span>
                  </div>
                </div>
                <ChevronLeft size={20} className="text-rose-300" />
              </a>

              <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4 text-right">
                <UserPlus className="text-indigo-500 shrink-0" size={24} />
                <p className="text-sm font-bold text-indigo-900 leading-relaxed">
                  {displayGender === "f" 
                    ? `${displayName}, בבקשה פני עכשיו לחבר קרוב, בן משפחה או אדם שאת סומכת עליו. אל תישארי לבד עם התחושות האלה.`
                    : `${displayName}, בבקשה פנה עכשיו לחבר קרוב, בן משפחה או אדם שאתה סומך עליו. אל תישאר לבד עם התחושות האלה.`
                  }
                </p>
              </div>
            </div>

            <button 
              onClick={handleResetChat}
              className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
            >
              סגור וחזור לכלים הרגילים
            </button>
          </div>
        ) : messages.length > 0 ? (
          <div className="mb-6 bg-white rounded-[2.5rem] border border-indigo-100 shadow-2xl shadow-indigo-500/10 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col overflow-hidden h-[550px] relative" dir="rtl">
            <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-slate-50/30 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <MessageCircle size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">הדיאלוג החכם</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">מלווה אותך צעד אחר צעד</span>
                </div>
              </div>
              <button onClick={handleResetChat} className="text-[10px] font-black text-slate-300 hover:text-slate-500 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-100">
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
                    "w-9 h-9 rounded-full shrink-0 flex items-center justify-center overflow-hidden border-2 shadow-sm",
                    msg.role === 'user' ? "border-white bg-slate-100" : "border-indigo-100 bg-indigo-600"
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
                      ? "bg-slate-50 text-slate-700 rounded-tr-none" 
                      : "bg-indigo-50 text-indigo-900 rounded-tl-none font-bold"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isSearching && (
                <div className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center p-1.5 border-2 border-indigo-100">
                    <Logo variant="icon" />
                  </div>
                  <div className="bg-indigo-50 h-12 w-32 rounded-2xl rounded-tl-none" />
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
                          className="px-4 py-2 bg-white border border-indigo-100 rounded-full text-xs font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                  {recommendation.options && recommendation.options.length > 0 && (
                    <div className="grid gap-3 pt-2 animate-in fade-in duration-1000">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2">{displayName}, הנה כמה דרכים שיכולות לעזור עכשיו:</span>
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
                          className="group w-full p-4 bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-[1.5rem] transition-all text-right flex items-center justify-between active:scale-[0.98] shadow-sm"
                        >
                          <div className="space-y-0.5">
                            <span className="block font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">{opt.label}</span>
                            <span className="block text-[11px] text-slate-500 font-medium">{opt.description}</span>
                          </div>
                          <ChevronLeft className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={16} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div ref={chatEndRef} className="h-4 shrink-0" />
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 shrink-0">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative glass-panel rounded-2xl p-1.5 flex items-center shadow-md overflow-hidden bg-white/90">
                  <input 
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder={recommendation?.needsMoreInfo ? "הוסף/י עוד פרטים..." : "מה תרצה/י להוסיף?"} 
                    className="flex-1 bg-transparent px-4 py-3 focus:outline-none font-medium text-slate-900 placeholder:text-slate-400 text-sm text-right" dir="rtl"
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
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-25"></div>
            <div className="relative glass-panel rounded-[2rem] p-2 flex items-center diffused-shadow overflow-hidden min-h-[72px] bg-white">
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
                className="flex-1 bg-transparent px-4 py-5 focus:outline-none font-medium text-slate-900 placeholder:text-slate-400 text-sm text-right" dir="rtl"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    type="submit" 
                    disabled={isSearching || !searchQuery.trim()} 
                    className="w-14 h-14 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 transition-all"
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

      <div className="max-w-xl mx-auto px-6 mt-6 space-y-10 pb-20">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Sparkles size={14} className="text-indigo-600" />
            <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase text-right">כלים אסטרטגיים</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={onGoToJournal}
                  className="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center gap-2 active:scale-95 group"
                  aria-label="יומן מחשבות CBT"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <BookText size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[11px] font-black text-slate-900">יומן מחשבות</span>
                    <span className="block text-[8px] text-slate-400 font-bold">CBT</span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>תרגול מודל אפר"ת</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={onGoToBilateral}
                  className="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center gap-2 active:scale-95 group"
                  aria-label="עיבוד בילטרלי"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Zap size={20} className="fill-current" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[11px] font-black text-slate-900">עיבוד בילטרלי</span>
                    <span className="block text-[8px] text-slate-400 font-bold">EMDR Style</span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>ויסות באמצעות גירוי דו-צדדי</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => onGoToMeditation()}
                  className="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center gap-2 active:scale-95 group"
                  aria-label="מרחב המדיטציה"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Flower2 size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[11px] font-black text-slate-900">מדיטציה</span>
                    <span className="block text-[8px] text-slate-400 font-bold">שקט פנימי</span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>מרחב השקט והמיינדפולנס</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {TOPIC_SECTIONS.map((section) => (
          <div key={section.id} className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <section.icon size={14} style={{ color: section.hue }} />
              <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase text-right">
                {section.title}
              </h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory flex-row-reverse -mx-6 px-6" dir="rtl">
              {section.items.map((item) => (
                <UnifiedHomeCard
                  key={item.id}
                  item={item}
                  onStartGuided={onStartGuided}
                  onGoToMeditation={onGoToMeditation}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Compass size={14} className="text-indigo-600" />
            <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase text-right">כל הנושאים והתחומים</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory flex-row-reverse -mx-6 px-6" dir="rtl">
            {CATS.map((c) => (
              <div key={c.key} className="snap-start shrink-0 w-[42vw] xs:w-[45vw] sm:w-[200px]">
                <CategoryCard 
                  category={c} 
                  count={(BANK[c.key] || []).length} 
                  completedCount={(completedCards as string[]).filter((id: string) => id.startsWith(`${c.key}:`)).length}
                  onClick={onSelectCategory}
                />
              </div>
            ))}
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-700">
            <div className="flex items-center gap-2 px-2">
              <Anchor size={14} className="text-rose-500" />
              <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase text-right">העוגנים שלי</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x flex-row-reverse -mx-6 px-6" dir="rtl">
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