import { SoundId } from "./ambient-sound-engine";

export interface BreathingExercise {
  id: string;
  title: string;
  description: string;
  rhythmText: string;
  style: "glow-circle" | "flower" | "mandala" | "nebula" | "grounding-glow";
  pattern: {
    type: "inhale" | "hold" | "exhale";
    label: string;
    duration: number;
  }[];
  totalDuration: number;
  bgGradient: string;
  image: string;
  recommendedSoundId?: SoundId;
}

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: "ptsd-grounding",
    title: "ויסות הצפה (קרקוע מרגיע)",
    description: "תרגיל נשימה מווסת ללא עצירות נשימה, להרגעת מערכת העצבים והפחתת עוררות יתר. משלב אוטומטית מוזיקת שלווה סביבתית ברקע.",
    rhythmText: "שאף 4 ש׳ • נשוף 8 ש׳",
    style: "grounding-glow",
    pattern: [
      { type: "inhale", label: "שאף אוויר בעדינות...", duration: 4 },
      { type: "exhale", label: "נשוף והרפה את הגוף...", duration: 8 }
    ],
    totalDuration: 180,
    bgGradient: "from-amber-950 via-slate-900 to-slate-950",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600",
    recommendedSoundId: "ambient-calm"
  },
  {
    id: "calm-circle",
    title: "נשימה מרגיעה (מעגל זוהר)",
    description: "תרגול נשימה מינימליסטי להפחתת מתח מיידית והרגעת מערכת העצבים.",
    rhythmText: "שאף 4 ש׳ • החזק 3 ש׳ • נשוף 6 ש׳",
    style: "glow-circle",
    pattern: [
      { type: "inhale", label: "שאף אוויר...", duration: 4 },
      { type: "hold", label: "החזק את הנשימה...", duration: 3 },
      { type: "exhale", label: "נשוף לאט...", duration: 6 }
    ],
    totalDuration: 120,
    bgGradient: "from-blue-950 via-slate-900 to-slate-950",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600"
  },
  {
    id: "nature-flower",
    title: "צמיחה והתחדשות (פרח מופשט)",
    description: "תרגיל נשימה סימטרי ומחזורי המדמה פתיחה וסגירה של פרח לריכוז ואיזון פנימי.",
    rhythmText: "שאף 5 ש׳ • נשוף 5 ש׳",
    style: "flower",
    pattern: [
      { type: "inhale", label: "שאף ופתח את הלב...", duration: 5 },
      { type: "exhale", label: "נשוף והרפה...", duration: 5 }
    ],
    totalDuration: 120,
    bgGradient: "from-teal-950 via-slate-900 to-slate-950",
    image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=600"
  },
  {
    id: "box-mandala",
    title: "נשימת קופסה (Navy SEALs)",
    description: "שיטת ה-Navy SEALs לריכוז תחת לחץ קיצוני. יוצרת איזון מושלם בין חמצן לפחמן דו-חמצני, מחדדת פוקוס ומאפסת את מערכת העצבים.",
    rhythmText: "שאף 4 ש׳ • החזק 4 ש׳ • נשוף 4 ש׳ • החזק 4 ש׳",
    style: "mandala",
    pattern: [
      { type: "inhale", label: "שאף...", duration: 4 },
      { type: "hold", label: "החזק...", duration: 4 },
      { type: "exhale", label: "נשוף...", duration: 4 },
      { type: "hold", label: "החזק ריק...", duration: 4 }
    ],
    totalDuration: 240,
    bgGradient: "from-purple-950 via-slate-900 to-slate-950",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600"
  },
  {
    id: "cosmic-nebula",
    title: "הרפיה עמוקה לשינה (ערפילית קוסמית)",
    description: "שיטת 4-7-8 המפורסמת להרגעת הגוף לפני שינה, הפגת חרדות וכניסה למדיטציה עמוקה.",
    rhythmText: "שאף 4 ש׳ • החזק 7 ש׳ • נשוף 8 ש׳",
    style: "nebula",
    pattern: [
      { type: "inhale", label: "שאף מהאף...", duration: 4 },
      { type: "hold", label: "החזק בריאות מלאות...", duration: 7 },
      { type: "exhale", label: "נשוף מהפה...", duration: 8 }
    ],
    totalDuration: 300,
    bgGradient: "from-indigo-950 via-slate-900 to-slate-950",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600"
  }
];
