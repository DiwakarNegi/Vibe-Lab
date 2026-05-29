"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAudioAnalysis } from "@/hooks/useAudioAnalysis";

export default function VibeCore() {
  const coreRef = useRef<HTMLDivElement | null>(null);
  const { energy } = useAudioAnalysis();
  const energyRef = useRef(0);

  energyRef.current = energy;

  useEffect(() => {
    if (!coreRef.current) return;

    const el = coreRef.current;

    // GSAP ticker = animation loop
    const update = () => {
      const e = energyRef.current;

      gsap.to(el, {
        scale: 1 + e * 0.6,
        rotate: e * 20,
        duration: 0.2,
        ease: "power3.out",
      });
    };

    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <div className="flex justify-center items-center py-12">
      <div
        ref={coreRef}
        className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"
      />
    </div>
  );
}
