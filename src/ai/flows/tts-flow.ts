
'use server';
/**
 * @fileOverview המרת טקסט לדיבור (TTS) עבור כרטיסיות המצפן.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import wav from 'wav';

const TTSInputSchema = z.object({
  text: z.string().describe('הטקסט להקראה.'),
  gender: z.enum(['m', 'f']).default('m'),
});
export type TTSInput = z.infer<typeof TTSInputSchema>;

const TTSOutputSchema = z.object({
  audioUri: z.string().describe('כתובת ה-Data URI של האודיו שנוצר.'),
});
export type TTSOutput = z.infer<typeof TTSOutputSchema>;

export async function generateSpeech(input: TTSInput): Promise<TTSOutput> {
  return ttsFlow(input);
}

const ttsFlow = ai.defineFlow(
  {
    name: 'ttsFlow',
    inputSchema: TTSInputSchema,
    outputSchema: TTSOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { 
              voiceName: input.gender === 'f' ? 'Achernar' : 'Algenib' 
            },
          },
        },
      },
      prompt: input.text,
    });

    if (!media) {
      throw new Error('לא נוצר קובץ קול');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    return {
      audioUri: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
