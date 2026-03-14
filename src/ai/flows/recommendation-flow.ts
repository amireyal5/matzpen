'use server';
/**
 * @fileOverview מנוע המלצות חכם למצפן הרגשי.
 * מעודכן לזהות צורך ביומן מחשבות או במדיטציה.
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
  categoryKey: z.string().describe('המפתח של הקטגוריה המומלצת. יכול להיות גם "JOURNAL" או "MEDITATION".'),
  practiceIndex: z.number().describe('האינדקס של התרגיל הספציפי בתוך הקטגוריה (0 ומעלה).'),
  explanation: z.string().describe('הסבר קצר ומרגיע למה הקטגוריה והתרגיל האלו יעזרו למשתמש כרגע.'),
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

בהתבסס על המאגר הבא, בחר את האסטרטגיה שהכי תעזור לו:
1. תרגיל ספציפי מקטגוריות הקלפים (SOS, BODY, וכו').
2. יומן מחשבות (JOURNAL) - אם המשתמש נראה מבולבל, חווה מחשבות טורדניות או רוצה "לפרוק".
3. מדיטציה (MEDITATION) - אם המשתמש מחפש שקט עמוק, חיבור פנימי או הפוגה ארוכה יותר.

הקטגוריות הקיימות:
{{#each categories}}
- {{key}}: {{label}} ({{tagLine}})
{{/each}}

החזר את מפתח הקטגוריה (categoryKey), את האינדקס (במקרה של JOURNAL או MEDITATION האינדקס הוא 0) והסבר קצר בעברית המותאם למגדר ({{gender}}).`,
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
