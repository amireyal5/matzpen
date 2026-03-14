
'use server';
/**
 * @fileOverview מנוע המלצות חכם למצפן הרגשי.
 * מקבל את הרגשת המשתמש ואת המגדר שלו, ומחזיר את הקטגוריה המתאימה ביותר עם הסבר מותאם מגדרית.
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
  categoryKey: z.string().describe('המפתח של הקטגוריה המומלצת (מתוך רשימת המפתחות הקיימים).'),
  explanation: z.string().describe('הסבר קצר ומרגיע למה הקטגוריה הזו תעזור למשתמש כרגע.'),
});
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

export async function getRecommendation(input: RecommendationInput): Promise<RecommendationOutput> {
  return recommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendationPrompt',
  input: { schema: RecommendationInputSchema },
  output: { schema: RecommendationOutputSchema },
  prompt: `אתה עוזר טיפולי חכם באפליקציית "המצפן הרגשי".
המשתמש משתף איך הוא מרגיש כרגע: "{{{feeling}}}".
מגדר המשתמש הוא: {{gender}} (m = זכר, f = נקבה).

בהתבסס על הקטגוריות הבאות, בחר את הקטגוריה שהכי תעזור לו כרגע:
{{#each categories}}
- {{key}}: {{label}} ({{tagLine}})
{{/each}}

החזר את מפתח הקטגוריה (key) והסבר קצר, אישי ומחזק בעברית רהוטה.
חשוב מאוד: עליך לנסח את ההסבר (explanation) בדיוק לפי המגדר של המשתמש ({{gender}}). 
אם זה m - פנה בלשון זכר. אם זה f - פנה בלשון נקבה.
אל תשתמש בלוכסנים (כמו בחר/י), אלא פנה ישירות ובצורה חמה.

אם המשתמש נשמע במצוקה קשה מאוד, בחר תמיד ב-SOS.`,
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
