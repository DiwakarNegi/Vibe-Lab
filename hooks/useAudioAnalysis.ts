"use client";

import { useEffect, useState } from "react";
import { getAudioController } from "@/lib/audio-controller";

export interface AudioMetrics {
  bass: number;
  mid: number;
  treble: number;
  energy: number;
}

export function useAudioAnalysis() {
  const [metrics, setMetrics] = useState<AudioMetrics>({
    bass: 0,
    mid: 0,
    treble: 0,
    energy: 0,
  });

  useEffect(() => {
    const { analyser } = getAudioController();
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let rafId: number;

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);

      const bass = average(dataArray, 0, bufferLength * 0.15);
      const mid = average(
        dataArray,
        bufferLength * 0.15,
        bufferLength * 0.6
      );
      const treble = average(
        dataArray,
        bufferLength * 0.6,
        bufferLength
      );

      const normalizedBass = bass / 255;
      const normalizedMid = mid / 255;
      const normalizedTreble = treble / 255;

      setMetrics({
        bass: normalizedBass,
        mid: normalizedMid,
        treble: normalizedTreble,
        energy:
          normalizedBass * 0.5 +
          normalizedMid * 0.3 +
          normalizedTreble * 0.2,
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return metrics;
}

function average(
  array: Uint8Array,
  start: number,
  end: number
): number {
  let sum = 0;
  let count = 0;

  for (let i = Math.floor(start); i < Math.floor(end); i++) {
    sum += array[i];
    count++;
  }

  return count === 0 ? 0 : sum / count;
}
