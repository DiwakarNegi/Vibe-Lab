"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import SongCard from "@/components/SongCard";
import type { Song } from "@/app/page";

interface Props {
  externalSongs: Song[];
  onDelete: (id: number) => void;
  onReorder: (newOrder: Song[]) => void;
}

export default function SongCardGrid({ externalSongs, onDelete, onReorder }: Props) {
  const [layout, setLayout] = useState<"gallery" | "ranked">("gallery");
  const [isMuted, setIsMuted] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-8 py-16 min-h-screen">
      {/* VAULT HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-[var(--font-saint-regus)] tracking-tighter text-white uppercase italic leading-none">
            The Vault
          </h1>
          <p className="text-neutral-500 text-[10px] font-bold tracking-[0.5em] uppercase opacity-60">
            {externalSongs.length} {externalSongs.length === 1 ? "Card" : "Cards"} Collected
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
              isMuted
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-neutral-900/50 border-white/5 text-neutral-400 hover:text-white"
            }`}
          >
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase font-[var(--font-saint-regus)]">
              {isMuted ? "Muted" : "Audio On"}
            </span>
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9l-5 5H2v-4h2l5 5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
            )}
          </button>

          {/* Layout toggle */}
          <div className="flex bg-neutral-900/50 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
            {(["gallery", "ranked"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setLayout(mode)}
                className={`px-7 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 font-[var(--font-saint-regus)] ${
                  layout === mode ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white"
                }`}
              >
                {mode === "ranked" ? "⬆ Rank" : "Gallery"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {externalSongs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <p className="text-white/10 text-6xl font-[var(--font-saint-regus)] italic uppercase tracking-tighter">Empty</p>
          <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] font-[var(--font-saint-regus)]">Discover your first card</p>
        </div>
      )}

      {/* ── GALLERY MODE ── */}
      {layout === "gallery" && externalSongs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-28 justify-items-center">
          <AnimatePresence mode="popLayout">
            {externalSongs.map((song, index) => (
              <motion.div
                key={song.instanceId}
                layout
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="relative group"
              >
                <DeleteButton onClick={() => onDelete(song.instanceId!)} />
                <SongCard song={song} rarity={song.rarity} rank={index + 1} isMuted={isMuted} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── RANKED MODE — drag to reorder ── */}
      {layout === "ranked" && externalSongs.length > 0 && (
        <div className="flex flex-col items-center gap-6 pb-40">
          <p className="text-white/20 text-[9px] uppercase tracking-[0.4em] font-[var(--font-saint-regus)] mb-4">
            Drag cards to set your ranking
          </p>
          <Reorder.Group
            axis="y"
            values={externalSongs}
            onReorder={onReorder}
            className="flex flex-col gap-6 items-center w-full"
            as="div"
          >
            {externalSongs.map((song, index) => (
              <Reorder.Item
                key={song.instanceId}
                value={song}
                as="div"
                className="relative group cursor-grab active:cursor-grabbing"
                whileDrag={{ scale: 1.04, zIndex: 50, boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}
                transition={{ duration: 0.18 }}
              >
                {/* Rank number — large, left side */}
                <div className="absolute -left-16 top-1/2 -translate-y-1/2 text-right hidden lg:block">
                  <span className="text-5xl font-[var(--font-saint-regus)] italic uppercase leading-none"
                    style={{ color: index === 0 ? "rgba(250,204,21,0.5)" : index === 1 ? "rgba(168,85,247,0.4)" : index === 2 ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.1)" }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Drag handle hint */}
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex flex-col gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-4 h-[2px] rounded-full bg-white/20" />
                  ))}
                </div>

                <DeleteButton onClick={() => onDelete(song.instanceId!)} />
                <SongCard song={song} rarity={song.rarity} rank={index + 1} isMuted={isMuted} />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </section>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="absolute -top-3 -right-3 z-[110] bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-90"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}
