'use server';
/**
 * @fileOverview ניתוח CBT של יומן מחשבות עם מנגנון זיהוי סיכון.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const JournalAnalysisInputSchema = z.object({
  event: z.string(),
  interpretation: z.string(),
  feeling: z.string(),
  reaction: z.string(),
  gender: z.enum(['m', 'f']),
});
export type JournalAnalysisInput = z.infer<typeof JournalAnalysisInputSchema>;

const JournalAnalysisOutputSchema = z.object({
  distortions: z.array(z.string()),
  healthyPerspective: z.string(),
  summary: z.string(),
  isCrisis: z.boolean().describe('האם התוכן מעיד על סיכון עצמי.'),
});
export type JournalAnalysisOutput = z.infer<typeof JournalAnalysisOutputSchema>;

async function fetchWithRetry(fn: () => Promise<any>, retries = 7) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message || '';
      if (error?.status === 429 || errorMsg.includes('429')) {
        const delay = Math.pow(2, i) * 1500;
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

export async function analyzeJournal(input: JournalAnalysisInput): Promise<JournalAnalysisOutput> {
  return fetchWithRetry(() => journalAnalysisFlow(input));
}

const prompt = ai.definePrompt({
  name: 'journalAnalysisPrompt',
  input: { schema: JournalAnalysisInputSchema },
  output: { schema: JournalAnalysisOutputSchema },
  prompt: `אתה פסיכותרפיסט מומחה ב-CBT. המשתמש מילא יומן אפר"ת.
מגדר המשתמש: {{gender}}.

**בטיחות מעל הכל (Safety First)**:
עליך לגלות ערנות מקסימלית לכל רמז של ייאוש קיצוני, חוסר טעם לחיים או רצון לפגוע בעצמו. 
ביטויים כמו "אין לי כוח יותר", "נמאס לי מהכל", "הלוואי ולא הייתי פה" - מחייבים התייחסות כאל מצב סיכון.

אם התוכן מעיד על כוונה לפגיעה עצמית או אובדנות (כולל אמירות עמומות של ייאוש סופי):
1. הגדר isCrisis כ-true.
2. כתוב בסיכום (summary) שאתה מזהה מצוקה קשה מאוד וייאוש שדורשים מענה אנושי מיידי. 
3. הצהר מפורשות: "חשוב לי לומר שבמצב הזה, הכלי הדיגיטלי אינו המענה הנכון. בבקשה, אל תישאר עם התחושות האלה לבד."
4. שאל שאלת הבהרה מפורשת: "האם יש לך מחשבה לפגוע בעצמך כרגע? בבקשה פנה לעזרה מקצועית ברגע זה."

אם אין סיכון:
נתח עיוותי חשיבה, הצע פרשנות בריאה וכתוב סיכום מחזק.`,
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
