'use server';
/**
 * @fileOverview מנוע המלצות חכם ואבחוני למצפן הרגשי.
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
  label: z.string().describe('טקסט קצר על הכפתור (למשל: "עבודה על המחשבות").'),
  description: z.string().describe('הסבר קצר על למה האופציה הזו תעזור למשתמש כרגע.'),
  categoryKey: z.string().describe('המפתח של הקטגוריה או הכלי האסטרטגי.'),
  practiceIndex: z.number().optional().describe('אינדקס התרגיל המומלץ בתוך הקטגוריה (אופציונלי).'),
});

const RecommendationOutputSchema = z.object({
  explanation: z.string().describe('התייחסות אמפתית, תיקוף המצב ושאלת מכווינה המציעה נתיבי עבודה.'),
  options: z.array(RecommendationOptionSchema).describe('רשימה של 3-4 נתיבי עבודה מותאמים אישית.'),
});
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

// פונקציית עזר לביצוע ניסיונות חוזרים במקרה של עומס (429)
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

המשימה שלך היא לא לתת פתרון חד-מימדי, אלא לקיים דיאלוג מעמיק:
1. **אמפתיה ותיקוף**: התחל בשיקוף אמפתי של מה שהמשתמש מרגיש. אם הוא מדוכא, תן מקום לעצב. אם הוא חרד, תן מקום לחוסר האונים.
2. **שאלה מכווינה**: שאל את המשתמש איך הוא היה רוצה לגשת לבעיה כרגע.
3. **נתיבי עבודה**: הצע 3-4 אופציות ספציפיות מתוך המאגר שלנו, כשלכל אחת יש הסבר קליני קצר למה היא מתאימה למצב שתיאר.

נתיבים אפשריים לייצוג:
- עבודה קוגניטיבית (מחשבות) -> JOURNAL או THOUGHTS.
- הנעה לפעולה וחיבור לערכים -> VALUES או MICRO.
- ויסות פיזיולוגי וקרקע (Grounding) -> SOS או BODY.
- עיבוד עמוק ושקט -> BILATERAL או MEDITATION או COMPASSION.

הקטגוריות והכלים הקיימים במערכת:
{{#each categories}}
- {{key}}: {{label}} ({{tagLine}})
{{/each}}
כלים אסטרטגיים נוספים: JOURNAL (יומן מחשבות), MEDITATION (מדיטציה), BILATERAL (עיבוד בילטרלי).

פנה למשתמש בשפה המותאמת למגדר שלו ({{gender}}). היה מקצועי, רגיש ולא פשטני.`,
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
