'use server';
/**
 * @fileOverview מנוע המלצות דיאלוגי היברידי.
 * שלב 1 (רשת ביטחון קשיחה): סינון מילות מפתח לזיהוי מצבי חירום - תמיד מחזיר תשובת חירום קבועה, ללא תלות ב-AI.
 * שלב 2: עבור כל פנייה אחרת, פנייה ל-Gemini להבנת ניואנס וקונטקסט והתאמת המלצה אישית מתוך ארגז הכלים של האפליקציה.
 * שלב 3 (גיבוי): אם קריאת ה-AI נכשלת, חזרה למנגנון מבוסס מילות-מפתח מקומי.
 */

import { ai } from '@/ai/genkit';
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

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message || '';
      if (error?.status === 429 || errorMsg.includes('429')) {
        const delay = Math.pow(2, i) * 1500;
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('שגיאה בלתי צפויה ב-fetchWithRetry');
}

// רשימת מילות מפתח לזיהוי מקרי חירום - רשת ביטחון קשיחה ולא תלויה ב-AI
const crisisKeywords = [
  "למות", "להתאבד", "לשים קץ", "לפגוע בעצמי", "לחתוך", "אין לי למה לחיות",
  "לא רוצה לחיות", "רוצה להעלם", "סוף לחיים", "לסיים את החיים",
  "אין טעם", "לברוח מהכל", "מאוס עלי", "לא רוצה לקום"
];

function getCrisisResponse(isF: boolean, displayName: string): RecommendationOutput {
  return {
    explanation: isF
      ? `שומעת את הכאב העמוק שלך, ${displayName}. בבקשה, אל תשארי עם זה לבד. יש אנשים שמחכים ורוצים לעזור לך ברגע זה.`
      : `שומע את הכאב העמוק שלך, ${displayName}. בבקשה, אל תישאר עם זה לבד. יש אנשים שמחכים ורוצים לעזור לך ברגע זה.`,
    isCrisis: true,
    needsMoreInfo: false,
    quickReplies: ["עזרה דחופה", "מספרי חירום", "תרגיל קרקוע 5-4-3-2-1"],
    options: []
  };
}

// מנגנון גיבוי מבוסס מילות מפתח - משמש כאשר קריאת ה-AI נכשלת
function ruleBasedRecommendation(input: RecommendationInput): RecommendationOutput {
  const { feeling = "", gender = "m", name = "" } = input;
  const normalizedInput = feeling.trim().toLowerCase();
  const isF = gender === 'f';
  const displayName = name ? name : (isF ? "חברה" : "חבר");

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

  const matchesSos = sosKeywords.some(kw => normalizedInput.includes(kw));
  const matchesSleep = sleepKeywords.some(kw => normalizedInput.includes(kw));
  const matchesSomatic = somaticKeywords.some(kw => normalizedInput.includes(kw));
  const matchesLoop = loopKeywords.some(kw => normalizedInput.includes(kw));
  const matchesCalm = calmKeywords.some(kw => normalizedInput.includes(kw));

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
          practiceIndex: 2
        },
        {
          label: "צלילי מרחב מרגיעים",
          description: "מוזיקת קערות טיבטיות להרפיית שרירים ומתח גופני",
          categoryKey: "SOUNDS"
        }
      ]
    };
  }

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

// תפריט הכלים העומדים לרשות ה-AI להמלצה - קטגוריות התוכן + מסכים מיוחדים באפליקציה
const TOOL_MENU = [
  ...CATS.map(c => `- ${c.key}: ${c.label} - ${c.tagLine}`),
  '- JOURNAL: יומן מחשבות CBT (אפר"ת) - פירוק לופ מחשבתי וניסוח פרשנות מאוזנת',
  '- BREATHING: תרגילי נשימה מונחים עם סנכרון ויזואלי',
  '- SOUNDS: צלילי רקע, מדיטציה ונופי קול מרגיעים',
  '- BILATERAL: עיבוד בילטרלי (EMDR) להפחתת מצוקה רגשית חריפה',
].join('\n');

