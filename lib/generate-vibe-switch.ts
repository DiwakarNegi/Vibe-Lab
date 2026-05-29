import { Track } from "@/types/track";
import { interpolateVibe } from "./interpolate-vibe";
import { findClosestTrack } from "./find-closest-track";

export function generateVibeSwitch(
  from: Track,
  to: Track,
  library: Track[],
  steps = 5
): Track[] {
  const targets = interpolateVibe(from.features, to.features, steps);

  return targets.map((target) =>
    findClosestTrack(target, library)
  );
}
