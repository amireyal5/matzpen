'use server';
/**
 * @fileOverview מנוע המלצות דיאלוגי אסטרטגי המכוון לפתרונות מעשיים.
 * נועד להעניק מענה אמפתי אך קצר, המוביל לבחירת כלי עבודה בתוך 1-2 חילופי דברים.
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
  explanation: z.string().describe('התייחסות אמפתית, תמציתית ומכוונת פתרון.'),
  options: z.array(RecommendationOptionSchema).optional().describe('רשימת נתיבי עבודה (יוצגו רק כשיש מספיק מידע).'),
  quickReplies: z.array(z.string()).optional().describe('הצעות לתשובות מהירות.'),
  isCrisis: z.boolean().describe('האם זוהה סיכון עצמי ודאי.'),
  needsMoreInfo: z.boolean().describe('האם נדרש תשאול קצר נוסף.'),
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
הגישה שלך: אמפתיה עמוקה, חוכמה, ותמציתיות אסטרטגית.

**המשימה שלך**:
המשתמש משתף אותך במצבו. עליך להוביל אותו לפתרון מעשי (תרגיל או קטגוריה) בתוך מקסימום 1-2 חילופי דברים. אל תגרור את הדיאלוג לשאלות אין-סופיות.

**פרוטוקול בטיחות**:
1. **סיכון ודאי**: אמירה מפורשת על פגיעה עצמית -> הגדר isCrisis כ-true.
2. **אמירה מעורפלת ("נמאס לי", "אין לי כוח")**: בצע תשאול בטיחות קצר בתוך הדיאלוג (נשמע שאתה מותש מאוד, חשוב לי לשאול - האם יש מחשבה לפגוע בעצמך?). הגדר needsMoreInfo כ-true. 
3. **מצוקה רגילה**: תן תיקוף (Validation) קצר והצע מיד 2-3 כלים רלוונטיים מהרשימה מטה.

**מבנה התשובה**:
- פנייה אישית בשם ({{name}}) ובמגדר הנכון ({{gender}}).
- "explanation": משפט אמפתי אחד, הסבר קצר על הכלי המוצע, ובדיקת בטיחות אם נדרש.
- "options": הצג תמיד כשיש כיוון ברור.
- "quickReplies": השתמש בהם כדי לעזור למשתמש לדייק את הצורך שלו מהר.

הקטגוריות הקיימות:
{{#each categories}}
- {{key}}: {{label}} ({{tagLine}})
{{/each}}
כלים נוספים: JOURNAL (יומן מחשבות CBT), MEDITATION (מרחב השקט), BILATERAL (עיבוד בילטרלי הרמוני).`,
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