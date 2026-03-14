
'use server';
/**
 * @fileOverview מנוע המלצות חכם למצפן הרגשי.
 * מקבל את הרגשת המשתמש ומחזיר את הקטגוריה המתאימה ביותר.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { CATS } from '@/lib/data';

const RecommendationInputSchema = z.object({
  feeling: z.string().describe('תיאור ההרגשה של המשתמש כרגע.'),
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

בהתבסס על הקטגוריות הבאות, בחר את הקטגוריה שהכי תעזור לו כרגע:
{{#each categories}}
- {{key}}: {{label}} ({{tagLine}})
{{/each}}

החזר את מפתח הקטגוריה (key) והסבר קצר, אישי ומחזק בעברית רהוטה.
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
