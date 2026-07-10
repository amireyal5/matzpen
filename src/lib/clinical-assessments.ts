export interface AssessmentQuestion {
  id: string;
  text_m: string; // זכר
  text_f: string; // נקבה
}

export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  color: string;
  recommendation: string;
}

export interface AssessmentDefinition {
  id: "gad7" | "phq9";
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  scoreRanges: ScoreRange[];
}

export const GAD7_ASSESSMENT: AssessmentDefinition = {
  id: "gad7",
  title: "שאלון חרדה כללית (GAD-7)",
  description: "שאלון קליני מתוקף בן 7 שאלות להערכת רמת החרדה בשבועיים האחרונים.",
  questions: [
    {
      id: "gad_1",
      text_m: "חשבת או הרגשת עצבני, מתוח או מודאג?",
      text_f: "חשבת או הרגשת עצבנית, מתוחה או מודאגת?"
    },
    {
      id: "gad_2",
      text_m: "חשת קושי להפסיק את הדאגות או לשלוט בהן?",
      text_f: "חשת קושי להפסיק את הדאגות או לשלוט בהן?"
    },
    {
      id: "gad_3",
      text_m: "דאגת יתר לגבי דברים שונים ומגוונים?",
      text_f: "דאגת יתר לגבי דברים שונים ומגוונים?"
    },
    {
      id: "gad_4",
      text_m: "חשת קושי להירגע?",
      text_f: "חשת קושי להירגע?"
    },
    {
      id: "gad_5",
      text_m: "היית חסר שקט עד כדי כך שקשה לך לשבת במקום?",
      text_f: "היית חסרת שקט עד כדי כך שקשה לך לשבת במקום?"
    },
    {
      id: "gad_6",
      text_m: "התעצבנת בקלות או חשת קוצר רוח?",
      text_f: "התעצבנת בקלות או חשת קוצר רוח?"
    },
    {
      id: "gad_7",
      text_m: "הרגשת פחד או חשש כאילו משהו נורא עומד לקרות?",
      text_f: "הרגשת פחד או חשש כאילו משהו נורא עומד לקרות?"
    }
  ],
  scoreRanges: [
    {
      min: 0,
      max: 4,
      label: "חרדה מינימלית",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      recommendation: "רמת החרדה שלך תקינה ובטווח הנורמה. מומלץ להמשיך להשתמש בתרגילי נשימה ומדיטציה לתחזוקה כללית של הרוגע."
    },
    {
      min: 5,
      max: 9,
      label: "חרדה קלה",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      recommendation: "נראה שקיימת חרדה קלה. תרגול קבוע של יומן מחשבות CBT ותרגילי נשימה יכול לעזור להקל על התסמינים ולהחזיר איזון."
    },
    {
      min: 10,
      max: 14,
      label: "חרדה בינונית",
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      recommendation: "רמת החרדה מצביעה על קושי בינוני. מומלץ להסתייע בכלי ה-EMDR הדו-צדדי להפחתת עוררות אקוטית, ובמידת הצורך לשקול פנייה לייעוץ מקצועי."
    },
    {
      min: 15,
      max: 21,
      label: "חרדה חמורה",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      recommendation: "ציונך מעיד על חרדה חמורה שעלולה לפגוע באיכות החיים. אנו ממליצים בחום לפנות לאיש מקצוע בתחום בריאות הנפש. כלי ה-SOS והנשימות באפליקציה זמינים עבורך כעזרה ראשונה."
    }
  ]
};

