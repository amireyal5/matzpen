'use server';
/**
 * @fileOverview ניתוח CBT של יומן מחשבות לפי מודל אפר"ת.
 * מזהה עיוותי חשיבה ומציע פרשנות בריאה יותר.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const JournalAnalysisInputSchema = z.object({
  event: z.string().describe('תיאור האירוע'),
  interpretation: z.string().describe('הפרשנות של המשתמש'),
  feeling: z.string().describe('הרגש שחווה המשתמש'),
  reaction: z.string().describe('התגובה של המשתמש'),
  gender: z.enum(['m', 'f']).describe('מגדר המשתמש'),
});
export type JournalAnalysisInput = z.infer<typeof JournalAnalysisInputSchema>;

const JournalAnalysisOutputSchema = z.object({
  distortions: z.array(z.string()).describe('רשימת עיוותי חשיבה שזוהו (למשל: חשיבה קטסטרופלית, הכל או כלום).'),
  healthyPerspective: z.string().describe('הצעה לפרשנות חלופית ומאוזנת יותר.'),
  summary: z.string().describe('סיכום קצר, תומך ומחזק של התהליך.'),
});
export type JournalAnalysisOutput = z.infer<typeof JournalAnalysisOutputSchema>;

export async function analyzeJournal(input: JournalAnalysisInput): Promise<JournalAnalysisOutput> {
  return journalAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'journalAnalysisPrompt',
  input: { schema: JournalAnalysisInputSchema },
  output: { schema: JournalAnalysisOutputSchema },
  prompt: `אתה פסיכותרפיסט מומחה ב-CBT. המשתמש מילא יומן מחשבות לפי מודל אפר"ת.
מגדר המשתמש: {{gender}}.

הנתונים שמולאו:
- אירוע: {{{event}}}
- פרשנות (מחשבה): {{{interpretation}}}
- רגש: {{{feeling}}}
- תגובה: {{{reaction}}}

המשימה שלך:
1. זהה לפחות 1-2 עיוותי חשיבה נפוצים בפרשנות של המשתמש (למשל: הכללה מופרזת, קריאת מחשבות, חשיבה קטסטרופלית, הכל או כלום, "חייב/צריך", הסקה רגשית).
2. הצע פרשנות חלופית (זווית חדשה) שהיא מאוזנת יותר, מציאותית ומפחיתה מצוקה.
3. כתוב סיכום קצר ומחזק המעודד את המשתמש על העבודה שעשה.

פנה למשתמש בשפה המותאמת למגדר שלו ({{gender}}). היה אמפתי, מקצועי וחד.`,
});

const journalAnalysisFlow = ai.defineFlow(
  {
    name: 'journalAnalysisFlow',
    inputSchema: JournalAnalysisInputSchema,
    outputSchema: JournalAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
