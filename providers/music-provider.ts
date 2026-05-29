import { Track } from "@/types/track";

export interface MusicProvider {
  searchTracks(query: string): Promise<Track[]>;
  getTrack(id: string): Promise<Track>;
  getUserTopTracks?(): Promise<Track[]>; // Spotify later
}
