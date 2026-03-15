'use server';
/**
 * @fileOverview מנוע המלצות דיאלוגי המאפשר תשאול מעמיק ושיח רציף.
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
  explanation: z.string().describe('התייחסות אמפתית, שאלת הבהרה או הסבר.'),
  options: z.array(RecommendationOptionSchema).optional().describe('רשימת נתיבי עבודה (יוצגו רק כשיש מספיק מידע).'),
  isCrisis: z.boolean().describe('האם זוהה סיכון עצמי או אובדנות.'),
  needsMoreInfo: z.boolean().describe('האם נדרש תשאול נוסף לפני מתן כלים.'),
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
שם המשתמש: {{name}}.
מגדר המשתמש: {{gender}}.

**היסטוריית השיחה**:
{{#each history}}
{{role}}: {{{content}}}
{{/each}}
המשתמש כעת אומר: "{{{feeling}}}"

**משימה קריטית - בטיחות (Safety First)**:
עליך לזהות כל רמז למצוקה קיצונית או אובדנות. אם יש ספק - זה מצב סיכון.
במקרה של סיכון: הגדר isCrisis כ-true, שאל שאלת הבהרה מפורשת על פגיעה עצמית, פנה למשתמש בשמו ({{name}}) ואל תציע תרגילים רגילים.

**משימה עיקרית - דיאלוג ותשאול**:
1. פנה למשתמש תמיד בשמו הפרטי ({{name}}).
2. אל תהיה נחרץ מדי בתגובה הראשונה אם המידע דל.
3. אם התמונה לא ברורה, הגדר needsMoreInfo כ-true, והשתמש ב-explanation כדי לשאול שאלת הבהרה אמפתית המכוונת להבנת המצוקה.
4. רק כשיש לך תמונה ברורה מספיק, הצע 2-3 אופציות רלוונטיות מהקטגוריות (options).
5. פנה למשתמש בשפה המותאמת למגדרו ({{gender}}) ולשמו ({{name}}).

הקטגוריות הקיימות:
{{#each categories}}
- {{key}}: {{label}} ({{tagLine}})
{{/each}}
כלים נוספים: JOURNAL, MEDITATION, BILATERAL.`,
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