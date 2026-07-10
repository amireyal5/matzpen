"use client";

import { useEffect, useRef } from "react";

interface UseBilateralAudioOptions {
  enabled: boolean;
  side: "left" | "right" | "center";
  volume: number;
  toneType: "click" | "tone" | "bowl";
}

export function useBilateralAudio({ enabled, side, volume, toneType }: UseBilateralAudioOptions) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const prevSideRef = useRef<"left" | "right" | "center">("center");

  // Initialize AudioContext lazily
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const panner = ctx.createStereoPanner();
      const gain = ctx.createGain();

      panner.connect(gain);
      gain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      pannerNodeRef.current = panner;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser:", e);
    }
  };

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume * 0.7, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Play tone based on side change
  useEffect(() => {
    if (!enabled || side === "center") {
      prevSideRef.current = side;
      return;
    }

    // Play only when side actually changes
    if (side === prevSideRef.current) return;
    prevSideRef.current = side;

    initAudio();

    const ctx = audioCtxRef.current;
    const panner = pannerNodeRef.current;
    if (!ctx || !panner) return;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    // Set pan value: -1 for left, 1 for right
    const panVal = side === "left" ? -1 : 1;
    panner.pan.setValueAtTime(panVal, now);

    // Create oscillator
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.connect(oscGain);
    oscGain.connect(panner);

    if (toneType === "click") {
      // Woodblock-like click
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

      oscGain.gain.setValueAtTime(1, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.start(now);
      osc.stop(now + 0.06);
    } else if (toneType === "tone") {
      // Gentle sine tone
      osc.type = "sine";
      osc.frequency.setValueAtTime(396, now); // 396Hz Solfeggio frequency

      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.6, now + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.28);
    } else if (toneType === "bowl") {
      // Tibetan Bowl resonance
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now); // Warm base frequency
      
      // Add a subtle frequency sweep
      osc.frequency.linearRampToValueAtTime(223, now + 0.3);

      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.8, now + 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.start(now);
      osc.stop(now + 0.75);
    }
  }, [side, enabled, toneType]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  return {
    isSupported: typeof window !== "undefined" && ("AudioContext" in window || "webkitAudioContext" in window)
  };
}