const PromptInputSchema = z.object({
  feeling: z.string(),
  displayName: z.string(),
  genderLabel: z.string(),
  toolMenu: z.string(),
  history: z.array(MessageSchema).optional(),
});

const prompt = ai.definePrompt({
  name: 'recommendationPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: RecommendationOutputSchema },
  prompt: `את/ה "המצפן הרגשי" - מנחה דיגיטלי אמפתי, חם ומבוסס CBT/ACT/EMDR בתוך אפליקציית בריאות נפשית בעברית.
המשתמש נקרא/ת {{displayName}} ופונה אליו/ה ב{{genderLabel}}.

{{#if history}}
היסטוריית השיחה עד כה:
{{#each history}}
{{role}}: {{content}}
{{/each}}
{{/if}}

ההודעה הנוכחית מהמשתמש: "{{feeling}}"

**בטיחות מעל הכל (Safety First)**:
עליך לגלות ערנות מקסימלית לכל רמז של ייאוש קיצוני, חוסר טעם לחיים, אובדנות או רצון לפגוע בעצמו - כולל ביטויים עמומים כמו "אין לי כוח יותר", "נמאס לי מהכל", "הלוואי ולא הייתי פה".
אם זיהית סיכון כזה:
1. הגדר isCrisis כ-true.
2. כתוב ב-explanation התייחסות אמפתית, מכילה, שמציינת שהכלי הדיגיטלי אינו מענה מספק כרגע ושחשוב לפנות לעזרה אנושית מיידית, ושאת/ה לא לבד.
3. השאר options ריק ([]).
4. ב-quickReplies החזר: ["עזרה דחופה", "מספרי חירום", "איך לפנות?"].

אם אין סיכון:
1. הגדר isCrisis כ-false.
2. כתוב explanation אמפתית, קצרה (1-3 משפטים), שמשקפת הקשבה אמיתית למה שהמשתמש שיתף - לא תשובה גנרית.
3. בחר עד 3 אפשרויות מתוך ארגז הכלים הבא בלבד, המתאימות ביותר למצב שתואר. categoryKey חייב להיות אחד מהמפתחות המדויקים מהרשימה:
{{toolMenu}}
4. הוסף quickReplies - עד 4 הצעות תשובה קצרות (2-4 מילים) שממשיכות את הדיאלוג בטבעיות.
5. אם המשתמש כתב משפט עמום מאוד שלא ניתן להבין ממנו דבר (למשל "שלום" בלבד), אפשר להגדיר needsMoreInfo כ-true ולשאול שאלה מכוונת אחת ב-explanation, ולהחזיר options ריק.
`,
});

const recommendationFlow = ai.defineFlow(
  {
    name: 'recommendationFlow',
    inputSchema: PromptInputSchema,
    outputSchema: RecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function getRecommendation(input: RecommendationInput): Promise<RecommendationOutput> {
  const { feeling = "", gender = "m", name = "" } = input;
  const normalizedInput = feeling.trim().toLowerCase();
  const isF = gender === 'f';
  const displayName = name ? name : (isF ? "חברה" : "חבר");

  // רשת ביטחון קשיחה: ביטויי חירום מפורשים מטופלים מיידית, ללא תלות ב-AI
  const hasCrisis = crisisKeywords.some(keyword => normalizedInput.includes(keyword));
  if (hasCrisis) {
    return getCrisisResponse(isF, displayName);
  }

  try {
    const result = await fetchWithRetry(() => recommendationFlow({
      feeling,
      displayName,
      genderLabel: isF ? "לשון נקבה" : "לשון זכר",
      toolMenu: TOOL_MENU,
      history: input.history,
    }));

    if (result.isCrisis) {
      return {
        ...getCrisisResponse(isF, displayName),
        explanation: result.explanation || getCrisisResponse(isF, displayName).explanation,
      };
    }

    return result;
  } catch (error) {
    console.error('שגיאה במנוע ההמלצות החכם, חוזר למנגנון מבוסס-כללים:', error);
    return ruleBasedRecommendation(input);
  }
}
