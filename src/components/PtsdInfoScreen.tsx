"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDownCircle,
  Shield,
  Brain,
  Eye,
  LogOut,
  CloudRain,
  AlertTriangle,
  ListChecks,
  ChevronLeft,
  Zap,
  UserMinus,
  Frown,
  HeartCrack,
  Wine,
  Activity,
  Moon,
  EyeOff,
  Footprints,
  XCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PtsdInfoScreenProps {
  onBack: () => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

interface SubTopic {
  id: string;
  title: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  content: string;
  dontDo?: string[];
  doInstead?: string[];
  highlight?: string;
}

interface MainPage {
  id: number;
  kind: "intro" | "cluster" | "closing";
  title: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  intro: string;
  bridge?: string;
  navLabel?: string;
  symptoms?: string[];
  relatedTopics?: string[];
}

export default function PtsdInfoScreen({ onBack, theme = "light", toggleTheme }: PtsdInfoScreenProps) {
  const isLight = theme === "light";
  const [currentMain, setCurrentMain] = useState(0);
  const [isIrtDialogOpen, setIsIrtDialogOpen] = useState(false);
  const [subTopicId, setSubTopicId] = useState<string | null>(null);

  const mainPages: MainPage[] = [
    {
      id: 0,
      kind: "intro",
      title: "מה זה פוסט-טראומה?",
      icon: Shield,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
      intro:
        "פוסט-טראומה היא תגובה נפשית שעלולה להתפתח לאחר חשיפה לאירוע קיצוני, מסכן חיים או מאיים - כמו קרב, פיגוע או תאונה קשה. מחקרים בהדמיית מוח מצביעים על כך שאצל חלק מהאנשים שחוו טראומה, נצפית פעילות משתנה באזורים במוח שאחראים על עיבוד זיכרון ועל ויסות פחד, מה שעשוי להסביר מדוע הגוף ממשיך להגיב לעיתים כאילו הסכנה עדיין קיימת בהווה. חשוב להדגיש: זהו מידע כללי בלבד ולא כלי לאבחון עצמי - אבחנה נעשית אך ורק על ידי איש מקצוע מוסמך.",
      bridge:
        "בעמודים הבאים נעבור יחד על ארבע הקבוצות המרכזיות של תסמינים שמופיעים אחרי אירוע קשה. לצד כל קבוצה תמצאו גם קישורים להרחבה - עם הסברים פשוטים על מה שבדרך כלל לא עוזר, ומה כן.",
    },
    {
      id: 1,
      kind: "cluster",
      title: "כשהזיכרון חוזר בלי רשות",
      navLabel: "לזיכרונות שחוזרים",
      icon: Eye,
      iconColor: "text-cyan-500",
      iconBg: "bg-cyan-500/10",
      intro:
        "האירוע הטראומטי לא נשאר בעבר אלא חוזר ו'פולש' להווה, בלי שליטה ובלי הזמנה.",
      symptoms: [
        "זיכרונות פולשניים וחוזרים של האירוע, שעולים ללא רצון וללא התראה",
        "סיוטי לילה חוזרים בתוכן הקשור לאירוע",
        "פלאשבקים - תחושה או פעולה כאילו האירוע מתרחש שוב ברגע זה",
        "מצוקה נפשית חזקה מול תזכורות (טריגרים) הדומות לאירוע",
        "תגובות גופניות חדות - דופק מהיר, הזעה, קוצר נשימה - מול תזכורות לאירוע",
      ],
      relatedTopics: ["triggers"],
    },
    {
      id: 2,
      kind: "cluster",
      title: "כשמנסים להימנע מהכאב",
      navLabel: "להימנעות",
      icon: LogOut,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
      intro:
        "כדי לא להיפגש עם הכאב, הנפש לומדת להתרחק - ממחשבות, מאנשים, וממקומות.",
      symptoms: [
        "הימנעות ממחשבות, מרגשות או מתחושות גופניות המזכירות את האירוע",
        "הימנעות מאנשים, ממקומות, משיחות, מפעילויות או ממצבים שמעוררים זיכרון של האירוע",
      ],
      relatedTopics: ["isolation", "avoidanceTreatment"],
    },
    {
      id: 3,
      kind: "cluster",
      title: "כשהמחשבה והלב משתנים",
      navLabel: "למחשבה ולמצב הרוח",
      icon: CloudRain,
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-500/10",
      intro:
        "לצד הזיכרון הכואב, נוצרים לעיתים שינויים עמוקים יותר באופן שבו האדם תופס את עצמו, את אחרים ואת העולם.",
      symptoms: [
        "קושי לזכור פרטים מרכזיים מהאירוע (שאינו נובע מפגיעת ראש או משימוש בחומרים)",
        "אמונות שליליות ומתמשכות לגבי העצמי, אחרים או העולם",
        "מחשבות מעוותות ומתמשכות על סיבת האירוע או תוצאותיו, המובילות להאשמה עצמית או להאשמת אחרים",
        "מצב רגשי שלילי ומתמשך - פחד, אימה, כעס, אשמה או בושה",
        "ירידה ניכרת בעניין או בהשתתפות בפעילויות שהיו משמעותיות בעבר",
        "תחושת ניכור וריחוק מאנשים קרובים",
        "קושי מתמשך לחוות רגשות חיוביים כמו שמחה, אהבה או סיפוק",
      ],
      relatedTopics: ["guilt", "numbness", "shameHiding"],
    },
    {
      id: 4,
      kind: "cluster",
      title: "כשהגוף נשאר במצב הכן",
      navLabel: "לדריכות הגוף",
      icon: AlertTriangle,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-500/10",
      intro:
        "מערכת העצבים נותרת 'דרוכה', כאילו הסכנה עדיין אורבת מעבר לפינה.",
      symptoms: [
        "עצבנות ניכרת והתפרצויות זעם, לרוב כלפי אנשים או חפצים, עם פרובוקציה מועטה או ללא פרובוקציה",
        "התנהגות פזיזה או הרסנית-עצמית",
        "דריכות יתר מתמדת - סריקה בלתי פוסקת של הסביבה אחר איומים",
        "תגובת בהלה מוגזמת לגירויים פתאומיים כמו רעש חד",
        "קשיי ריכוז",
        "הפרעות שינה - קושי להירדם, שינה לא רציפה או שינה לא מרעננת",
      ],
      relatedTopics: ["alcohol", "intimacy", "sleep"],
    },
    {
      id: 5,
      kind: "closing",
      title: "איך מתמודדים ויוצאים מזה?",
      icon: Brain,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
      intro:
        "הצעד הראשון הוא להבין שהתסמינים האלה הם תגובה מוכרת ונפוצה לאירוע קיצוני, ולא סימן לחולשה או לקלקול אישיותי. פוסט-טראומה היא מצב שניתן לטפל בו, וקיימות היום כמה גישות טיפול שהוכיחו את עצמן במחקרים: טיפול המבוסס על חשיפה הדרגתית ומבוקרת לזיכרון ולמצבים הנמנעים, טיפול שמסייע לעבד מחדש את המשמעות שניתנה לאירוע, וטיפול שמשלב תנועות עיניים מודרכות לצד עיבוד הזיכרון הכואב. לצד אלו, גישות המתמקדות בגוף עצמו יכולות לסייע בשחרור מתח פיזי שנשאר 'תקוע' בשרירים. פנייה מוקדמת לאיש מקצוע מגדילה משמעותית את סיכויי ההחלמה.",
    },
  ];

  const subTopics: Record<string, SubTopic> = {
    triggers: {
      id: "triggers",
      title: "טריגרים - למה דברים קטנים 'מקפיצים' אותי",
      icon: Zap,
      iconColor: "text-cyan-500",
      iconBg: "bg-cyan-500/10",
      content:
        "טריגר הוא כל גירוי - ריח, קול, תמונה או אפילו תאריך מסוים - שהמוח שיוך אותו, בזמן האירוע הטראומטי, לסכנה. מאחר שזיכרון האירוע נשמר בצורה חושית וחלקית ולא כסיפור מסודר עם התחלה וסוף, גירוי דומה יכול להפעיל את תגובת האזעקה של המוח באופן מיידי, עוד לפני שהחשיבה המודעת הספיקה לזהות שמדובר בטריגר ולא באיום ממשי. זו הסיבה שתגובת הגוף - דופק, הזעה, נכונות לברוח או להילחם - מגיעה לעיתים לפני שהאדם עצמו הבין למה.",
      highlight: "התגובה לטריגר היא אוטומטית ומהירה יותר מהחשיבה - היא לא בחירה, והיא לא סימן לחולשה.",
    },
    isolation: {
      id: "isolation",
      title: "התבודדות וצמצום קשרים חברתיים",
      icon: UserMinus,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
      content:
        "כאשר מקומות, שיחות או מפגשים חברתיים עלולים להזכיר את האירוע או לעורר שאלות קשות להסביר, נוצרת נטייה טבעית להימנע מהם. ההימנעות מספקת הקלה מיידית מהמתח, ולכן היא מתחזקת עם הזמן ומתרחבת גם לקשרים שאינם קשורים ישירות לאירוע - חברים, בני משפחה, פעילויות פנאי. הבעיה היא שהמנגנון שאמור להגן מציף בטווח הארוך: בדידות חברתית קשורה במחקרים להחמרת תסמיני דיכאון וחרדה, ותמיכה חברתית היא אחד הגורמים המשמעותיים ביותר הידועים כמסייעים בהחלמה מטראומה.",
      highlight: "ההימנעות מקלה בטווח המיידי, אך תמיכה חברתית היא אחד הכלים המשמעותיים ביותר בהחלמה.",
    },
    guilt: {
      id: "guilt",
      title: "אשמה ובושה",
      icon: Frown,
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-500/10",
      content:
        "רבים מאלה שחוו אירוע קשה נושאים תחושת אשמה על החלטות שקיבלו, או לא הספיקו לקבל, בשבריר שנייה - וכן 'אשמת ניצולים', כלומר קושי נפשי עם עצם השרידה כאשר אחרים לא שרדו. חשוב להבין: ההערכה מחדש של האירוע נעשית בדיעבד, כשיודעים כבר את כל התוצאות - וזה שונה לחלוטין מהמידע ומזמן התגובה שהיו זמינים בפועל באותם שברירי שנייה. במצבי קרב או סכנת חיים, מערכת העצבים פועלת במצב הישרדות מהיר ואוטומטי, שאינו זהה לתהליך שיקול דעת רגוע.",
      highlight: "הערכה עצמית בדיעבד נבנית על מידע שלא היה זמין באותו רגע - זהו הבדל מהותי, לא תירוץ.",
    },
    numbness: {
      id: "numbness",
      title: "קושי לחוות רגשות חיוביים (קהות רגשית)",
      icon: HeartCrack,
      iconColor: "text-red-500",
      iconBg: "bg-red-500/10",
      content:
        "חלק מהמנגנון שמנסה להגן מפני זיכרונות כואבים פועל על ידי הנמכה כללית של העוצמה הרגשית - לא רק של הכאב, אלא גם של רגשות חיוביים כמו שמחה, חיבה או התלהבות. התוצאה היא תחושה מוכרת אצל אנשים רבים שחוו טראומה: יודעים באופן שכלי שאוהבים את בני המשפחה, אך מתקשים להרגיש את זה בגוף. זהו תסמין נפוץ ומוכר, ולא עדות לכך שמשהו ב'אישיות' או ב'יכולת לאהוב' נפגם לצמיתות.",
      highlight: "קהות רגשית היא תסמין נפוץ ומוכר של פוסט-טראומה, לא שינוי קבוע באישיות.",
    },
    alcohol: {
      id: "alcohol",
      title: "אלכוהול וטיפול עצמי שגוי",
      icon: Wine,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
      content:
        "כשמערכת העצבים דרוכה כמעט כל הזמן, יש נטייה לחפש דרך מהירה להשתיק אותה - ואלכוהול, בהיותו חומר שמדכא את מערכת העצבים, נותן הקלה מיידית ומפתה. הבעיה היא שההקלה הזו זמנית ומגיעה במחיר: מחקרים מראים שאלכוהול פוגע באיכות שלב שנת החלום, שהוא בדיוק השלב המרכזי בעיבוד הרגשי של זיכרונות. כלומר, שימוש קבוע באלכוהול לצורך הירדמות עלול להאט את תהליך ההחלמה הטבעי מהטראומה, ובמקביל מעלה את הסיכון לפתח תלות בחומר. השילוב בין פוסט-טראומה לבין שימוש בעייתי באלכוהול הוא תופעה מוכרת ושכיחה.",
      highlight: "אלכוהול מקל על התסמין באופן זמני, אך מחקרים מראים שהוא פוגע בתהליך העיבוד הטבעי של הטראומה בשינה.",
    },
    intimacy: {
      id: "intimacy",
      title: "ירידה בחשק המיני ופגיעה באינטימיות",
      icon: Activity,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500/10",
      content:
        "כאשר מערכת העצבים נמצאת במצב עוררות גבוה לאורך זמן, הגוף מייצר באופן כרוני רמות מוגברות של הורמוני לחץ כמו קורטיזול ואדרנלין. מבחינה פיזיולוגית, מצב זה מתעדף משאבים לתפקודי הישרדות מיידיים, על חשבון תפקודים שאינם קריטיים לרגע הזה - וביניהם התפקוד המיני. ירידה בחשק ובעוררות המינית נפוצה אצל אנשים שחוו טראומה, והיא נחשבת לתופעת לוואי פיזיולוגית של מצב עוררות כרוני, ולא לבעיה זוגית או אישיותית.",
      highlight: "ירידה בחשק המיני היא לרוב תוצאה פיזיולוגית ישירה של עוררות יתר כרונית, לא עדות לבעיה בזוגיות.",
    },
    sleep: {
      id: "sleep",
      title: "קשיי שינה - מה עוזר ומה לא",
      icon: Moon,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-500/10",
      content:
        "כשמערכת העצבים דרוכה כל היום, קשה לה 'לשחרר' גם בלילה. אצל רבים מצטרף לזה גם פחד לא מודע מהשינה עצמה - כי השינה היא הרגע שבו הסיוטים עלולים לחזור. כתוצאה מכך נוצר מעגל: פחד מהשינה מקשה על ההירדמות, וחוסר שינה מעצים למחרת את העצבנות ואת הדריכות. שינה היא לא רק מנוחה - היא גם השלב שבו המוח מעבד רגשית את מה שעבר עליו, כך שקשיי שינה ממושכים מאטים גם את שאר תהליך ההחלמה.",
      dontDo: [
        "להישאר ער במיטה ולהתהפך שעות מתוך תקווה שהשינה 'תגיע מעצמה'",
        "להיעזר באלכוהול כדי להירדם",
        "לגלול ברשתות חברתיות או לצפות בחדשות ובמסך זמן קצר לפני השינה",
        "לישון שעות רבות ביום כדי 'לפצות' על לילה גרוע - זה משבש עוד יותר את שעון הגוף",
      ],
      doInstead: [
        "אם לא נרדמים אחרי כ-20 דקות - לקום מהמיטה ולחזור רק כשמרגישים עייפות שוב",
        "לשמור על שעת שינה ושעת קימה קבועות, גם בסופי שבוע",
        "לתרגל הרגעה גופנית - נשימה איטית, מתיחות קלות - כחצי שעה לפני השינה",
        "לפנות לאיש מקצוע אם סיוטים חוזרים ופוגעים בתפקוד - יש היום טיפולים ממוקדים גם לכך",
      ],
      highlight: "שיפור השינה הוא לא רק הקלה - הוא מאיץ בפועל את קצב ההחלמה מהטראומה.",
    },
    shameHiding: {
      id: "shameHiding",
      title: "בושה והסתרת המצב מהקרובים",
      icon: EyeOff,
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-500/10",
      content:
        "רבים מסתירים את מה שהם מרגישים דווקא מהאנשים הכי קרובים אליהם - מתוך פחד להיתפס כחלשים, מתוך רצון להגן על בני המשפחה מדאגה, או מתוך בושה על תגובות שנראות להם 'לא הגיוניות'. ההסתרה נותנת תחושת שליטה זמנית, אך יש לה מחיר: היא מונעת מהסובבים להבין מה קורה ולתת תמיכה נכונה, והיא מגבירה את תחושת הבדידות בדיוק ברגע שהיא הכי מזיקה. חשוב לזכור שתגובות אלה הן תגובה אנושית שכיחה לאירוע קיצוני, ולא סוד שצריך להתבייש בו.",
      dontDo: [
        "להעמיד פנים מול בני המשפחה שהכל בסדר",
        "לדחות שוב ושוב כל ניסיון של אדם קרוב לשאול 'מה איתך'",
        "להסתיר פנייה לטיפול כאילו מדובר במשהו מביש",
      ],
      doInstead: [
        "לשתף לפחות אדם קרוב אחד במה שעובר עליכם, גם בלי לפרט כל דבר",
        "להסביר לבני המשפחה בקצרה מה זו תגובה פוסט-טראומטית, כדי שיבינו שזה לא קשור אליהם",
        "לזכור: פנייה לעזרה היא צעד של אחריות ולא חולשה",
        "לשקול, כשמתאים, גם שיחה משפחתית או זוגית לצד הטיפול האישי",
      ],
      highlight: "הסתרה מגינה לרגע - אבל שיתוף של אדם קרוב אחד הוא לרוב הצעד הראשון שמקל הכי הרבה.",
    },
    avoidanceTreatment: {
      id: "avoidanceTreatment",
      title: "הימנעות ממצבים - מה עושים בטיפול",
      icon: Footprints,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
      content:
        "הימנעות נותנת הקלה מיידית - אבל ככל שמתרחקים יותר ממצבים, מקומות ואנשים, מעגל החיים מצטמצם וההימנעות עצמה הופכת לבעיה נפרדת. הדרך המקצועית להתמודד עם זה היא לא 'להתגבר בכוח' לבד, אלא חשיפה הדרגתית ומבוקרת: חוזרים למצבים הנמנעים בקצב מדוד, בליווי מטפל, כשכל שלב נבנה על ההצלחה של הקודם. כך המוח לומד מחדש, בפועל ולא רק בהיגיון, שהמצב הנוכחי בטוח - וזה בדיוק מה שמכווץ בהדרגה את מעגל ההימנעות בחזרה.",
      dontDo: [
        "להכריח את עצמכם בפתאומיות למצב הכי מפחיד שיש, לבד וללא הכנה",
        "להמשיך להרחיב את מעגל ההימנעות עד שכמעט אין יציאה מהבית",
        "להסתמך רק על 'כוח רצון' בלי ליווי מקצועי",
      ],
      doInstead: [
        "לבנות בעזרת מטפל 'סולם' של מצבים מהקל לקשה, ולהתקדם צעד אחר צעד",
        "לתרגל נשימה וקרקוע לפני ואחרי כל חשיפה למצב נמנע",
        "להתחיל במצבים קטנים ובני השגה, ולהרחיב בהדרגה",
        "להתייחס לכל צעד קטן של התמודדות כהצלחה אמיתית, לא כ'מובן מאליו'",
      ],
      highlight: "הימנעות מתכווצת בהדרגה, צעד אחרי צעד - לא בקפיצה אחת גדולה.",
    },
  };

  const totalMain = mainPages.length;
  const page = mainPages[currentMain];
  const activeSubTopic = subTopicId ? subTopics[subTopicId] : null;

  const openSubTopic = (id: string) => setSubTopicId(id);
  const closeSubTopic = () => setSubTopicId(null);

  const handleNext = () => {
    if (currentMain < totalMain - 1) {
      setSubTopicId(null);
      setCurrentMain((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentMain > 0) {
      setSubTopicId(null);
      setCurrentMain((prev) => prev - 1);
    }
  };

  const goToMain = (idx: number) => {
    setSubTopicId(null);
    setCurrentMain(idx);
  };

  return (
    <div className={cn("min-h-screen flex flex-col p-6 selection:bg-indigo-500 transition-colors duration-500 overflow-y-auto", isLight ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900" : "bg-slate-950 text-slate-50")} dir="rtl">
      {/* Background Decor */}
      <div className={cn("fixed top-0 right-0 w-96 h-96 blur-[120px] rounded-full pointer-events-none", isLight ? "bg-indigo-200/40" : "bg-indigo-600/10")} />
      <div className={cn("fixed bottom-0 left-0 w-96 h-96 blur-[120px] rounded-full pointer-events-none", isLight ? "bg-purple-200/30" : "bg-purple-600/10")} />

      <div className="w-full max-w-xl lg:max-w-3xl mx-auto flex-1 flex flex-col justify-between py-6 relative z-10">

        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1.5 border", isLight ? "bg-white border-slate-200" : "bg-white/5 border-white/5")}>
              <Logo variant="icon" />
            </div>
            <div className="text-right">
              <span className={cn("block text-xs font-black leading-none", isLight ? "text-indigo-600" : "text-indigo-400")}>המצפן הרגשי</span>
              <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">חוסן לכוחות הביטחון</span>
            </div>
          </div>

          <button
            onClick={onBack}
            className={cn("flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-colors group", isLight ? "text-slate-400 hover:text-slate-900" : "text-slate-400 hover:text-white")}
          >
            <span>חזרה</span>
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          </button>
        </div>

        {/* Card Container */}
        <div className="flex-1 flex flex-col justify-center my-4">
          <div className={cn("rounded-[2.5rem] p-8 md:p-10 border transition-all duration-500 shadow-xl relative overflow-hidden", isLight ? "glass-panel" : "dark-glass-panel")}>

            {activeSubTopic ? (
              <>
                {/* Breadcrumb back to the parent symptom cluster */}
                <button
                  onClick={closeSubTopic}
                  className={cn(
                    "flex items-center gap-1.5 mb-6 text-[11px] font-black uppercase tracking-wider transition-colors group",
                    isLight ? "text-slate-400 hover:text-indigo-600" : "text-slate-500 hover:text-indigo-400"
                  )}
                >
                  <ChevronLeft size={14} className="transition-transform group-hover:translate-x-0.5" />
                  <span>חזרה {page.navLabel ?? `ל${page.title}`}</span>
                </button>

                <div className="flex items-center gap-4 mb-6 md:mb-8">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md", activeSubTopic.iconBg)}>
                    <activeSubTopic.icon className={activeSubTopic.iconColor} size={28} />
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">הרחבת מידע</span>
                    <h2 className={cn("text-xl md:text-2xl lg:text-3xl font-black leading-tight mt-0.5", isLight ? "text-slate-900" : "text-white")}>
                      {activeSubTopic.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className={cn("text-base md:text-lg lg:text-xl leading-relaxed font-bold text-right text-pretty", isLight ? "text-slate-700" : "text-slate-350")}>
                    {activeSubTopic.content}
                  </p>

                  {(activeSubTopic.dontDo || activeSubTopic.doInstead) && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {activeSubTopic.dontDo && (
                        <div className={cn("p-4 rounded-2xl border", isLight ? "bg-rose-50/60 border-rose-200" : "bg-rose-500/5 border-rose-500/20")}>
                          <div className="flex items-center gap-2 mb-3">
                            <XCircle size={16} className="text-rose-500 shrink-0" />
                            <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">מה בדרך כלל לא עוזר</span>
                          </div>
                          <ul className="space-y-2">
                            {activeSubTopic.dontDo.map((d, i) => (
                              <li key={i} className={cn("text-sm font-bold leading-relaxed text-right", isLight ? "text-slate-700" : "text-slate-300")}>
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {activeSubTopic.doInstead && (
                        <div className={cn("p-4 rounded-2xl border", isLight ? "bg-emerald-50/60 border-emerald-200" : "bg-emerald-500/5 border-emerald-500/20")}>
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">מה כן עוזר</span>
                          </div>
                          <ul className="space-y-2">
                            {activeSubTopic.doInstead.map((d, i) => (
                              <li key={i} className={cn("text-sm font-bold leading-relaxed text-right flex flex-col items-start gap-1", isLight ? "text-slate-700" : "text-slate-300")}>
                                <span>{d}</span>
                                {activeSubTopic.id === "sleep" && i === 3 && (
                                  <button
                                    onClick={() => setIsIrtDialogOpen(true)}
                                    className="mt-1 text-[10px] font-black text-indigo-650 dark:text-indigo-400 hover:underline bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all self-start"
                                  >
                                    <Info size={11} />
                                    דרכי טיפול בסיוטי לילה
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSubTopic.highlight && (
                    <div className={cn("p-5 rounded-2xl border-l-4 font-black text-sm md:text-base leading-relaxed bg-slate-900/5 dark:bg-white/5", "border-indigo-500 text-indigo-600 dark:text-indigo-400")}>
                      {activeSubTopic.highlight}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Header of the main page */}
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md", page.iconBg)}>
                    <page.icon className={page.iconColor} size={28} />
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">נושא {page.id + 1} מתוך {totalMain}</span>
                    <h2 className={cn("text-xl md:text-2xl lg:text-3xl font-black leading-tight mt-0.5", isLight ? "text-slate-900" : "text-white")}>
                      {page.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className={cn("text-base md:text-lg leading-relaxed font-bold text-right text-pretty", isLight ? "text-slate-700" : "text-slate-350")}>
                    {page.intro}
                  </p>

                  {page.bridge && (
                    <div className={cn("flex items-start gap-3 p-4 rounded-2xl border", isLight ? "bg-indigo-50/60 border-indigo-200" : "bg-indigo-500/5 border-indigo-500/20")}>
                      <ArrowDownCircle size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                      <p className={cn("text-sm md:text-base font-bold leading-relaxed text-right", isLight ? "text-indigo-900" : "text-indigo-300")}>
                        {page.bridge}
                      </p>
                    </div>
                  )}

                  {page.symptoms && (
                    <div className={cn("p-5 rounded-2xl", isLight ? "bg-slate-900/5" : "bg-white/5")}>
                      <div className="flex items-center gap-2 mb-3">
                        <ListChecks size={16} className={page.iconColor} />
                        <span className={cn("text-[11px] font-black uppercase tracking-wider", isLight ? "text-slate-500" : "text-slate-400")}>איך זה מתבטא</span>
                      </div>
                      <ul className="space-y-2.5">
                        {page.symptoms.map((s, i) => (
                          <li key={i} className={cn("text-sm md:text-base font-bold leading-relaxed text-right flex items-start gap-2.5", isLight ? "text-slate-700" : "text-slate-300")}>
                            <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", page.iconColor.replace("text-", "bg-"))} />
                            <span className="flex-1">{s}</span>
                            {page.id === 1 && i === 1 && (
                              <button
                                onClick={() => setIsIrtDialogOpen(true)}
                                className="mr-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all shrink-0"
                              >
                                <Info size={10} />
                                דרכי טיפול בסיוטים
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {page.relatedTopics && page.relatedTopics.length > 0 && (
                    <div>
                      <span className={cn("block text-[11px] font-black uppercase tracking-wider mb-2.5", isLight ? "text-slate-400" : "text-slate-500")}>להרחבת מידע</span>
                      <div className="grid gap-2.5">
                        {page.relatedTopics.map((topicId) => {
                          const t = subTopics[topicId];
                          if (!t) return null;
                          return (
                            <button
                              key={topicId}
                              onClick={() => openSubTopic(topicId)}
                              className={cn(
                                "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-right group active:scale-[0.98]",
                                isLight ? "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50" : "bg-white/5 border-white/5 hover:border-indigo-500/30 hover:bg-white/10"
                              )}
                            >
                              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", t.iconBg)}>
                                <t.icon className={t.iconColor} size={18} />
                              </div>
                              <span className={cn("flex-1 text-sm font-black", isLight ? "text-slate-800" : "text-slate-200")}>{t.title}</span>
                              <ChevronLeft size={16} className={cn("shrink-0 transition-transform group-hover:-translate-x-0.5", isLight ? "text-slate-300" : "text-slate-600")} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between mt-6 w-full">
          <Button
            onClick={activeSubTopic ? closeSubTopic : handlePrev}
            disabled={!activeSubTopic && currentMain === 0}
            className={cn(
              "px-5 py-6 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 active:scale-95 transition-all border shrink-0",
              !activeSubTopic && currentMain === 0
                ? "opacity-30 cursor-not-allowed"
                : (isLight ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-slate-900 border-white/5 text-slate-300 hover:bg-slate-800")
            )}
          >
            <ArrowRight size={14} />
            אחורה
          </Button>

          {/* Progress dots (main pages only) */}
          <div className="hidden xs:flex items-center gap-1.5">
            {mainPages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => goToMain(idx)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  idx === currentMain ? "w-6 bg-indigo-600 dark:bg-indigo-400" : "w-2.5 bg-slate-200 dark:bg-slate-800"
                )}
                aria-label={`עבור לנושא ${idx + 1}`}
              />
            ))}
          </div>

          {activeSubTopic ? (
            <Button
              onClick={closeSubTopic}
              className="px-5 py-6 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 active:scale-95 transition-all bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
            >
              חזרה לנושא
              <ArrowLeft size={14} />
            </Button>
          ) : currentMain < totalMain - 1 ? (
            <Button
              onClick={handleNext}
              className="px-5 py-6 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 active:scale-95 transition-all bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
            >
              המשך
              <ArrowLeft size={14} />
            </Button>
          ) : (
            <Button
              onClick={onBack}
              className="px-5 py-6 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 active:scale-95 transition-all bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            >
              הבנתי, תודה
            </Button>
          )}
        </div>
      </div>

      {/* Nightmare Treatments Info Dialog */}
      <Dialog open={isIrtDialogOpen} onOpenChange={setIsIrtDialogOpen}>
        <DialogContent className={cn("max-w-md rounded-[2.5rem] p-6 text-right max-h-[85vh] overflow-y-auto", isLight ? "bg-white text-slate-900 border-slate-200" : "bg-slate-900 text-slate-100 border-white/5")} dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <Brain size={20} className="text-indigo-500" />
              דרכי טיפול בסיוטי לילה
            </DialogTitle>
            <DialogDescription className={cn("text-xs font-bold mt-1", isLight ? "text-slate-500" : "text-slate-400")}>
              פתרונות ממוקדים לסיוטים הקשורים לפוסט-טראומה
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-6 text-sm leading-relaxed font-bold">
            {/* Section 1: IRT */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400">1. טיפול התנהגותי: שכתוב סיוטים (IRT)</h3>
              <p className={cn("text-xs leading-relaxed", isLight ? "text-slate-700" : "text-slate-300")}>
                טיפול IRT (Imagery Rehearsal Therapy) עוזר למטופל לדמיין מחדש את הסיוטים, עם סיום שונה, פחות מחריד, כדי ״לתכנת״ מחדש את התסריט של הסיוט כך שכאשר יקרו שוב – הם יעוררו פחות פחד.
              </p>
              <div className={cn("p-4 rounded-2xl border space-y-3", isLight ? "bg-indigo-50/50 border-indigo-100/50" : "bg-indigo-950/20 border-indigo-500/10")}>
                <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">מהלך הטיפול השכיח:</p>
                <p className={cn("text-[11px] leading-relaxed", isLight ? "text-slate-700" : "text-slate-350")}>
                  בתחילת IRT המטפל נותן רקע על שינה וסיוטים, כדי לבנות בסיס לניהול שלהם, ואחרי זה הוא עובד עם המטופל כדי:
                </p>
                <ul className="space-y-2 text-[11px] mr-2 list-none">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span><strong>א.</strong> ליצור סיום מפורט ולא מפחיד לסיוטים החוזרים.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span><strong>ב.</strong> לרשום ואז לחזור על הסיוטים עם הסיום החדש.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span><strong>ג.</strong> ללמוד איך לנטר את הסיוטים כדי להבין עד כמה הטיפול משפיע.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className={cn("border-t my-4", isLight ? "border-slate-100" : "border-white/5")} />

            {/* Section 2: Pharmacological/Prazosin */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400">2. טיפול תרופתי: פראזוסין (Prazosin)</h3>
              <p className={cn("text-xs leading-relaxed", isLight ? "text-slate-700" : "text-slate-300")}>
                <strong>פראזוסין (Prazosin):</strong> נחשבת לתרופת הקו הראשון בטיפול בסיוטים אלו. במקור מיועדת ללחץ דם, אך היא מצליחה לחסום את פעילות הנוראדרנלין במוח בזמן השינה.
              </p>
              <div className={cn("p-4 rounded-2xl border space-y-2.5", isLight ? "bg-indigo-50/50 border-indigo-100/50" : "bg-indigo-950/20 border-indigo-500/10")}>
                <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">איך היא משפיעה?</p>
                <p className={cn("text-[11px] leading-relaxed", isLight ? "text-slate-700" : "text-slate-350")}>
                  התרופה מפחיתה את העוררות הגופנית הלילית, מונעת התעוררויות מבהילות מתוך סיוטים, ומסייעת בשיפור איכות השינה הכללית.
                </p>
                <p className={cn("text-[10px] leading-relaxed border-t pt-2 mt-2", isLight ? "text-slate-500 border-slate-200" : "text-slate-400 border-white/5")}>
                  * מובהר כי המידע המוצג הינו כללי בלבד. השימוש בתרופה מחייב התייעצות ומרשם מרופא מטפל או פסיכיאטר מוסמך להתאמת מינון אישי ומעקב.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsIrtDialogOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3.5 rounded-xl text-xs active:scale-95 transition-all w-full sm:w-auto">
              הבנתי, תודה
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
