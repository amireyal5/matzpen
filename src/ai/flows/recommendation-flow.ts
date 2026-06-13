'use server';
/**
 * @fileOverview מנוע המלצות דיאלוגי חכם, אמפתי ומקומי לחלוטין (ללא קריאות ל-AI חיצוני).
 * המנוע מנתח את קלט המשתמש באמצעות התאמת מילות מפתח ממוקדת בעברית,
 * מזהה מצבי חירום (Crisis), מזהה קטגוריות מצוקה או רגיעה, ומחזיר המלצות כלים מותאמות מגדרית.
 */

import { z } from 'genkit';
import { CATS } from '@/lib/data';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const RecommendationInputSchema = z.object({
  feeling: z.string().describe('תיאור ההרגשה של המשתמש כרגע.'),
  gender: z.enum(['m', 'f']).describe('מגדר המשתמש (m/f) לצורך פנייה נכונה.'),
  name: z.string().optional().describe('שם המשתמש לפנייה אישית.'),
  history: z.array(MessageSchema).optional().describe('היסטוריית השיחה הנוכחית.'),
  categories: z.array(z.object({
    key: z.string(),
    label: z.string(),
    tagLine: z.string(),
  })).optional(),
});
export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

const RecommendationOptionSchema = z.object({
  label: z.string().describe('טקסט קצר על הכפתור.'),
  description: z.string().describe('הסבר קצר על התועלת.'),
  categoryKey: z.string().describe('המפתח של הקטגוריה.'),
  practiceIndex: z.number().optional().describe('אינדקס התרגיל.'),
});

const RecommendationOutputSchema = z.object({
  explanation: z.string().describe('התייחסות אמפתית, חכמה ומכוונת פתרון.'),
  options: z.array(RecommendationOptionSchema).optional().describe('רשימת נתיבי עבודה מומלצים.'),
  quickReplies: z.array(z.string()).optional().describe('הצעות לתשובות מהירות.'),
  isCrisis: z.boolean().describe('האם זוהה סיכון עצמי ודאי.'),
  needsMoreInfo: z.boolean().describe('האם נדרש תשאול נוסף כדי לדייק את הכלי.'),
});
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

