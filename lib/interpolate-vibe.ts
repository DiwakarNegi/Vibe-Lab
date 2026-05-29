import { AudioFeatures } from "@/types/audio";

export function interpolateVibe(
  from: AudioFeatures,
  to: AudioFeatures,
  steps: number
): AudioFeatures[] {
  const result: AudioFeatures[] = [];

  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 1);

    result.push({
      energy: from.energy + (to.energy - from.energy) * t,
      valence: from.valence + (to.valence - from.valence) * t,
      tempo: from.tempo + (to.tempo - from.tempo) * t,
      danceability:
        from.danceability + (to.danceability - from.danceability) * t,
      acousticness:
        from.acousticness + (to.acousticness - from.acousticness) * t,
    });
  }

  return result;
}
