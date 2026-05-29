"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import SongCard, { Rarity } from "./SongCard";

type Phase = "backing" | "shaking" | "flipping" | "revealed";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  song: any;
}

const COLORS: Record<string, string> = {
  legendary: "#facc15",
  epic:      "#a855f7",
  rare:      "#22d3ee",
  common:    "rgba(255,255,255,0.6)",
};
const GLOW: Record<string, string> = {
  legendary: "rgba(250,204,21,0.55)",
  epic:      "rgba(168,85,247,0.45)",
  rare:      "rgba(34,211,238,0.35)",
  common:    "rgba(255,255,255,0.1)",
};

function ParticleBurst({ rarity, count = 20 }: { rarity: string; count?: number }) {
  const color = COLORS[rarity] ?? COLORS.common;
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 360 + Math.random() * (360 / count);
      return {
        id: i,
        angle,
        dist: 130 + Math.random() * 90,
        size: 3 + Math.random() * 5,
        dur:  0.55 + Math.random() * 0.35,
        delay: Math.random() * 0.1,
      };
    })
  , [count]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: -1 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ background: color, width: p.size, height: p.size }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.dist,
            y: Math.sin((p.angle * Math.PI) / 180) * p.dist,
            opacity: 0,
            scale: 0.1,
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: [0.2, 0, 0.8, 1] }}
        />
      ))}
    </div>
  );
}

