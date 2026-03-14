"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type LegalType = "terms" | "accessibility" | "disclaimer";

interface LegalDialogProps {
  type: LegalType;
  trigger: React.ReactNode;
}

const CONTENT: Record<LegalType, { title: string; body: React.ReactNode }> = {
  terms: {
    title: "תנאי שימוש ופרטיות",
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-700">
        <p>ברוכים הבאים לאפליקציית "המצפן הרגשי". אנו מחויבים לשמירה מלאה על פרטיותך:</p>
        <ul className="list-disc pr-5 space-y-2">
          <li><strong>פרטיות מידע:</strong> כל המידע שאתה מזין ביומן המחשבות נשמר בשרת ענן מאובטח (Firebase) ונגיש אך ורק לך באמצעות החשבון האישי שלך.</li>
          <li><strong>אבטחה:</strong> הגישה למידע מוגנת על ידי פרוטוקולי אבטחה קפדניים. אף משתמש אחר או גורם חיצוני אינו יכול לצפות בתוכן היומנים שלך.</li>
          <li><strong>שימוש ב-AI:</strong> הטקסטים נשלחים לעיבוד בינה מלאכותית (Gemini) לצורך ניתוח CBT בלבד. המידע אינו משמש לאימון המודל ואינו נשמר במאגרי המודל באופן מזהה.</li>
          <li><strong>שליטה במידע:</strong> יש לך שליטה מלאה על המידע שלך. באפשרותך למחוק כל יומן או תובנה מהמרחב האישי בכל עת.</li>
          <li><strong>מחיקת חשבון:</strong> במידה ותדרוש למחוק את חשבונך לצמיתות, כל המידע המקושר אליו יימחק מהשרתים באופן מיידי.</li>
        </ul>
      </div>
    ),
  },
  accessibility: {
    title: "הצהרת נגישות",
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-700">
        <p>אנו רואים חשיבות עליונה בהנגשת הכלים הטיפוליים לכלל האוכלוסייה, כולל אנשים עם מוגבלויות.</p>
        <ul className="list-disc pr-5 space-y-2">
          <li>האפליקציה עוצבה תוך הקפדה על ניגודיות צבעים גבוהה ופונטים קריאים.</li>
          <li>הוספנו תמיכה בקריינות קולית (TTS) לכל כרטיסיות התרגול וליומן המחשבות.</li>
          <li>הממשק מותאם לשימוש עם קוראי מסך ועומד בתקני נגישות מקובלים.</li>
          <li>קיימת אפשרות להזנת תוכן קולית (Speech-to-Text) עבור משתמשים המעדיפים לדבר במקום להקליד.</li>
        </ul>
      </div>
    ),
  },
  disclaimer: {
    title: "הבהרה משפטית",
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-700">
        <p><strong>כתב ויתור ואחריות (Disclaimer):</strong></p>
        <p>אפליקציית "המצפן הרגשי" היא כלי עזר חינוכי ופרקטי בלבד. המידע והתרגילים המופיעים בה <strong>אינם מהווים תחליף לייעוץ, אבחון או טיפול נפשי/רפואי מקצועי</strong>.</p>
        <p>הניתוחים המבוצעים על ידי הבינה המלאכותית הם בגדר המלצה ונקודת מבט נוספת בלבד, ואין לראות בהם אבחנה קלינית. השימוש באפליקציה אינו מהווה רשומה רפואית ואינו חוסה תחת סודיות רפואית של יחסי מטפל-מטופל.</p>
        <p>יש לבצע את התרגילים הפיזיים בהתאם ליכולתך האישית. אם מורגש כאב, סחרחורת או אי-נוחות חריגה, יש <strong>להפסיק את הפעילות מיידית</strong>.</p>
        <p>במקרים של מצוקה נפשית קשה, מחשבות על פגיעה עצמית או מצב חירום רפואי, <strong>אין להסתמך על האפליקציה</strong>. יש לפנות מיידית לגורמי סיוע מקצועיים, למוקדי החירום (מד"א 101, משטרה 100) או לער"ן (בטלפון 1201).</p>
      </div>
    ),
  },
};

export function LegalDialog({ type, trigger }: LegalDialogProps) {
  const content = CONTENT[type];
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md rounded-[2rem] bg-white border-none shadow-2xl p-8" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl font-black text-slate-900 mb-2">
            {content.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            מידע משפטי ופרטיות אודות האפליקציה
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto hide-scrollbar">
          {content.body}
        </div>
      </DialogContent>
    </Dialog>
  );
}
