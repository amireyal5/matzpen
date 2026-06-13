import { format, subDays } from "date-fns";

export type MoodLogEntry = {
  mood: string;
  value: number;
  ts: number;
};

export type MoodLogs = Record<string, MoodLogEntry>;

export interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  value: number;
  suggestionCatKey?: string;
  suggestionLabel?: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: "calm", emoji: "😌", label: "רוגע/ה", value: 5 },
  { id: "good", emoji: "🙂", label: "טוב לי", value: 4 },
  { id: "neutral", emoji: "😐", label: "ניטרלי", value: 3 },
  { id: "stressed", emoji: "😟", label: "לחוץ/ה", value: 2, suggestionCatKey: "SOS", suggestionLabel: "כלי SOS מהיר" },
  { id: "low", emoji: "😔", label: "קשה לי", value: 1, suggestionCatKey: "ACCEPTANCE", suggestionLabel: "תרגיל קבלה ורוגע" },
];

export function todayKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * רצף ימים רצופים: יום נוכחי שלא תועד עדיין לא שובר את הרצף,
 * אך יום שדולג בעבר עוצר את הספירה.
 */
export function computeStreak(moodLogs: MoodLogs = {}): number {
  let streak = 0;
  let cursor = new Date();

  if (!moodLogs[todayKey(cursor)]) {
    cursor = subDays(cursor, 1);
  }

  while (moodLogs[todayKey(cursor)]) {
    streak++;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export function getMoodTrend(moodLogs: MoodLogs = {}, days = 14) {
  const result: { date: string; label: string; value: number | null }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const key = todayKey(d);
    const entry = moodLogs[key];
    result.push({
      date: key,
      label: format(d, "dd/MM"),
      value: entry ? entry.value : null,
    });
  }
  return result;
}
