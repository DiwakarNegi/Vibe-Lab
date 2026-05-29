import { Track } from "@/types/track";
import { AudioFeatures } from "@/types/audio";
import { vibeDistance } from "./vibe-distance";

export function findClosestTrack(
  target: AudioFeatures,
  tracks: Track[]
): Track {
  let best = tracks[0];
  let bestDistance = Infinity;

  for (const track of tracks) {
    const d = Math.sqrt(
      Math.pow(track.features.energy - target.energy, 2) +
      Math.pow(track.features.valence - target.valence, 2) +
      Math.pow((track.features.tempo - target.tempo) / 200, 2) +
      Math.pow(track.features.danceability - target.danceability, 2) +
      Math.pow(track.features.acousticness - target.acousticness, 2)
    );

    if (d < bestDistance) {
      bestDistance = d;
      best = track;
    }
  }

  return best;
}
