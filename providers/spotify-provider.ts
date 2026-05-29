import { MusicProvider } from "./music-provider";
import { Track } from "@/types/track";
import { AudioFeatures } from "@/types/audio";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

async function getSpotifyToken(): Promise<string | null> {
  // In the browser, read from localStorage (set by the auth callback)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("spotify_access_token");
    const expiry = localStorage.getItem("spotify_token_expiry");
    if (token && expiry && Date.now() < Number(expiry)) {
      return token;
    }
    // Token expired — clear it so the page can re-auth
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_token_expiry");
  }
  return null;
}

async function spotifyFetch(endpoint: string): Promise<any> {
  const token = await getSpotifyToken();
  if (!token) throw new Error("SPOTIFY_UNAUTHENTICATED");

  const res = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) throw new Error("SPOTIFY_UNAUTHENTICATED");
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
  return res.json();
}

function mapSpotifyFeatures(feat: any): AudioFeatures {
  return {
    energy: feat.energy ?? 0.5,
    tempo: feat.tempo ?? 120,
    valence: feat.valence ?? 0.5,
    danceability: feat.danceability ?? 0.5,
    acousticness: feat.acousticness ?? 0.5,
  };
}

function mapSpotifyTrack(track: any, features?: any): Track {
  const image =
    track.album?.images?.[0]?.url ??
    track.images?.[0]?.url ??
    "";

  return {
    id: track.id,
    title: track.name,
    artist: track.artists?.map((a: any) => a.name).join(", ") ?? "Unknown",
    album: track.album?.name ?? "",
    artworkUrl: image,
    previewUrl: track.preview_url ?? null,
    features: features ? mapSpotifyFeatures(features) : {
      energy: 0.5,
      tempo: 120,
      valence: 0.5,
      danceability: 0.5,
      acousticness: 0.5,
    },
  };
}

export const spotifyProvider: MusicProvider = {
  async searchTracks(query: string): Promise<Track[]> {
    const data = await spotifyFetch(
      `/search?q=${encodeURIComponent(query)}&type=track&limit=12`
    );
    const tracks: Track[] = data.tracks.items.map((t: any) => mapSpotifyTrack(t));

    // Fetch audio features in one batch call
    const ids = tracks.map((t) => t.id).join(",");
    try {
      const featureData = await spotifyFetch(`/audio-features?ids=${ids}`);
      featureData.audio_features?.forEach((feat: any, i: number) => {
        if (feat && tracks[i]) {
          tracks[i].features = mapSpotifyFeatures(feat);
        }
      });
    } catch {
      // Non-fatal: fall back to default features
    }

    return tracks;
  },

  async getTrack(id: string): Promise<Track> {
    const [track, featData] = await Promise.allSettled([
      spotifyFetch(`/tracks/${id}`),
      spotifyFetch(`/audio-features/${id}`),
    ]);

    const trackVal = track.status === "fulfilled" ? track.value : null;
    const featVal = featData.status === "fulfilled" ? featData.value : null;

    if (!trackVal) throw new Error("Track not found");
    return mapSpotifyTrack(trackVal, featVal);
  },

  async getUserTopTracks(): Promise<Track[]> {
    const data = await spotifyFetch(
      `/me/top/tracks?limit=20&time_range=medium_term`
    );
    const tracks: Track[] = data.items.map((t: any) => mapSpotifyTrack(t));

    // Batch audio features
    const ids = tracks.map((t) => t.id).join(",");
    try {
      const featureData = await spotifyFetch(`/audio-features?ids=${ids}`);
      featureData.audio_features?.forEach((feat: any, i: number) => {
        if (feat && tracks[i]) {
          tracks[i].features = mapSpotifyFeatures(feat);
        }
      });
    } catch {
      // Non-fatal
    }

    return tracks;
  },
};
