import { SoundId } from "./ambient-sound-engine";
import { AMBIENT_VIDEOS } from "./ambient-videos";

export interface ImageryStep {
  text: string;
  duration: number; // בשניות
  audio?: string; // נתיב לקובץ שמע
}

export interface GuidedImageryJourney {
  id: string;
  title: string;
  description: string;
  tag: string;
  image: string;
  video: string;
  soundId: SoundId;
  icon: "forest" | "ocean" | "clouds";
  steps: ImageryStep[];
}

export const GUIDED_IMAGERY_JOURNEYS: GuidedImageryJourney[] = [
  {
    id: "magic-forest",
    title: "מסע ליער הקסום",
    description: "הליכה דמיונית רגועה בין עצים עתיקים, לחיבור מחדש עם הגוף והנשימה",
    tag: "דימיון מודרך",
    image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=600",
    video: AMBIENT_VIDEOS[0],
    soundId: "mind-relaxation",
    icon: "forest",
    steps: [
      { text: "מצא תנוחה נוחה, ותן לגוף להתרכך אל המשטח שעליו אתה נשען", duration: 20 },
      { text: "דמיין את עצמך הולך בשביל עפר רך, בתוך יער ירוק ועתיק", duration: 25 },
      { text: "האור חודר בעדינות מבין העלים, ומצייר כתמי זהב על הקרקע", duration: 25 },
      { text: "הריח של עץ לח ועלים רטובים ממלא אותך בתחושת רעננות", duration: 25 },
      { text: "שמע את ציוץ הציפורים ואת פכפוך הנחל הקרוב", duration: 25 },
      { text: "עם כל נשימה, הרגש את הגוף משתחרר עוד קצת", duration: 25 },
      { text: "מצא עץ עתיק וגדול, שב לרגליו ותן לגב להישען על גזעו החם", duration: 25 },
      { text: "הרשה לעצמך להישאר כאן, במקום הבטוח הזה, כמה זמן שצריך", duration: 30 },
      { text: "לאט לאט, החזר את תשומת הלב לחלל שבו אתה נמצא", duration: 20 },
      { text: "כשתרגיש מוכן, פקח את עיניך ושא איתך את תחושת השלווה", duration: 20 },
    ],
  },
  {
    id: "ocean-shore",
    title: "מסע לחוף השלווה",
    description: "עמידה דמיונית מול האוקיינוס, לשחרור מתחים בקצב הגלים",
    tag: "דימיון מודרך",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600",
    video: AMBIENT_VIDEOS[1],
    soundId: "calm-peaceful",
    icon: "ocean",
    steps: [
      { text: "עצום את עיניך, ותן לכתפיים לרדת ולהתרכך", duration: 20, audio: "/דימיון מודרך/ocean-shore/1.mp3" },
      { text: "דמיין את עצמך עומד על חוף רחב, החול החם נוגע בכפות הרגליים", duration: 25, audio: "/דימיון מודרך/ocean-shore/2.mp3" },
      { text: "לפניך משתרע האוקיינוס - כחול עמוק, נושם ונע באיטיות", duration: 25, audio: "/דימיון מודרך/ocean-shore/3.mp3" },
      { text: "כל גל שמתקרב לחוף ונסוג בחזרה, מזכיר לך שאפשר לשחרר", duration: 25, audio: "/דימיון מודרך/ocean-shore/4.mp3" },
      { text: "השמש מחממת את העור, ורוח קלה מלטפת את הפנים", duration: 25, audio: "/דימיון מודרך/ocean-shore/5.mp3" },
      { text: "עם כל נשימה פנימה, שאף רוגע מהאוויר המלוח", duration: 25, audio: "/דימיון מודרך/ocean-shore/6.mp3" },
      { text: "עם כל נשיפה, השאר מאחור עוד קצת ממה שכבד", duration: 25, audio: "/דימיון מודרך/ocean-shore/7.mp3" }
    ],
  },
  {
    id: "among-clouds",
    title: "מסע בין העננים",
    description: "ריחוף דמיוני מעל העננים, להרפיה עמוקה ותחושת הקלה",
    tag: "דימיון מודרך",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600",
    video: AMBIENT_VIDEOS[2],
    soundId: "ancient-flow",
    icon: "clouds",
    steps: [
      { text: "התמקם בנוחות, ותן למשקל הגוף לשקוע למקום שעליו אתה יושב", duration: 20 },
      { text: "דמיין את עצמך מתרחק לאט מהקרקע, קל כנוצה", duration: 25 },
      { text: "מתחתיך מתפרשים עננים רכים ולבנים, כמו כריות של אוויר", duration: 25 },
      { text: "אתה שוכב על אחד מהם, מרגיש אותו תומך בך בעדינות", duration: 25 },
      { text: "מעליך - שמיים פתוחים, רחבים ושקטים", duration: 25 },
      { text: "כל מחשבה שעולה - תן לה לחלוף לידך כעננה קטנה, ולהמשיך לדרכה", duration: 30 },
      { text: "אתה לא צריך לעשות כלום, רק להיות כאן, מוחזק", duration: 25 },
      { text: "תן לתחושת הרוגע הזו לחלחל לכל תא בגוף", duration: 25 },
      { text: "לאט לאט, העננה מתחילה לרדת בעדינות חזרה לכיוון הקרקע", duration: 25 },
      { text: "כשתרגיש מוכן, פתח את העיניים ושמור את התחושה הזו איתך", duration: 20 },
    ],
  },
];
