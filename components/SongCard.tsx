"use client";

import { useRef } from "react";
import type { Song } from "@/app/page";

export type Rarity = "common" | "rare" | "epic" | "legendary";

interface Props {
  song: Song;
  rarity: Rarity;
  rank?: number;
  isMuted?: boolean;
  cardId?: string;
}

const RARITY = {
  legendary: {
    tilt: 24,
    border: "rgba(250,204,21,0.7)",
    shadow: "0 0 0 1px rgba(250,204,21,0.15), 0 0 55px rgba(250,204,21,0.45), 0 0 110px rgba(250,204,21,0.12)",
    label: "LEGENDARY",
    labelColor: "#fde68a",
    labelBorder: "rgba(250,204,21,0.35)",
    labelBg: "rgba(250,204,21,0.1)",
    statBar: "#facc15",
    titleColor: "#fefce8",
    valueColor: "#fde68a",
    pillBg: "rgba(250,204,21,0.15)",
    pillColor: "#fde68a",
    holo: true,
  },
  epic: {
    tilt: 18,
    border: "rgba(168,85,247,0.65)",
    shadow: "0 0 0 1px rgba(168,85,247,0.1), 0 0 45px rgba(168,85,247,0.38)",
    label: "EPIC",
    labelColor: "#d8b4fe",
    labelBorder: "rgba(168,85,247,0.35)",
    labelBg: "rgba(168,85,247,0.1)",
    statBar: "#c084fc",
    titleColor: "#fff",
    valueColor: "#d8b4fe",
    pillBg: "rgba(168,85,247,0.15)",
    pillColor: "#d8b4fe",
    holo: false,
  },
  rare: {
    tilt: 15,
    border: "rgba(34,211,238,0.55)",
    shadow: "0 0 0 1px rgba(34,211,238,0.08), 0 0 32px rgba(34,211,238,0.3)",
    label: "RARE",
    labelColor: "#a5f3fc",
    labelBorder: "rgba(34,211,238,0.35)",
    labelBg: "rgba(34,211,238,0.08)",
    statBar: "#22d3ee",
    titleColor: "#fff",
    valueColor: "#a5f3fc",
    pillBg: "rgba(34,211,238,0.12)",
    pillColor: "#a5f3fc",
    holo: false,
  },
  common: {
    tilt: 11,
    border: "rgba(255,255,255,0.12)",
    shadow: "0 8px 40px rgba(0,0,0,0.6)",
    label: "COMMON",
    labelColor: "rgba(255,255,255,0.3)",
    labelBorder: "rgba(255,255,255,0.1)",
    labelBg: "rgba(255,255,255,0.05)",
    statBar: "rgba(255,255,255,0.55)",
    titleColor: "#fff",
    valueColor: "rgba(255,255,255,0.65)",
    pillBg: "rgba(255,255,255,0.07)",
    pillColor: "rgba(255,255,255,0.5)",
    holo: false,
  },
} as const;

const VIBE = (energy: number, mood: number) => {
  if (energy > 0.7 && mood > 0.7) return { label: "Electric Bliss", icon: "⚡" };
  if (energy > 0.7 && mood < 0.4) return { label: "Aggressive Dark", icon: "🖤" };
  if (energy < 0.4 && mood > 0.7) return { label: "Dreamy Chill", icon: "🌊" };
  if (energy < 0.4 && mood < 0.4) return { label: "Deep Noir", icon: "🌑" };
  return { label: "Balanced Flow", icon: "✦" };
};

