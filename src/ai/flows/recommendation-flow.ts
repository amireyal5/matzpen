'use server';
/**
 * @fileOverview מנוע המלצות חכם למצפן הרגשי.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { CATS } from '@/lib/data';

const RecommendationInputSchema = z.object({
  feeling: z.string().describe('תיאור ההרגשה של המשתמש כרגע.'),
  gender: z.enum(['m', 'f']).describe('מגדר המשתמש (m/f) לצורך פנייה נכונה.'),
});
export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

const RecommendationOutputSchema = z.object({
  categoryKey: z.string().describe('המפתח של הקטגוריה המומלצת.'),
  practiceIndex: z.number().describe('האינדקס של התרגיל (0 ומעלה).'),
  explanation: z.string().describe('הסבר קצר ומרגיע.'),
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
  prompt: `אתה עוזר טיפולי חכם באפליקציית "המצפן הרגשי".
המשתמש משתף איך הוא מרגיש כרגע: "{{{feeling}}}".
מגדר המשתמש הוא: {{gender}} (m = זכר, f = נקבה).

בהתבסס על המאגר הבא, בחר את האסטרטגיה שהכי תעזור לו:
1. תרגיל ספציפי מקטגוריות הקלפים.
2. יומן מחשבות (JOURNAL) - אם המשתמש נראה מבולבל או רוצה "לפרוק".
3. מדיטציה (MEDITATION) - אם המשתמש מחפש שקט עמוק.

הקטגוריות הקיימות:
{{#each categories}}
- {{key}}: {{label}} ({{tagLine}})
{{/each}}

החזר את מפתח הקטגוריה, אינדקס והסבר קצר בעברית המותאם למגדר.`,
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
