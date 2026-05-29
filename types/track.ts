import { AudioFeatures } from "./audio";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artworkUrl: string;
  previewUrl: string | null;
  features: AudioFeatures;
}
