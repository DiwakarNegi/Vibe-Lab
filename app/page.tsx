"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SongCardGrid from "@/components/SongCardGrid";
import RevealModal from "@/components/RevealModal";
import {
  getSpotifySession,
  clearSpotifySession,
  getSpotifyTopTracks,
  getItunesPreview,
  SpotifyTrack,
} from "@/lib/spotify-auth";

export interface Song {
  title: string;
  artist: string;
  album: string;
  coverSrc: string;
  previewUrl: string;
  energy: number;
  mood: number;
  popularity: number;
  rarity: any;
  instanceId?: number;
}

export default function Home() {
  const router = useRouter();
  const [isRevealing, setIsRevealing] = useState(false);
  const [collection, setCollection] = useState<Song[]>([]);
  const [currentDiscovery, setCurrentDiscovery] = useState<Song | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [discovering, setDiscovering] = useState(false);

  useEffect(() => {
    const { isAuthenticated } = getSpotifySession();
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const saved = localStorage.getItem("vibe-vault");
    if (saved) {
      try {
        setCollection(JSON.parse(saved));
      } catch {
        // corrupt data — start fresh
      }
    }

    getSpotifyTopTracks(50)
      .then(setTopTracks)
      .catch(() => router.replace("/login"));
  }, [router]);

  const handleDelete = (idToDelete: number) => {
    setCollection((prev) => {
      const updated = prev.filter((s) => s.instanceId !== idToDelete);
      localStorage.setItem("vibe-vault", JSON.stringify(updated));
      return updated;
    });
  };

  const handleReorder = (newOrder: Song[]) => {
    setCollection(newOrder);
    localStorage.setItem("vibe-vault", JSON.stringify(newOrder));
  };

  const handleDiscover = async () => {
    if (topTracks.length === 0 || discovering) return;
    setDiscovering(true);
    try {
      const track = topTracks[Math.floor(Math.random() * topTracks.length)];

      const roll = Math.random() * 100;
      let rarity: any = "common";
      if (roll < 5) rarity = "legendary";
      else if (roll < 20) rarity = "epic";
      else if (roll < 50) rarity = "rare";

      // Spotify deprecated preview_url for new apps — fall back to iTunes
      const previewUrl =
        track.preview_url ||
        (await getItunesPreview(track.name, track.artists[0]?.name ?? "")) ||
        "";

      setCurrentDiscovery({
        title: track.name,
        artist: track.artists[0]?.name ?? "Unknown",
        album: track.album.name,
        coverSrc: track.album.images[0]?.url ?? "",
        previewUrl,
        energy: Number(Math.random().toFixed(2)),
        mood: Number(Math.random().toFixed(2)),
        popularity: track.popularity,
        rarity,
      });
      setIsRevealing(true);
    } finally {
      setDiscovering(false);
    }
  };

  const handleSaveToVault = () => {
    if (!currentDiscovery) return;
    const songWithId = { ...currentDiscovery, instanceId: Date.now() };
    setCollection((prev) => {
      const updated = [songWithId, ...prev];
      localStorage.setItem("vibe-vault", JSON.stringify(updated));
      return updated;
    });
    setIsRevealing(false);
    setCurrentDiscovery(null);
  };

  const handleLogout = () => {
    clearSpotifySession();
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white/10 overflow-x-hidden">
      <div className="fixed top-8 right-8 z-[100] flex items-center gap-3">
        <button
          onClick={handleLogout}
          className="px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 font-[var(--font-saint-regus)] text-xs tracking-[0.2em] hover:bg-white/10 hover:text-white/70 transition-all uppercase"
        >
          Disconnect
        </button>
        <button
          onClick={handleDiscover}
          disabled={discovering || topTracks.length === 0}
          className="px-8 py-3 rounded-full bg-white text-black font-[var(--font-saint-regus)] text-sm tracking-[0.2em] hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-2xl uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {discovering ? "Discovering…" : topTracks.length === 0 ? "Loading…" : "Discover New Card"}
        </button>
      </div>

      <div className="relative z-10">
        <SongCardGrid
          externalSongs={collection}
          onDelete={handleDelete}
          onReorder={handleReorder}
        />
      </div>

      {currentDiscovery && (
        <RevealModal
          isOpen={isRevealing}
          onClose={handleSaveToVault}
          song={currentDiscovery}
        />
      )}

      <div className="fixed inset-0 z-0 pointer-events-none select-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full" />
      </div>
    </main>
  );
}