export default function RevealModal({ isOpen, onClose, song }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [phase, setPhase] = useState<Phase>("backing");
  const [showParticles, setShowParticles] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPhase("backing");
      setShowParticles(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const isLegendary = song?.rarity === "legendary";
    const isEpic      = song?.rarity === "epic";

    // Dramatic timing for higher rarities
    const shakeDelay   = 700;
    const flipDelay    = isLegendary ? 1500 : isEpic ? 1300 : 900;
    const revealDelay  = flipDelay + (isLegendary ? 850 : 700);

    const t1 = setTimeout(() => setPhase(isLegendary || isEpic ? "shaking" : "flipping"), shakeDelay);
    const t2 = setTimeout(() => setPhase("flipping"), flipDelay);
    const t3 = setTimeout(() => {
      setPhase("revealed");
      setShowParticles(true);
      if (song?.previewUrl) audioRef.current?.play().catch(() => {});
      setTimeout(() => setShowParticles(false), 1200);
    }, revealDelay);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isOpen, song]);

  const handleExport = async () => {
    const el = document.getElementById("reveal-card-target");
    if (!el) return;
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 150));
    const url = await toPng(el, { quality: 1, pixelRatio: 2, backgroundColor: "#050505" });
    const a = document.createElement("a");
    a.download = `VIBE-LAB-${song.title.replace(/\s+/g, "-")}.png`;
    a.href = url;
    a.click();
    setIsExporting(false);
  };

  const handleShare = () => {
    const t = `Just pulled a ${song.rarity.toUpperCase()} card: "${song.title}" by ${song.artist} in VIBE-LAB ⚡ #VibeLab`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}`, "_blank");
  };

  if (!song) return null;

  const glow       = GLOW[song.rarity]  ?? GLOW.common;
  const color      = COLORS[song.rarity] ?? COLORS.common;
  const isLegendary = song.rarity === "legendary";
  const flipping   = phase === "flipping" || phase === "revealed";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <audio ref={audioRef} src={song.previewUrl || undefined} preload="auto" />

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/96 backdrop-blur-2xl"
          />

          {/* Legendary flash at flip moment */}
          <AnimatePresence>
            {isLegendary && phase === "flipping" && (
              <motion.div
                key="flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 80% 50% at center, ${glow}, transparent)` }}
              />
            )}
          </AnimatePresence>

          <div className="relative z-10 flex flex-col items-center">

            {/* Header label */}
            <motion.p
              animate={{ opacity: phase === "revealed" ? 1 : 0, y: phase === "revealed" ? 0 : -10 }}
              transition={{ duration: 0.4 }}
              className="font-[var(--font-saint-regus)] text-xs uppercase tracking-[0.5em] italic mb-6"
              style={{ color: color }}
            >
              New Discovery
            </motion.p>

            {/* Card flip rig — spring entry */}
            <motion.div
              initial={{ y: 90, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
              className={`relative ${phase === "shaking" ? "animate-card-shake" : ""}`}
            >
              {/* Particle burst — centered on card */}
              <AnimatePresence>
                {showParticles && (
                  <ParticleBurst
                    key="burst"
                    rarity={song.rarity}
                    count={isLegendary ? 28 : 18}
                  />
                )}
              </AnimatePresence>

              {/* 3D flip container */}
              <div style={{ perspective: 1100, width: 280, height: 420 }}>
                <div style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  transformStyle: "preserve-3d",
                  transform: flipping ? "rotateY(180deg)" : "rotateY(0deg)",
                  transition: phase === "flipping"
                    ? `transform ${isLegendary ? "0.85s" : "0.72s"} cubic-bezier(0.4, 0, 0.2, 1)`
                    : "none",
                }}>

                  {/* ── BACK face ── */}
                  <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `1px solid ${color}44`,
                    boxShadow: `0 0 55px ${glow}`,
                    background: "#080808",
                  }}>
                    {/* Grid texture */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                      backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
                      backgroundSize: "18px 18px",
                    }} />

                    {/* Center mark */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <motion.div
                          animate={{ boxShadow: [`0 0 20px ${glow}`, `0 0 55px ${glow}`, `0 0 20px ${glow}`] }}
                          transition={{ duration: 1.6, repeat: Infinity }}
                          className="w-16 h-16 mx-auto rounded-full border flex items-center justify-center"
                          style={{ borderColor: `${color}44`, background: "rgba(255,255,255,0.03)" }}
                        >
                          <span className="text-xl font-[var(--font-saint-regus)] italic uppercase" style={{ color: "rgba(255,255,255,0.18)" }}>VL</span>
                        </motion.div>
                        <p className="text-[8px] font-[var(--font-saint-regus)] tracking-[0.55em] uppercase" style={{ color: "rgba(255,255,255,0.12)" }}>VIBE-LAB</p>
                      </div>
                    </div>

                    {/* Ambient glow pulse */}
                    <motion.div
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at center, ${glow} 0%, transparent 65%)` }}
                    />

                    {/* Rarity label at bottom */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                      <span className="text-[7px] font-bold tracking-[0.4em] uppercase font-[var(--font-saint-regus)]" style={{ color: `${color}60` }}>
                        {song.rarity}
                      </span>
                    </div>
                  </div>

                  {/* ── FRONT face ── */}
                  <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}>
                    <SongCard song={song} rarity={song.rarity as Rarity} isMuted cardId="reveal-card-target" />
                  </div>
                </div>
              </div>

              {/* Bloom glow under revealed card */}
              <AnimatePresence>
                {phase === "revealed" && (
                  <motion.div
                    key="bloom"
                    initial={{ opacity: 0, scaleX: 0.5 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute -z-10 pointer-events-none"
                    style={{
                      inset: 0,
                      background: `radial-gradient(ellipse at center, ${glow} 0%, transparent 65%)`,
                      filter: "blur(30px)",
                      transform: "translateY(28px)",
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Actions — slide in after reveal */}
            <motion.div
              animate={{ opacity: phase === "revealed" ? 1 : 0, y: phase === "revealed" ? 0 : 20 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-8"
              style={{ width: 280 }}
            >
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="py-3 rounded-xl text-white font-[var(--font-saint-regus)] text-[10px] tracking-[0.2em] uppercase italic transition-all hover:bg-white/10 disabled:opacity-40"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
                >
                  {isExporting ? "Saving…" : "Export PNG"}
                </button>
                <button
                  onClick={handleShare}
                  className="py-3 rounded-xl font-[var(--font-saint-regus)] text-[10px] tracking-[0.2em] uppercase italic transition-all hover:bg-cyan-500/20"
                  style={{ border: "1px solid rgba(34,211,238,0.2)", background: "rgba(34,211,238,0.08)", color: "#67e8f9" }}
                >
                  Share
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-full py-4 rounded-full bg-white text-black font-[var(--font-saint-regus)] text-sm tracking-[0.2em] uppercase font-bold hover:bg-yellow-400 active:scale-[0.97] transition-all shadow-2xl"
              >
                Add to Vault
              </button>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