export default function SongCard({ song, rarity, rank, isMuted = false, cardId }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const cfg = RARITY[rarity];
  const vibe = VIBE(song.energy, song.mood);

  const setTransition = (fast: boolean) => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = fast
      ? "transform 0.06s ease-out"
      : "transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(0.5 - y) * cfg.tilt * 2}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * cfg.tilt * 2}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--hue", `${Math.round(x * 360)}deg`);
    el.style.setProperty("--holo-o", "0.28");
    setTransition(true);
  };

  const handleMouseLeave = () => {
    const el = wrapperRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--holo-o", cfg.holo ? "0.06" : "0");
    setTransition(false);
    if (audioRef.current) audioRef.current.pause();
  };

  const handleMouseEnter = () => {
    if (!isMuted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div
      id={cardId}
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="relative select-none cursor-crosshair"
      style={{
        width: 280,
        height: 420,
        perspective: "900px",
        "--rx": "0deg",
        "--ry": "0deg",
        "--mx": "50%",
        "--my": "50%",
        "--hue": "0deg",
        "--holo-o": cfg.holo ? "0.06" : "0",
      } as React.CSSProperties}
    >
      <audio ref={audioRef} src={song.previewUrl || undefined} preload="auto" />

      {/*
        KEY FIX: `overflow:hidden` on the same element as `transformStyle:preserve-3d`
        kills the 3D context — browser spec forces it flat.
        Solution: preserve-3d on the card body (no overflow), clip art inside a child div.
      */}
      <div
        ref={cardRef}
        className="relative w-full h-full rounded-2xl"
        style={{
          transform: "rotateX(var(--rx)) rotateY(var(--ry))",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)",
          border: `1px solid ${cfg.border}`,
          boxShadow: cfg.shadow,
          background: "#080808",
        }}
      >
        {/* ── CLIP LAYER — art + gradients, stays at Z=0 ── */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ transform: "translateZ(0px)" }}>
          {song.coverSrc && (
            <img src={song.coverSrc} alt="" draggable={false} className="w-full h-full object-cover" />
          )}
          {/* bottom-weighted gradient */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, #000 0%, rgba(0,0,0,0.88) 32%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.05) 100%)"
          }} />
          {/* mouse glare */}
          <div className="absolute inset-0" style={{
            background: "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.13) 0%, transparent 60%)"
          }} />
          {/* shimmer sweeps */}
          {rarity === "legendary" && (
            <div className="absolute inset-y-0 w-[55%] legendary-shimmer"
              style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,215,0,0.11) 50%, transparent 65%)" }} />
          )}
          {rarity === "epic" && (
            <div className="absolute inset-y-0 w-[55%] epic-shimmer"
              style={{ background: "linear-gradient(105deg, transparent 35%, rgba(168,85,247,0.13) 50%, transparent 65%)" }} />
          )}
        </div>

        {/* ── HOLO FOIL — floats just above art ── */}
        {cfg.holo && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
            transform: "translateZ(6px)",
            background: "conic-gradient(from var(--hue) at var(--mx) var(--my), hsl(0,90%,65%), hsl(60,90%,65%), hsl(120,90%,65%), hsl(180,90%,65%), hsl(240,90%,65%), hsl(300,90%,65%), hsl(360,90%,65%))",
            mixBlendMode: "color-dodge",
            opacity: "var(--holo-o)",
            transition: "opacity 0.25s",
          }} />
        )}

        {/* ── RARITY BADGE — floats high ── */}
        <div className="absolute top-4 left-4 flex items-center gap-2" style={{ transform: "translateZ(38px)" }}>
          <span
            className="text-[8px] font-bold tracking-[0.25em] uppercase font-[var(--font-saint-regus)] px-2.5 py-1 rounded-full"
            style={{ color: cfg.labelColor, border: `1px solid ${cfg.labelBorder}`, background: cfg.labelBg }}
          >
            {cfg.label}
          </span>
        </div>

        {/* ── RANK BADGE — top right ── */}
        {rank !== undefined && (
          <div className="absolute top-4 right-4" style={{ transform: "translateZ(38px)" }}>
            <span className="text-[9px] font-bold font-[var(--font-saint-regus)] text-white/25 tracking-widest">
              #{String(rank).padStart(2, "0")}
            </span>
          </div>
        )}

        {/* ── BOTTOM CONTENT — floats above surface ── */}
        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ transform: "translateZ(30px)" }}>

          {/* Vibe type pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
            style={{ background: cfg.pillBg, border: `1px solid ${cfg.labelBorder}` }}>
            <span className="text-[10px]">{vibe.icon}</span>
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase font-[var(--font-saint-regus)]" style={{ color: cfg.pillColor }}>
              {vibe.label}
            </span>
          </div>

          {/* Album */}
          <p className="text-[8px] uppercase tracking-[0.3em] mb-0.5 truncate font-[var(--font-saint-regus)]"
            style={{ color: "rgba(255,255,255,0.25)" }}>
            {song.album}
          </p>

          {/* Title */}
          <h2 className="text-[1.15rem] font-[var(--font-saint-regus)] tracking-tight leading-none mb-0.5 italic uppercase line-clamp-2"
            style={{ color: cfg.titleColor }}>
            {song.title}
          </h2>

          {/* Artist */}
          <p className="text-[9px] uppercase tracking-[0.35em] mb-3 truncate font-[var(--font-saint-regus)]"
            style={{ color: "rgba(255,255,255,0.38)" }}>
            {song.artist}
          </p>

          {/* Stats — frosted glass panel */}
          <div className="rounded-xl p-3 space-y-2"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <StatBar label="Energy" value={song.energy}                              barColor={cfg.statBar} valueColor={cfg.valueColor} />
            <StatBar label="Mood"   value={song.mood ?? (song as any).valence}      barColor={cfg.statBar} valueColor={cfg.valueColor} />
            <StatBar label="Hype"   value={((song.popularity ?? (song as any).tempo * 100) || 50) / 100} barColor={cfg.statBar} valueColor={cfg.valueColor} isReal={!!song.popularity} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBar({
  label, value, barColor, valueColor, isReal,
}: { label: string; value: number | undefined; barColor: string; valueColor: string; isReal?: boolean }) {
  const safe = isNaN(value as number) || value == null ? 0 : value;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-[var(--font-saint-regus)]">{label}</span>
          {isReal && (
            <span className="text-[6px] px-1 py-0.5 rounded font-bold tracking-widest uppercase"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }}>
              LIVE
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold font-[var(--font-saint-regus)]" style={{ color: valueColor }}>
          {Math.round(safe * 100)}
        </span>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="h-full rounded-full" style={{ width: `${safe * 100}%`, background: barColor, transition: "width 0.8s ease-out" }} />
      </div>
    </div>
  );
}
