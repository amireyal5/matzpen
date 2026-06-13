"use client";

export type SoundId =
  | "tibetan-bowl"
  | "tibetan-singing-bowl-journey"
  | "angelic"
  | "mind-relaxation"
  | "dreamscape"
  | "calm-peaceful"
  | "autumn-sky"
  | "hz-frequency-258"
  | "ambient-calm"
  | "ancient-flow";

export interface SoundDefinition {
  id: SoundId;
  label: string;
  description: string;
  url: string;
  image: string;
}

export const AMBIENT_SOUNDS: SoundDefinition[] = [
  {
    id: "tibetan-bowl",
    label: "קערה טיבטית",
    description: "צלילי קערה מסורתית להרפיית מתחים",
    url: "https://storage.googleapis.com/studio-7313343264-8d6d7.firebasestorage.app/meditation-sounds/tibetan-bowl-short.mp3",
    image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600",
  },
  {
    id: "tibetan-singing-bowl-journey",
    label: "מסע קערות טיבטיות",
    description: "קערות טיבטיות להרפיה עמוקה",
    url: "https://storage.googleapis.com/studio-7313343264-8d6d7.firebasestorage.app/meditation-sounds/tibetan-singing-bowl-journey.mp3",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600",
  },
  {
    id: "angelic",
    label: "מדיטציה מלאכית",
    description: "תדרים מלאכיים רכים ורוחניים",
    url: "https://storage.googleapis.com/studio-7313343264-8d6d7.firebasestorage.app/meditation-sounds/angelic-meditation.mp3",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600",
  },
  {
    id: "mind-relaxation",
    label: "הרפיית המיינד",
    description: "מוזיקה קלה ומרגיעה למחשבה נקייה",
    url: "https://storage.googleapis.com/studio-7313343264-8d6d7.firebasestorage.app/meditation-sounds/mind-relaxation.mp3",
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=600",
  },
  {
    id: "dreamscape",
    label: "חלום בהקיץ",
    description: "נוף קול רגוע ומחבר",
    url: "https://storage.googleapis.com/studio-7313343264-8d6d7.firebasestorage.app/meditation-sounds/ambient-dreamscape.mp3",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600",
  },
  {
    id: "calm-peaceful",
    label: "רוגע ושלווה",
    description: "נעימה שלווה להשקטת התודעה",
    url: "https://storage.googleapis.com/studio-7313343264-8d6d7.firebasestorage.app/meditation-sounds/calm-and-peaceful.mp3",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600",
  },
  {
    id: "autumn-sky",
    label: "מדיטציית שמי סתיו",
    description: "מוזיקה עמוקה ומדיטטיבית",
    url: "https://storage.googleapis.com/studio-7313343264-8d6d7.firebasestorage.app/meditation-sounds/autumn-sky-meditation.mp3",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600",
  },
  {
    id: "hz-frequency-258",
    label: "תדר ריפוי 258Hz",
    description: "מוזיקת זן ותדר לאיזון האנרגיה",
    url: "https://storage.googleapis.com/studio-7313343264-8d6d7.firebasestorage.app/meditation-sounds/healing-frequency-258hz.mp3",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600",
  },
  {
    id: "ambient-calm",
    label: "רוגע עדין",
    description: "צלילי אמביינט מלטפים",
    url: "https://storage.googleapis.com/studio-7313343264-8d6d7.firebasestorage.app/meditation-sounds/ambient-calm.mp3",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600",
  },
  {
    id: "ancient-flow",
    label: "זרימה עתיקה",
    description: "מקצב נשימה איטי של 5 שניות לזרימה והרגעה",
    url: "https://firebasestorage.googleapis.com/v0/b/studio-7313343264-8d6d7.firebasestorage.app/o/meditation-sounds%2Fsiarhei_korbut-ancient-flow-breathing-5-seconds-pattern-523497.mp3?alt=media&token=9312f735-0769-4561-99ec-ab898b20b74a",
    image: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=600",
  },
];
