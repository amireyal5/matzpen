"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

interface AmbientVideoBackgroundProps {
  src: string;
  className?: string;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
}

export default function AmbientVideoBackground({ src, className, overlayClassName, overlayStyle }: AmbientVideoBackgroundProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <video
        key={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div
        className={cn("absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/45 to-slate-950/80", overlayClassName)}
        style={overlayStyle}
      />
    </div>
  );
}
