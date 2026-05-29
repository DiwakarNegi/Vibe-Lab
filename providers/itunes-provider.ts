import { MusicProvider } from "./music-provider";
import { Track } from "@/types/track";
import { AudioFeatures } from "@/types/audio";

/**
 * Temporary feature derivation.
 * This will be replaced by Spotify audio-features later.
 */
function deriveFeatures(item: any): AudioFeatures {
  const tempo = item.trackTimeMillis
    ? Math.min(200, Math.max(60, 60000 / (item.trackTimeMillis / 180)))
    : 120;

  return {
    energy: Math.min(1, tempo / 200),
    tempo,
    valence: 0.5,
    danceability: 0.5,
    acousticness: 0.5,
  };
}

export const itunesProvider: MusicProvider = {
  async searchTracks(query: string): Promise<Track[]> {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        query
      )}&entity=song&limit=12`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch from iTunes");
    }

    const data = await res.json();

    return data.results.map((item: any) => ({
      id: String(item.trackId),
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName,
      artworkUrl: item.artworkUrl100,
      previewUrl: item.previewUrl ?? null,
      features: deriveFeatures(item),
    }));
  },

  async getTrack() {
    throw new Error("getTrack not implemented yet");
  },
};