export async function getRecommendation(input: RecommendationInput): Promise<RecommendationOutput> {
  const { feeling = "", gender = "m", name = "" } = input;
  const normalizedInput = feeling.trim().toLowerCase();
  const isF = gender === 'f';
  const displayName = name ? name : (isF ? "חברה" : "חבר");

  // 1. זיהוי מקרי חירום (Crisis)
  const crisisKeywords = [
    "למות", "להתאבד", "לשים קץ", "לפגוע בעצמי", "לחתוך", "אין לי למה לחיות",
    "לא רוצה לחיות", "רוצה להעלם", "סוף לחיים", "לסיים את החיים"
  ];
  const hasCrisis = crisisKeywords.some(keyword => normalizedInput.includes(keyword));

  if (hasCrisis) {
    return {
      explanation: isF 
        ? `שומעת את הכאב העמוק שלך, ${displayName}. בבקשה, אל תשארי עם זה לבד. יש אנשים שמחכים ורוצים לעזור לך ברגע זה.`
        : `שומע את הכאב העמוק שלך, ${displayName}. בבקשה, אל תישאר עם זה לבד. יש אנשים שמחכים ורוצים לעזור לך ברגע זה.`,
      isCrisis: true,
      needsMoreInfo: false,
      quickReplies: ["עזרה דחופה", "מספרי חירום", "איך לפנות?"],
      options: []
    };
  }

  // 2. קבוצות מילות מפתח
  const sosKeywords = [
    "חרדה", "פאניקה", "התקף", "לחוץ", "לחץ", "לחוצה", "מפחד", "מפחדת", "פחד", 
    "הצפה", "מוצף", "מוצפת", "דופק", "לחץ בחזה", "נשימה", "מחנק", "הצילו", "מבוהל", "משתגע", "הסטריה"
  ];

  const sleepKeywords = [
    "לישון", "שינה", "נדודי שינה", "לילה", "להירדם", "נרדם", "נרדמת", "עייף", "עייפה", "עייפות", "לא נרדם"
  ];

  const somaticKeywords = [
    "גוף", "שרירים", "שריר", "כאב", "גב", "צוואר", "מתח בגוף", "פיזי", "עייף בגוף", "כבדות", "רעידות", "בטן"
  ];

  const loopKeywords = [
    "מחשבות", "חושב", "חושבת", "לופ", "דאגה", "דאגות", "כעס", "כועס", "כועסת", "עצוב", "עצובה", 
    "עצב", "ייאוש", "מתוסכל", "מתוסכלת", "חושב יותר מדי", "עצבים"
  ];

  const calmKeywords = [
    "מוזיקה", "צלילים", "מדיטציה", "רוגע", "שקט", "לנשום", "נשימה", "מרגיע", "סאונד", "ריכוז", "קערה"
  ];

  // בדיקת התאמה לפי קטגוריות
  const matchesSos = sosKeywords.some(kw => normalizedInput.includes(kw));
  const matchesSleep = sleepKeywords.some(kw => normalizedInput.includes(kw));
  const matchesSomatic = somaticKeywords.some(kw => normalizedInput.includes(kw));
  const matchesLoop = loopKeywords.some(kw => normalizedInput.includes(kw));
  const matchesCalm = calmKeywords.some(kw => normalizedInput.includes(kw));

  // 3. החזרת המלצות לפי התאמות

  // קטגוריית SOS וחרדה עמוקה
  if (matchesSos) {
    return {
      explanation: isF
        ? `אני שומעת שאת חווה כרגע רמת עוררות ומתח גבוהה, ${displayName}. מומלץ להתחיל עם כלי SOS מהיר או תרגיל נשימה מווסת כדי להרגיע את מערכת העצבים.`
        : `אני שומע שאתה חווה כרגע רמת עוררות ומתח גבוהה, ${displayName}. מומלץ להתחיל עם כלי SOS מהיר או תרגיל נשימה מווסת כדי להרגיע את מערכת העצבים.`,
      isCrisis: false,
      needsMoreInfo: false,
      quickReplies: ["תרגיל נשימה", "עזרה מיידית SOS", "עיבוד בילטרלי"],
      options: [
        {
          label: "עזרה מיידית (SOS)",
          description: "כלים מהירים להפחתת חרדה והצפה רגשית ברגעים קשים",
          categoryKey: "SOS"
        },
        {
          label: "ויסות הצפה (נשימה)",
          description: "תרגיל נשימה מרגיע ומווסת ללא עצירות",
          categoryKey: "BREATHING"
        },
        {
          label: "עיבוד בילטרלי (EMDR)",
          description: "פריקה והפחתת מצוקה באמצעות גירוי דו-צדדי מהיר",
          categoryKey: "BILATERAL"
        }
      ]
    };
  }

  // קטגוריית בעיות שינה ועייפות
  if (matchesSleep) {
    return {
      explanation: isF
        ? `מתח ודאגות לפני השינה מקשים על הגוף להירדם, ${displayName}. מומלץ להשתמש בנשימה מווסתת או לפרוק את המחשבות החוצה.`
        : `מתח ודאגות לפני השינה מקשים על הגוף להירדם, ${displayName}. מומלץ להשתמש בנשימה מווסתת או לפרוק את המחשבות החוצה.`,
      isCrisis: false,
      needsMoreInfo: false,
      quickReplies: ["הרפיה לשינה", "צלילי רקע", "יומן פריקה"],
      options: [
        {
          label: "הרפיה עמוקה לשינה",
          description: "שיטת 4-7-8 המפורסמת להרגעת הגוף והצפה לפני שינה",
          categoryKey: "BREATHING"
        },
        {
          label: "צלילי מרחב לשקט",
          description: "נוף קול רגוע ומחבר להרפיה ונשימה שקטה",
          categoryKey: "SOUNDS"
        },
        {
          label: "יומן פריקת דאגות",
          description: "הוצאת כל המשימות והמחשבות הטורדניות מחוץ לראש",
          categoryKey: "SLEEP"
        }
      ]
    };
  }

  // קטגוריית מתח גופני (Somatic)
  if (matchesSomatic) {
    return {
      explanation: isF
        ? `הגוף שלך אוגר את המתח הרגשי, ${displayName}. עבודה ממוקדת גוף תסייע לשחרר את העומס הפיזיולוגי.`
        : `הגוף שלך אוגר את המתח הרגשי, ${displayName}. עבודה ממוקדת גוף תסייע לשחרר את העומס הפיזיולוגי.`,
      isCrisis: false,
      needsMoreInfo: false,
      quickReplies: ["סריקת גוף", "עיבוד בילטרלי", "נשימה מרגיעה"],
      options: [
        {
          label: "סריקת גוף (Body Scan)",
          description: "חיבור מחדש לגוף, זיהוי מקור המתח ושחרורו",
          categoryKey: "BODY"
        },
        {
          label: "חיבוק פרפר (EMDR)",
          description: "טכניקת גירוי דו-צדדי פיזית ועצמית לניהול הצפה בגוף",
          categoryKey: "BODY",
          practiceIndex: 2 // Butterfly hug index
        },
        {
          label: "צלילי מרחב מרגיעים",
          description: "מוזיקת קערות טיבטיות להרפיית שרירים ומתח גופני",
          categoryKey: "SOUNDS"
        }
      ]
    };
  }

  // קטגוריית לופ מחשבתי ודאגות (CBT)
  if (matchesLoop) {
    return {
      explanation: isF
        ? `כאשר המחשבות רצות בלופ קשה למצוא מנוחה, ${displayName}. עבודה קוגניטיבית או נשימה ממוקדת יעזרו להחזיר את השליטה.`
        : `כאשר המחשבות רצות בלופ קשה למצוא מנוחה, ${displayName}. עבודה קוגניטיבית או נשימה ממוקדת יעזרו להחזיר את השליטה.`,
      isCrisis: false,
      needsMoreInfo: false,
      quickReplies: ["יומן מחשבות CBT", "נשימת קופסה לפוקוס", "חוסן נפשי"],
      options: [
        {
          label: "יומן מחשבות (CBT)",
          description: "פירוק הלופ המחשבתי וניסוח פרשנות מאוזנת (אפר\"ת)",
          categoryKey: "JOURNAL"
        },
        {
          label: "נשימת קופסה",
          description: "טכניקה המאפסת את רמת המתח ומחזירה מיקוד ופוקוס למוח",
          categoryKey: "BREATHING"
        },
        {
          label: "מחשבות הן עננים",
          description: "התבוננות על המחשבות הטורדניות מבחוץ כעננים חולפים",
          categoryKey: "MIND",
          practiceIndex: 2
        }
      ]
    };
  }

  // קטגוריית רוגע ומוזיקה
  if (matchesCalm) {
    return {
      explanation: isF
        ? `שמחה שאת מחפשת מרחב של שלווה, ${displayName}. בואי ניקח כמה רגעים להרפיה ונשימה שקטה.`
        : `שמח שאתה מחפש מרחב של שלווה, ${displayName}. בוא ניקח כמה רגעים להרפיה ונשימה שקטה.`,
      isCrisis: false,
      needsMoreInfo: false,
      quickReplies: ["מוזיקה מרגיעה", "תרגולי נשימה"],
      options: [
        {
          label: "צלילי מרחב לשלווה",
          description: "מגוון צלילים, תדרי ריפוי ונעימות מרגיעות לשקט פנימי",
          categoryKey: "SOUNDS"
        },
        {
          label: "תרגולי נשימה מונחים",
          description: "מגוון תרגילי נשימה עם סנכרון ויזואלי וקולות פעמונים",
          categoryKey: "BREATHING"
        }
      ]
    };
  }

  // ברירת מחדל
  return {
    explanation: isF
      ? `שלום ${displayName}, איך אוכל לסייע לך ברגע זה? את יכולה לשתף אותי במה שעובר עלייך או לבחור ישירות באחד מהכלים המומלצים החמים:`
      : `שלום ${displayName}, איך אוכל לסייע לך ברגע זה? אתה יכול לשתף אותי במה שעובר עליך או לבחור ישירות באחד מהכלים המומלצים החמים:`,
    isCrisis: false,
    needsMoreInfo: false,
    quickReplies: ["חרדה או לחץ", "קשיים בשינה", "מחשבות רצות", "רוצה להירגע"],
    options: [
      {
        label: "עזרה מיידית (SOS)",
        description: "כלים מהירים להפחתת חרדה מיידית וקרקוע",
        categoryKey: "SOS"
      },
      {
        label: "יומן מחשבות CBT",
        description: "ניתוח וארגון מחשבות מעיקות בצורה מבוקרת",
        categoryKey: "JOURNAL"
      },
      {
        label: "תרגולי נשימה ומוזיקה",
        description: "תרגילי נשימה קצביים וצלילי רקע לשלווה פנימית",
        categoryKey: "BREATHING"
      }
    ]
  };
}