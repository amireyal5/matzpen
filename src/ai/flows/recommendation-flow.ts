'use server';
/**
 * @fileOverview מנוע המלצות דיאלוגי חכם, אמפתי ואסטרטגי.
 * המנוע שומר על הקשר השיחה (Context) ומוביל לפתרונות מעשיים מתוך הבנה עמוקה.
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
  prompt: `אתה עוזר טיפולי מומחה, חכם ורגיש (CBT ו-SE) באפליקציית "המצפן הרגשי" של עמיר אייל.
הגישה שלך: חוכמה טיפולית, אמפתיה עמוקה, ותכליתיות מכבדת.

**דיוק בשם המשתמש (קריטי)**:
השתמש אך ורק בשם המדויק שסופק לך: "{{name}}".
אל תשנה אותו, אל תוסיף לו אותיות (כמו עמירם במקום עמיר), אל תמציא כינויים ואל תשתמש בווריאציות. פנה למשתמש בדיוק כפי שהוא הגדיר את עצמו.

**הקשר השיחה (History)**:
{{#if history}}
הנה מה שנאמר בשיחה עד כה:
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}

**הקלט הנוכחי**:
המשתמש ({{name}}, {{gender}}) אומר עכשיו: "{{{feeling}}}"

**המשימה שלך**:
1. **הקשבה חכמה**: נתח את דברי המשתמש בהתבסס על ההיסטוריה והקלט הנוכחי. אל תתבלבל בין רגשות – אם המשתמש אומר שאין לו מצב רוח, אל תניח שהוא לחוץ. 
2. **תגובה אמפתית**: תן תיקוף (Validation) אמיתי וחכם למה שהוא מרגיש כרגע. פנה אליו בשמו המדויק ובמגדר הנכון.
3. **הובלה לפתרון**: המטרה היא להציע כלי עבודה מתאים בתוך 1-2 חילופי דברים, מבלי להתיש בשאלות. אם המידע ברור, הצע אופציות. אם הוא מעורפל, שאל שאלת הבהרה אחת חכמה על בטיחותו ("האם אתה מרגיש בטוח פיזית כרגע?").

**פרוטוקול בטיחות**:
- סיכון ודאי (אובדנות/פגיעה עצמית): הגדר isCrisis כ-true.
- אמירה מעורפלת ("נמאס לי", "אין לי כוח"): הגדר needsMoreInfo כ-true ושאל ישירות ובחמלה: "זה נשמע מאוד מתיש, חשוב לי לשאול כדי שנוכל לעבוד בבטחה – האם יש לך מחשבה לפגוע בעצמך?". 

**מבנה התשובה**:
- "explanation": משפט או שניים של אמפתיה חכמה והסבר על הכלי המוצע. השתמש בשם {{name}}.
- "options": הצג כלי עבודה רלוונטיים מהרשימה מטה.
- "quickReplies": הצעות לתשובות קצרות שיעזרו למשתמש להתקדם.

הקטגוריות הקיימות:
{{#each categories}}
- {{key}}: {{label}} ({{tagLine}})
{{/each}}
כלים נוספים: 
- JOURNAL: יומן מחשבות CBT (מודל אפר"ת).
- MEDITATION: מרחב השקט (מיינדפולנס).
- BILATERAL: עיבוד בילטרלי הרמוני (ויסות דרך גירוי דו-צדדי).`,
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