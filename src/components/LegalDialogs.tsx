
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
    title: "תנאי שימוש",
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-700">
        <p>ברוכים הבאים לאפליקציית "המצפן הרגשי". השימוש באפליקציה כפוף לתנאים הבאים:</p>
        <ul className="list-disc pr-5 space-y-2">
          <li>האפליקציה מיועדת לשימוש אישי בלבד ככלי עזר לניהול רגשי ובניית חוסן.</li>
          <li>השימוש באפליקציה דורש הרשמה ואימות אימייל כדי להבטיח את פרטיות המידע שלך.</li>
          <li>המידע האישי שלך (שם ומגדר) נשמר בצורה מאובטחת ומיועד להתאמת חוויית המשתמש בלבד.</li>
          <li>אין להעתיק, להפיץ או לעשות שימוש מסחרי בתכני האפליקציה ללא אישור מראש.</li>
          <li>המערכת עושה שימוש בטכנולוגיית בינה מלאכותית (GenAI) לצורך המלצות. יש להתייחס להמלצות אלו כהצעה בלבד.</li>
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
          <li>הוספנו תמיכה בקריינות קולית (TTS) לכל כרטיסיות התרגול.</li>
          <li>הממשק מותאם לשימוש עם קוראי מסך ועומד בתקני נגישות מקובלים.</li>
          <li>אם נתקלתם בקושי בנגישות, נשמח אם תצרו קשר דרך האתר הרשמי לשיפור החוויה.</li>
        </ul>
      </div>
    ),
  },
  disclaimer: {
    title: "הצהרת פטור מאחריות (Disclaimer)",
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-700">
        <p className="font-bold text-indigo-900 underline">חשוב מאוד:</p>
        <p>אפליקציית "המצפן הרגשי" היא כלי עזר חינוכי ופרקטי בלבד. המידע והתרגילים המופיעים בה **אינם מהווים תחליף לייעוץ, אבחון או טיפול נפשי/רפואי מקצועי**.</p>
        <p>במקרים של מצוקה נפשית קשה, מחשבות על פגיעה עצמית או מצב חירום רפואי, יש לפנות מיידית לגורמי סיוע מקצועיים, למוקדי החירום (מד"א 101, משטרה 100) או לער"ן (1201).</p>
        <p>השימוש באפליקציה ובתכניה הוא באחריות המשתמש בלבד. המפתח אינו אחראי לכל נזק שעלול להיגרם משימוש במידע המוצג בה.</p>
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
            מידע משפטי וכללי אודות האפליקציה
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto hide-scrollbar">
          {content.body}
        </div>
      </DialogContent>
    </Dialog>
  );
}
