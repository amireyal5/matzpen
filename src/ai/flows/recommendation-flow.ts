'use server';
/**
 * @fileOverview מנוע המלצות חכם למצפן הרגשי.
 * מקבל את הרגשת המשתמש ואת המגדר שלו, ומחזיר את הקטגוריה והתרגיל המתאימים ביותר.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { CATS, BANK } from '@/lib/data';

const RecommendationInputSchema = z.object({
  feeling: z.string().describe('תיאור ההרגשה של המשתמש כרגע.'),
  gender: z.enum(['m', 'f']).describe('מגדר המשתמש (m/f) לצורך פנייה נכונה.'),
});
export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

const RecommendationOutputSchema = z.object({
  categoryKey: z.string().describe('המפתח של הקטגוריה המומלצת.'),
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

בהתבסס על המאגר הבא, בחר את הקטגוריה והתרגיל הספציפי (האינדקס שלו ברשימה) שהכי יעזרו לו כרגע.
שים לב לשמות התרגילים ולמהות שלהם.

הקטגוריות הקיימות:
{{#each categories}}
- {{key}}: {{label}} ({{tagLine}})
{{/each}}

תרגילים לדוגמה (מפתחות):
SOS: מים קרים, נשימה 4-4-8, דחיפת קיר...
BODY: סריקת גוף, ניעור, נשימת קופסה...
ACCEPTANCE: עננים, התרחבות, תיקוף...

החזר את מפתח הקטגוריה (categoryKey), את האינדקס של התרגיל (practiceIndex) והסבר קצר ומחזק בעברית רהוטה המותאם למגדר ({{gender}}).
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
