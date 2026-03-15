'use server';
/**
 * @fileOverview מנוע המלצות חכם ואבחוני למצפן הרגשי עם מנגנון הגנה למצבי סיכון.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { CATS } from '@/lib/data';

const RecommendationInputSchema = z.object({
  feeling: z.string().describe('תיאור ההרגשה של המשתמש כרגע.'),
  gender: z.enum(['m', 'f']).describe('מגדר המשתמש (m/f) לצורך פנייה נכונה.'),
});
export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

const RecommendationOptionSchema = z.object({
  label: z.string().describe('טקסט קצר על הכפתור.'),
  description: z.string().describe('הסבר קצר על התועלת.'),
  categoryKey: z.string().describe('המפתח של הקטגוריה.'),
  practiceIndex: z.number().optional().describe('אינדקס התרגיל.'),
});

const RecommendationOutputSchema = z.object({
  explanation: z.string().describe('התייחסות אמפתית ותיקוף.'),
  options: z.array(RecommendationOptionSchema).describe('רשימת נתיבי עבודה.'),
  isCrisis: z.boolean().describe('האם זוהה סיכון עצמי או אובדנות.'),
  crisisMessage: z.string().optional().describe('מסר הבהרה והפניה לחירום במידת הצורך.'),
});
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

async function fetchWithRetry(fn: () => Promise<any>, retries = 7) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message || '';
      if (error?.status === 429 || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        const delay = Math.pow(2, i) * 1500;
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

export async function getRecommendation(input: RecommendationInput): Promise<RecommendationOutput> {
  return fetchWithRetry(() => recommendationFlow(input));
}

const prompt = ai.definePrompt({
  name: 'recommendationPrompt',
  input: { schema: RecommendationInputSchema },
  output: { schema: RecommendationOutputSchema },
  prompt: `אתה עוזר טיפולי מומחה (CBT ו-SE) באפליקציית "המצפן הרגשי" של עמיר אייל.
המשתמש משתף: "{{{feeling}}}".
מגדר המשתמש: {{gender}}.

**משימה קריטית - בטיחות (Safety First)**:
עליך לזהות כל רמז למצוקה קיצונית, ייאוש עמוק או אובדן רצון לחיות. 
אמירות כמו "נמאס לי", "אני לא יכול יותר", "איבדתי את החשק", "אין לי כוח לחיים האלה" - מחייבות התייחסות כאל מצב סיכון!

אם המשתמש מביע כוונות לפגיעה עצמית, מחשבות אובדניות או ייאוש קיצוני (גם אם ברמז או באמירה עמומה):
1. הגדר את isCrisis כ-true.
2. ב-explanation, כתוב מסר אמפתי אך חד-משמעי: "אני שומע את המצוקה הכבדה במילים שלך. חשוב לי לומר שבמצבים של ייאוש כזה, המצפן הדיגיטלי אינו כלי מספיק וחשוב מאוד לא להישאר עם זה לבד."
3. עליך לשאול שאלת הבהרה מפורשת בתוך ה-explanation: "האם יש לך מחשבה לפגוע בעצמך כרגע או תוכנית כזו? בבקשה אל תישאר עם זה לבד, יש אנשים שרוצים ויכולים לעזור ברגע זה ממש."
4. אל תציע תרגילים רגילים (מדיטציה/יומן) כפתרון ראשי. האופציות צריכות להיות הפניה לעזרה מקצועית.

אם אין סיכון חיים:
1. קיים דיאלוג מעמיק: אמפתיה, תיקוף ושאלה מכווינה לגבי דרך העבודה המועדפת (מחשבות, גוף, ערכים).
2. הצע 3-4 אופציות רלוונטיות מהקטגוריות הקיימות.

הקטגוריות הקיימות:
{{#each categories}}
- {{key}}: {{label}} ({{tagLine}})
{{/each}}
כלים נוספים: JOURNAL, MEDITATION, BILATERAL.

פנה למשתמש בשפה המותאמת למגדר שלו ({{gender}}).`,
});

const recommendationFlow = ai.defineFlow(
  {
    name: 'recommendationFlow',
    inputSchema: RecommendationInputSchema,
    outputSchema: RecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({
      ...input,
      categories: CATS.map(c => ({ key: c.key, label: c.label, tagLine: c.tagLine })),
    });
    return output!;
  }
);
