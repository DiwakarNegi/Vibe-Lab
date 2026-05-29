import { Track } from "@/types/track";

export function vibeDistance(a: Track, b: Track): number {
  const fa = a.features;
  const fb = b.features;

  return Math.sqrt(
    Math.pow(fa.energy - fb.energy, 2) +
    Math.pow(fa.valence - fb.valence, 2) +
    Math.pow((fa.tempo - fb.tempo) / 200, 2) +
    Math.pow(fa.danceability - fb.danceability, 2) +
    Math.pow(fa.acousticness - fb.acousticness, 2)
  );
}