export const PHQ9_ASSESSMENT: AssessmentDefinition = {
  id: "phq9",
  title: "מדד רווחה ומצב רוח (PHQ-9)",
  description: "שאלון קליני מתוקף בן 9 שאלות למעקב אחר מצב הרוח והאנרגיה בשבועיים האחרונים.",
  questions: [
    {
      id: "phq_1",
      text_m: "היה לך עניין מועט או חוסר הנאה בביצוע פעולות?",
      text_f: "היה לך עניין מועט או חוסר הנאה בביצוע פעולות?"
    },
    {
      id: "phq_2",
      text_m: "הרגשת מדוכדך, עצוב או חסר אונים?",
      text_f: "הרגשת מדוכדכת, עצובה או חסרת אונים?"
    },
    {
      id: "phq_3",
      text_m: "חווית קשיים בשינה (קושי להירדם, יקיצות מרובות או שינת יתר)?",
      text_f: "חווית קשיים בשינה (קושי להירדם, יקיצות מרובות או שינת יתר)?"
    },
    {
      id: "phq_4",
      text_m: "הרגשת עייפות או חוסר אנרגיה?",
      text_f: "הרגשת עייפות או חוסר אנרגיה?"
    },
    {
      id: "phq_5",
      text_m: "חווית תיאבון ירוד או אכילת יתר?",
      text_f: "חווית תיאבון ירוד או אכילת יתר?"
    },
    {
      id: "phq_6",
      text_m: "הרגשת רע כלפי עצמך - שאתה כישלון או שאכזבת את עצמך או את משפחתך?",
      text_f: "הרגשת רע כלפי עצמך - שאת כישלון או שאכזבת את עצמך או את משפחתך?"
    },
    {
      id: "phq_7",
      text_m: "חשת קושי בריכוז בדברים כמו קריאת עיתון או צפייה בטלוויזיה?",
      text_f: "חשת קושי בריכוז בדברים כמו קריאת עיתון או צפייה בטלוויזיה?"
    },
    {
      id: "phq_8",
      text_m: "האם דיברת או נעצרת באיטיות שהייתה ניכרת לאחרים? או לחילופין, שהיית חסר שקט ותזזיתי מהרגיל?",
      text_f: "האם דיברת או נעצרת באיטיות שהייתה ניכרת לאחרים? או לחילופין, שהיית חסרת שקט ותזזיתית מהרגיל?"
    },
    {
      id: "phq_9",
      text_m: "היו לך מחשבות שעדיף היה למות, או לפגוע בעצמך בדרך כלשהי?",
      text_f: "היו לך מחשבות שעדיף היה למות, או לפגוע בעצמך בדרך כלשהי?"
    }
  ],
  scoreRanges: [
    {
      min: 0,
      max: 4,
      label: "מצב רוח תקין",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      recommendation: "מצב הרוח שלך יציב ותקין. המשך/י להשקיע ברווחה האישית שלך באמצעות תרגילי החוסן והכרת התודה."
    },
    {
      min: 5,
      max: 9,
      label: "דיכאון קל",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      recommendation: "חלה ירידה קלה במצב הרוח. כתיבה ביומן מחשבות CBT ותרגילי דמיון מודרך יכולים לסייע בהעלאת האנרגיה והפרספקטיבה."
    },
    {
      min: 10,
      max: 14,
      label: "דיכאון בינוני",
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      recommendation: "ניכרת השפעה בינונית על מצב הרוח. מומלץ לשלב פעילות גופנית קלה, לתרגל חוסן, ובמידת הצורך לפנות לליווי של איש מקצוע."
    },
    {
      min: 15,
      max: 19,
      label: "דיכאון בינוני-חמור",
      color: "text-rose-500/90 bg-rose-500/5 border-rose-500/10",
      recommendation: "מצב הרוח פגוע בצורה ניכרת. אנו ממליצים לפנות להתייעצות עם מטפל מוסמך לקבלת מענה מקיף."
    },
    {
      min: 20,
      max: 27,
      label: "דיכאון חמור",
      color: "text-rose-600 bg-rose-600/10 border-rose-600/20",
      recommendation: "ציונך מעיד על מצוקה דיכאונית קשה מאוד. אנא פנה/י לטיפול מקצועי או צור/י קשר עם מוקדי הסיוע (ער\"ן 1201)."
    }
  ]
};

export function getScoreInterpretation(score: number, type: "gad7" | "phq9"): ScoreRange {
  const def = type === "gad7" ? GAD7_ASSESSMENT : PHQ9_ASSESSMENT;
  const range = def.scoreRanges.find(r => score >= r.min && score <= r.max);
  return range || def.scoreRanges[0];
}
