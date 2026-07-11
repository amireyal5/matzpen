"use client";

import { useState, useEffect, useRef } from "react";
import { CATS, BANK } from "@/lib/data";
import { Compass, Sparkles, User as UserIcon, Anchor, BookText, Flower2, Zap, ArrowLeft, ChevronLeft, Phone, AlertTriangle, UserPlus, X, MessageCircle, Loader2, Play, Music, Wind, Moon, Sun, Brain, LifeBuoy, Cloud, Target, Heart, Shield } from "lucide-react";
import { getRecommendation, RecommendationOutput } from "@/ai/flows/recommendation-flow";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CrisisHelpDialog from "@/components/CrisisHelpDialog";
import { doc, query, collection, where, getDocs } from "firebase/firestore";
import { LegalDialog } from "@/components/LegalDialogs";
import ProfileDialog from "@/components/ProfileDialog";
import CategoryCard from "@/components/CategoryCard";
import NotificationCenter from "@/components/NotificationCenter";
import MoodCheckIn from "@/components/MoodCheckIn";
import OnboardingDialog from "@/components/OnboardingDialog";
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
  onGoToCalmingHub: () => void;
  onGoToAssessment: (type: "gad7" | "phq9") => void;
  onGoToPtsdInfo: () => void;
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
  isLight?: boolean;
}

