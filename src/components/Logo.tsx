
"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

/**
 * רכיב לוגו מרכזי המבוסס על ה-SVG החדש.
 * @param variant - "full" מציג אייקון וטקסט, "icon" מציג רק את האייקון (לשימוש בתוך מיכלים קטנים).
 */
export default function Logo({ className, variant = "full" }: LogoProps) {
  if (variant === "icon") {
    return (
      <svg 
        viewBox="70 80 180 123" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-full", className)}
      >
        <path 
          d="M70 170C70 120.294 110.294 80 160 80C209.706 80 250 120.294 250 170H205C205 145.147 184.853 125 160 125C135.147 125 115 145.147 115 170H70Z" 
          fill="#78C6EF"
        />
        <rect x="70" y="185" width="180" height="18" fill="#C0A0F0" />
      </svg>
    );
  }

  return (
    <svg 
      viewBox="0 0 300 300" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
    >
      <path 
        d="M70 170C70 120.294 110.294 80 160 80C209.706 80 250 120.294 250 170H205C205 145.147 184.853 125 160 125C135.147 125 115 145.147 115 170H70Z" 
        fill="#78C6EF"
      />
      <rect x="70" y="185" width="180" height="18" fill="#C0A0F0" />
      <text 
        x="160" 
        y="245" 
        fill="currentColor" 
        fontFamily="Assistant, sans-serif" 
        fontSize="32" 
        textAnchor="middle" 
        fontWeight="700" 
        letterSpacing="0.02em"
        className="text-white"
      >
        המצפן הרגשי
      </text>
    </svg>
  );
}