function UnifiedHomeCard({ item, onStartGuided, onGoToSounds, onGoToBreathing, isLight }: UnifiedHomeCardProps) {
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
      className={cn(
        "snap-start shrink-0 w-[72vw] xs:w-[75vw] sm:w-[260px] lg:w-full h-36 rounded-[2rem] overflow-hidden border backdrop-blur-xl transition-all duration-500 relative p-5 flex flex-col justify-between text-right group active:scale-95",
        isLight 
          ? "bg-white/60 border-slate-200/60 shadow-sm hover:border-indigo-400/50 hover:shadow-indigo-100/50" 
          : "bg-slate-900/40 border-white/5 shadow-lg hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
      )}
    >
      <div className="absolute inset-0 z-0">
        {!imageError ? (
          <Image
            src={item.image}
            alt={item.label}
            fill
            className={cn(
              "object-cover transition-all duration-700 group-hover:scale-105",
              isLight 
                ? "brightness-[0.9] contrast-[0.95] group-hover:brightness-[0.95]" 
                : "brightness-[0.3] group-hover:brightness-[0.4]"
            )}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-500", isLight ? "opacity-30" : "opacity-60", item.gradient)} />
        )}
        <div className={cn(
          "absolute inset-0 transition-colors duration-500",
          isLight 
            ? "bg-gradient-to-t from-white via-white/85 to-white/10" 
            : "bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"
        )} />
      </div>

      <div className="relative z-10 flex justify-between items-start w-full">
        <div 
          className={cn(
            "w-10 h-10 rounded-full border flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform duration-300",
            isLight 
              ? "bg-white/80 border-slate-200/60 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600" 
              : "bg-white/10 border-white/10 text-white"
          )}
        >
          {item.type === "practice" ? (
            <Play size={16} className="fill-current translate-x-[1px]" />
          ) : (
            <IconComponent size={16} />
          )}
        </div>
        <div className="text-right pr-2">
          <span className={cn("block font-black text-sm leading-snug", isLight ? "text-slate-900" : "text-white")}>{item.label}</span>
          <span className={cn("block text-[10px] font-bold opacity-90 line-clamp-2 mt-0.5 leading-tight", isLight ? "text-slate-600" : "text-slate-300")}>{item.description}</span>
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-center w-full">
        <span className={cn(
          "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-sm",
          isLight 
            ? "bg-slate-100/90 text-slate-700 border-slate-200/50" 
            : "bg-white/10 text-slate-350 border-white/5"
        )}>
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
  onGoToCalmingHub,
  onGoToAssessment,
  onGoToPtsdInfo,
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastModelMsgRef = useRef<HTMLDivElement>(null);

  const [activeActionJournal, setActiveActionJournal] = useState<any>(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      const hasDismissed = localStorage.getItem("matzpen_ios_prompt_dismissed") === "true";
      if (isIOS && !isStandalone && !hasDismissed) {
        setShowIosPrompt(true);
      }
    }
  }, []);

  const handleDismissIosPrompt = () => {
    localStorage.setItem("matzpen_ios_prompt_dismissed", "true");
    setShowIosPrompt(false);
  };
  
  const { user } = useUser();
  const firestore = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "userProfiles", user.uid);
  }, [user, firestore]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc(profileRef);

  const showOnboarding = !isProfileLoading && !!profileData && !profileData.onboardingCompleted;

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    const timer = setTimeout(() => {
      if (isSearching || lastMsg.role === 'user') {
        // הודעה שנשלחה / טעינה בתהליך - גלילה לתחתית כדי להראות את ההודעה החדשה ומחוון הטעינה
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        // תשובה חדשה מהעוזר - להראות את תחילת התשובה, לא לקפוץ לתחתית אחרי כפתורי ההצעות
        lastModelMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isSearching, recommendation]);

  // Center scroll when chatbot opens
  useEffect(() => {
    if (messages.length > 1) {
      const timer = setTimeout(() => {
        chatContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Center scroll on crisis detection
  useEffect(() => {
    if (recommendation?.isCrisis) {
      const timer = setTimeout(() => {
        chatContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [recommendation?.isCrisis]);

  // Fetch active CBT action steps on mount
  useEffect(() => {
    if (!user || !firestore) return;
    const q = query(
      collection(firestore, "thoughtJournals"),
      where("userId", "==", user.uid),
      where("actionCompleted", "==", false)
    );
    getDocs(q).then((snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (list.length > 0) {
        setActiveActionJournal(list[0]);
      } else {
        setActiveActionJournal(null);
      }
    }).catch(err => {
      console.error("Failed to load active action steps:", err);
    });
  }, [user, firestore]);

  const handleCompleteAction = () => {
    if (!activeActionJournal || !firestore) return;
    const docRef = doc(firestore, "thoughtJournals", activeActionJournal.id);
    updateDocumentNonBlocking(docRef, {
      actionCompleted: true,
      actionCompletedAt: new Date().toISOString()
    });
    setActiveActionJournal(null);
  };

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

  const welcomeText = displayGender === "f" ? `מה יעזור לך כרגע, ${displayName}?` : `מה יעזור לך כרגע, ${displayName}?`;
  const subActionText = displayGender === "f" ? "בחרי כלי להקלה מהירה" : "בחר כלי להקלה מהירה";
  const placeholderText = displayGender === "f" ? "רוצה לספר לי עוד במילים שלך?" : "רוצה לספר לי עוד במילים שלך?";

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
        {showIosPrompt && (
          <div className="max-w-xl lg:max-w-4xl mx-auto px-6 pt-4 relative z-25">
            <div className={cn(
              "rounded-[2rem] p-5 border-2 shadow-2xl relative overflow-hidden animate-in slide-in-from-top duration-500",
              isLight 
                ? "bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100/50 border-indigo-200 text-slate-800" 
                : "bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-indigo-950/20 border-indigo-900/50 text-slate-200"
            )}>
              <button 
                onClick={handleDismissIosPrompt}
                className={cn("absolute top-4 left-4 p-1.5 rounded-full border transition-all active:scale-90",
                  isLight ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-500" : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-400"
                )}
                aria-label="סגור הנחיה"
              >
                <X size={14} />
              </button>

              <div className="flex gap-4 items-start pl-8 text-right" dir="rtl">
                <div className="p-3.5 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                  <span>📱</span>
                </div>
                
                <div className="space-y-1.5 min-w-0">
                  <h3 className="text-sm font-black tracking-tight text-indigo-650 dark:text-indigo-400">התקנת אפליקציה באייפון</h3>
                  <p className="text-xs leading-relaxed opacity-90 font-bold">
                    כדי להשתמש באפליקציה במסך מלא, עם ביצועים מהירים יותר וגישה ישירה ממסך הבית:
                  </p>
                  <ul className="text-xs space-y-1.5 pt-2 text-slate-600 dark:text-slate-300 pr-1">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                      <span>לחצו על כפתור השיתוף בספארי (ריבוע עם חץ למעלה 📤)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                      <span>גללו מטה ובחרו ב-<strong>'הוסף למסך הבית'</strong> (Add to Home Screen 📱)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

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
                <CrisisHelpDialog
                  gender={displayGender}
                  theme={theme}
                  trigger={
                    <button
                      className={cn(
                        "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-90 font-black text-xs shadow-sm",
                        isLight
                          ? "bg-rose-600 border-rose-600 text-white hover:bg-rose-700 hover:border-rose-700"
                          : "bg-rose-950/40 border-rose-900/50 text-rose-300 hover:bg-rose-900/40 hover:text-white"
                      )}
                      aria-label="עזרה ראשונה נפשית (SOS)"
                    >
                      <span className="animate-pulse">SOS</span>
                    </button>
                  }
                />

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
                    <div className={cn(
                      "w-full h-full rounded-full border-4 shadow-2xl flex items-center justify-center p-5 relative overflow-hidden",
                      isLight 
                        ? "bg-indigo-50 border-white text-indigo-600 shadow-indigo-100" 
                        : "bg-indigo-950/40 border-white/10 text-indigo-400"
                    )}>
                      <Logo variant="icon" className="w-full h-full" />
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

        {/* Daily Mood Check-in */}
        <div className="max-w-xl lg:max-w-4xl mx-auto px-6 relative z-20 mb-6">
          <MoodCheckIn
            profileData={profileData}
            profileRef={profileRef}
            gender={displayGender}
            isLight={isLight}
            onSelectCategory={onSelectCategory}
            onGoToBreathing={onGoToBreathing}
          />
        </div>


        {/* Active Action Step (Behavioral Activation) - Archived for PTSD focus
        {activeActionJournal && (
          <div className="max-w-xl lg:max-w-4xl mx-auto px-6 relative z-20 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <div
              className={cn(
                "rounded-[2rem] p-5 border backdrop-blur-xl shadow-sm flex items-center justify-between gap-4",
                isLight ? "bg-indigo-50/80 border-indigo-100 text-indigo-900" : "bg-indigo-950/20 border-indigo-500/20 text-indigo-200"
              )}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                  <Target size={18} className="animate-pulse" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] font-black uppercase tracking-widest leading-none text-indigo-400">ההתחייבות המעשית שלי</span>
                  <p className="text-xs font-bold leading-relaxed truncate mt-1">
                    "{activeActionJournal.actionStep}"
                  </p>
                </div>
              </div>
              <button
                onClick={handleCompleteAction}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow transition-all active:scale-95 shrink-0"
              >
                ביצעתי! ✓
              </button>
            </div>
          </div>
        )}
        */}

        {/* Clinical Assessment & Cognitive Tools Bento Section - Archived for PTSD focus
        <div className="max-w-xl lg:max-w-4xl mx-auto px-6 relative z-20 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => onGoToAssessment("gad7")}
              className={cn(
                "rounded-[2rem] p-5 border backdrop-blur-xl shadow-sm text-right flex flex-col justify-between h-32 transition-all active:scale-95 group hover:border-indigo-400/50",
                isLight ? "bg-white/70 border-slate-200" : "bg-slate-900/40 border-white/5"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <span className={cn("text-[9px] font-black uppercase tracking-widest", isLight ? "text-indigo-600" : "text-indigo-400")}>
                  הערכת חרדה
                </span>
                <Sparkles size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black">שאלון GAD-7</h4>
                <p className={cn("text-[10px] font-bold leading-normal", isLight ? "text-slate-400" : "text-slate-500")}>
                  בחינת רמות מתח ודאגה בשבועיים האחרונים
                </p>
              </div>
            </button>

            <button
              onClick={() => onGoToAssessment("phq9")}
              className={cn(
                "rounded-[2rem] p-5 border backdrop-blur-xl shadow-sm text-right flex flex-col justify-between h-32 transition-all active:scale-95 group hover:border-purple-400/50",
                isLight ? "bg-white/70 border-slate-200" : "bg-slate-900/40 border-white/5"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <span className={cn("text-[9px] font-black uppercase tracking-widest", isLight ? "text-purple-600" : "text-purple-400")}>
                  מדד מצב רוח
                </span>
                <Heart size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black">שאלון PHQ-9</h4>
                <p className={cn("text-[10px] font-bold leading-normal", isLight ? "text-slate-400" : "text-slate-500")}>
                  בדיקת רווחה נפשית, אנרגיה ואיזון פנימי
                </p>
              </div>
            </button>

            <button
              onClick={onGoToJournal}
              className={cn(
                "rounded-[2rem] p-5 border backdrop-blur-xl shadow-sm text-right flex flex-col justify-between h-32 transition-all active:scale-95 group hover:border-amber-400/50",
                isLight ? "bg-white/70 border-slate-200" : "bg-slate-900/40 border-white/5"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <span className={cn("text-[9px] font-black uppercase tracking-widest", isLight ? "text-amber-600" : "text-amber-400")}>
                  עבודה קוגניטיבית
                </span>
                <Brain size={16} className="text-amber-455 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black">יומן מחשבות (אפר"ת)</h4>
                <p className={cn("text-[10px] font-bold leading-normal", isLight ? "text-slate-400" : "text-slate-500")}>
                  פירוק לופים מחשבתיים וניסוח פרשנות מאוזנת
                </p>
              </div>
            </button>
          </div>
        </div>
        */}

        {/* PTSD Information Row */}
        <div className="max-w-md mx-auto px-6 relative z-20 mb-6">
          <button
            onClick={onGoToPtsdInfo}
            className={cn(
              "w-full rounded-[2rem] p-5 border backdrop-blur-xl shadow-sm text-right flex items-center justify-between transition-all active:scale-95 group hover:border-indigo-500/50",
              isLight ? "bg-white/70 border-slate-200" : "bg-slate-900/40 border-white/5"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <BookText size={24} />
              </div>
              <div className="text-right">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">להבין פוסט-טראומה (PTSD)</h4>
                <p className={cn("text-[10px] font-bold leading-normal", isLight ? "text-slate-500" : "text-slate-400")}>
                  מידע, סימפטומים נפוצים ודרכי התמודדות
                </p>
              </div>
            </div>
            <ChevronLeft size={20} className="text-slate-500 group-hover:text-indigo-500 transition-colors" />
          </button>
        </div>

        {/* Intelligent Dialogue Section */}
        <div className="max-w-xl lg:max-w-4xl mx-auto px-6 relative z-20">
          {recommendation && recommendation.isCrisis ? (
            <div ref={chatContainerRef} className="mt-6 p-8 bg-rose-955/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-rose-500/30 shadow-2xl animate-in fade-in zoom-in duration-500 space-y-8" dir="rtl">
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
            <div ref={chatContainerRef} className="mb-6 bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col overflow-hidden h-[550px] relative" dir="rtl">
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <MessageCircle size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">הדיאלוג החכם</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">מלווה אותך צעד אחר צעד</span>
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
                  <div
                    key={i}
                    ref={i === messages.length - 1 && msg.role === 'model' ? lastModelMsgRef : undefined}
                    className={cn(
                      "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
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
                      placeholder={
                        recommendation?.needsMoreInfo
                          ? (displayGender === "f" ? "הוסיפי עוד פרטים..." : "הוסף עוד פרטים...")
                          : (displayGender === "f" ? "מה תרצי להוסיף?" : "מה תרצה להוסיף?")
                      }
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
                    <div className={cn(
                      "w-full h-full rounded-full border-2 border-indigo-500 shadow-lg flex items-center justify-center p-2 relative overflow-hidden",
                      isLight ? "bg-indigo-50 text-indigo-600" : "bg-indigo-950/40 text-indigo-400"
                    )}>
                      <Logo variant="icon" className="w-full h-full" />
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
          
          {/* Strategic Tools Bento Grid - Replaced with 3 main goal actions for active PTSD / Panic Relief */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Compass size={14} className="text-indigo-400" />
              <h3 className={cn("text-[10px] font-black tracking-widest uppercase text-right", isLight ? "text-slate-500" : "text-slate-400")}>כלים מהירים</h3>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Goal 1: עזרה להירגע */}
              <button
                onClick={onGoToCalmingHub}
                className={cn(
                  "w-full p-6 rounded-[2rem] border backdrop-blur-xl shadow-lg transition-all duration-300 flex flex-col justify-between text-right active:scale-95 group relative overflow-hidden min-h-[160px]",
                  isLight 
                    ? "bg-emerald-50/75 border-emerald-200/60 hover:bg-emerald-100/70 hover:border-emerald-350 shadow-emerald-100/10" 
                    : "bg-emerald-950/20 border-emerald-900/30 hover:bg-emerald-950/30 hover:border-emerald-500/40 text-emerald-100"
                )}
              >
                <div className="flex justify-between items-start w-full">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-110 duration-300",
                    isLight ? "bg-white text-emerald-600" : "bg-emerald-500/10 text-emerald-400"
                  )}>
                    <Wind size={24} />
                  </div>
                  <ChevronLeft size={16} className={isLight ? "text-emerald-600/50" : "text-emerald-400/50"} />
                </div>
                <div className="space-y-1 mt-4 z-10">
                  <h4 className={cn("text-sm font-black leading-tight", isLight ? "text-slate-900" : "text-white")}>עזרה להירגע</h4>
                  <p className={cn("text-[10px] font-bold leading-normal opacity-90", isLight ? "text-slate-500" : "text-slate-400")}>
                    4 כלים מהירים להפחתת מתח וויסות הצפה
                  </p>
                </div>
              </button>

              {/* Goal 2: עזרה בשינה */}
              <button
                onClick={() => onGoToSounds("dreamscape")}
                className={cn(
                  "w-full p-6 rounded-[2rem] border backdrop-blur-xl shadow-lg transition-all duration-300 flex flex-col justify-between text-right active:scale-95 group relative overflow-hidden min-h-[160px]",
                  isLight 
                    ? "bg-indigo-50/75 border-indigo-200/60 hover:bg-indigo-100/70 hover:border-indigo-350 shadow-indigo-100/10" 
                    : "bg-indigo-950/20 border-indigo-900/30 hover:bg-indigo-950/30 hover:border-indigo-500/40 text-indigo-100"
                )}
              >
                <div className="flex justify-between items-start w-full">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-110 duration-300",
                    isLight ? "bg-white text-indigo-600" : "bg-indigo-500/10 text-indigo-400"
                  )}>
                    <Moon size={24} />
                  </div>
                  <ChevronLeft size={16} className={isLight ? "text-indigo-650/50" : "text-indigo-400/50"} />
                </div>
                <div className="space-y-1 mt-4 z-10">
                  <h4 className={cn("text-sm font-black leading-tight", isLight ? "text-slate-900" : "text-white")}>עזרה בשינה</h4>
                  <p className={cn("text-[10px] font-bold leading-normal opacity-90", isLight ? "text-slate-500" : "text-slate-400")}>
                    צלילי סביבה ונעימות להרדמות
                  </p>
                </div>
              </button>

              {/* Goal 3: לנקות את הראש */}
              <button
                onClick={() => onGoToBilateral()}
                className={cn(
                  "w-full p-6 rounded-[2rem] border backdrop-blur-xl shadow-lg transition-all duration-300 flex flex-col justify-between text-right active:scale-95 group relative overflow-hidden min-h-[160px]",
                  isLight
                    ? "bg-cyan-50/75 border-cyan-200/60 hover:bg-cyan-100/70 hover:border-cyan-350 shadow-cyan-100/10"
                    : "bg-cyan-950/20 border-cyan-900/30 hover:bg-cyan-950/30 hover:border-cyan-500/40 text-cyan-100"
                )}
              >
                <div className="flex justify-between items-start w-full">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-110 duration-300",
                    isLight ? "bg-white text-cyan-600" : "bg-cyan-500/10 text-cyan-400"
                  )}>
                    <Zap size={24} />
                  </div>
                  <ChevronLeft size={16} className={isLight ? "text-cyan-600/50" : "text-cyan-400/50"} />
                </div>
                <div className="space-y-1 mt-4 z-10">
                  <h4 className={cn("text-sm font-black leading-tight", isLight ? "text-slate-900" : "text-white")}>לנקות את הראש</h4>
                  <p className={cn("text-[10px] font-bold leading-normal opacity-90", isLight ? "text-slate-500" : "text-slate-400")}>
                    עיבוד בילטרלי להרגעת הצפה
                  </p>
                </div>
              </button>

              {/* Goal 4: דמיון מודרך */}
              <button
                onClick={() => onGoToImagery()}
                className={cn(
                  "w-full p-6 rounded-[2rem] border backdrop-blur-xl shadow-lg transition-all duration-300 flex flex-col justify-between text-right active:scale-95 group relative overflow-hidden min-h-[160px]",
                  isLight 
                    ? "bg-violet-50/75 border-violet-200/60 hover:bg-violet-100/70 hover:border-violet-350 shadow-violet-100/10" 
                    : "bg-violet-950/20 border-violet-900/30 hover:bg-violet-950/30 hover:border-violet-500/40 text-violet-100"
                )}
              >
                <div className="flex justify-between items-start w-full">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-110 duration-300",
                    isLight ? "bg-white text-violet-600" : "bg-violet-500/10 text-violet-400"
                  )}>
                    <Sparkles size={24} />
                  </div>
                  <ChevronLeft size={16} className={isLight ? "text-violet-655/50" : "text-violet-400/50"} />
                </div>
                <div className="space-y-1 mt-4 z-10">
                  <h4 className={cn("text-sm font-black leading-tight", isLight ? "text-slate-900" : "text-white")}>דמיון מודרך</h4>
                  <p className={cn("text-[10px] font-bold leading-normal opacity-90", isLight ? "text-slate-500" : "text-slate-400")}>
                    מסעות ויזואליים להרפיה עמוקה
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Topic Sections - Archived for PTSD focus
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
                    isLight={isLight}
                  />
                ))}
              </div>
            </div>
          ))}
          */}

          {/* Categories Grid - Archived for PTSD focus
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
          */}

          {/* Anchors / Favorites - Archived for PTSD focus
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
          */}

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

      <OnboardingDialog
        isOpen={showOnboarding}
        profileRef={profileRef}
        gender={displayGender}
        onComplete={(focusAreaKey) => {
          if (focusAreaKey) {
            if (focusAreaKey === "SLEEP") onGoToSounds();
            else if (focusAreaKey === "IMAGERY") onGoToImagery();
            else if (focusAreaKey === "BILATERAL") onGoToBilateral();
            else onSelectCategory(focusAreaKey);
          }
        }}
      />
    </div>
  );
}