"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionTemplate, useTransform, AnimatePresence } from "framer-motion";
import { initiateSpotifyLogin } from "@/lib/spotify-auth";

// Floating ghost cards in the background
const GHOST_CARDS = [
  { rarity: "legendary", rot: -12, x: -38, y: 10, delay: 0 },
  { rarity: "epic",      rot: 6,   x: 32,  y: -5,  delay: 0.4 },
  { rarity: "rare",      rot: -5,  x: -22, y: 40,  delay: 0.8 },
  { rarity: "common",    rot: 14,  x: 45,  y: 30,  delay: 1.2 },
];

const RARITY_STYLES: Record<string, string> = {
  legendary: "border-yellow-400/40 shadow-[0_0_60px_rgba(250,204,21,0.2)]",
  epic:      "border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.2)]",
  rare:      "border-cyan-400/40  shadow-[0_0_30px_rgba(34,211,238,0.2)]",
  common:    "border-white/10",
};

function GhostCard({ rarity, rot, x, y, delay }: typeof GHOST_CARDS[0]) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: rot - 4 }}
      animate={{ opacity: 1, scale: 1, rotate: rot }}
      transition={{ duration: 1.6, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ left: `${x + 50}%`, top: `${y + 50}%`, translateX: "-50%", translateY: "-50%" }}
      className="absolute pointer-events-none"
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
        className={`w-[170px] h-[268px] rounded-2xl border bg-[#0d0d0d]/80 backdrop-blur-sm ${RARITY_STYLES[rarity]}`}
      >
        {/* Shimmer */}
        {rarity === "legendary" && (
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-yellow-300/10 to-transparent skew-x-12 rounded-2xl overflow-hidden"
          />
        )}
        {rarity === "epic" && (
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: delay + 1 }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent skew-x-12 rounded-2xl overflow-hidden"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0d0d0d] to-transparent rounded-b-2xl" />
        {/* Fake stat bars */}
        <div className="absolute bottom-8 left-5 right-5 space-y-2 opacity-40">
          {[0.7, 0.4, 0.85].map((w, i) => (
            <div key={i} className="h-[2px] bg-neutral-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${w * 100}%` }}
                className={`h-full rounded-full ${
                  rarity === "legendary" ? "bg-yellow-400" :
                  rarity === "epic" ? "bg-purple-400" :
                  rarity === "rare" ? "bg-cyan-400" : "bg-white/40"
                }`}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Animated vinyl record icon
function VinylIcon() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="relative w-16 h-16 mx-auto"
    >
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <circle cx="32" cy="32" r="30" fill="#1a1a1a" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
        <circle cx="32" cy="32" r="14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
        <circle cx="32" cy="32" r="6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="32" cy="32" r="3" fill="rgba(255,255,255,0.15)" />
        {/* Highlight arc */}
        <path d="M 14 32 A 18 18 0 0 1 32 14" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

// Spotify logo SVG
function SpotifyLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

// Particle field
function Particles() {
  const [particles, setParticles] = useState<{ id: number; cx: number; cy: number; r: number; delay: number; dur: number }[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 30 }, (_, i) => ({
      id: i,
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 8,
      dur: 4 + Math.random() * 6,
    })));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{ left: `${p.cx}%`, top: `${p.cy}%`, width: p.r * 2, height: p.r * 2 }}
          className="absolute rounded-full bg-white/20"
          animate={{ opacity: [0, 0.6, 0], y: [0, -30, -60] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-100, 100], [8, -8]);
  const rotY = useTransform(mx, [-100, 100], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - (rect.left + rect.width / 2));
    my.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await initiateSpotifyLogin();
    } catch (err: any) {
      setError(err.message ?? "Login failed");
      setLoading(false);
    }
  };

  // Check for error params from callback
  useEffect(() => {
    const url = new URL(window.location.href);
    const err = url.searchParams.get("error");
    if (err === "spotify_denied") setError("Spotify access was denied. Try again.");
    else if (err === "callback_failed") setError("Authentication failed. Please try again.");
    else if (err === "missing_params") setError("Invalid callback. Please try again.");
  }, []);

  return (
    <main className="relative min-h-screen bg-[#050505] overflow-hidden flex items-center justify-center">

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-purple-900/15 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-cyan-900/15 blur-[150px] rounded-full" />
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.svg')] pointer-events-none" />

      {/* Particles */}
      <Particles />

      {/* Ghost cards — background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {GHOST_CARDS.map((card) => (
          <GhostCard key={card.rarity} {...card} />
        ))}
      </div>

      {/* Main login card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: "1200px" }}
        className="relative z-20 w-full max-w-sm mx-4"
      >
        <motion.div
          ref={cardRef}
          style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
          className="relative bg-[#0a0a0a] border border-white/[0.07] rounded-3xl p-8 overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
        >
          {/* Inner glare */}
          <motion.div
            style={{
              background: useMotionTemplate`radial-gradient(circle at ${useTransform(mx, [-150, 150], [0, 100])}% ${useTransform(my, [-150, 150], [0, 100])}%, rgba(255,255,255,0.04) 0%, transparent 70%)`,
            }}
            className="absolute inset-0 rounded-3xl pointer-events-none z-0"
          />

          {/* Top edge glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative z-10 space-y-8" style={{ transform: "translateZ(20px)" }}>
            {/* Logo / identity */}
            <div className="text-center space-y-5">
              <VinylIcon />

              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-4xl font-[var(--font-saint-regus)] uppercase tracking-[0.15em] text-white leading-none italic"
                >
                  Vibe Lab
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="text-[10px] text-white/30 uppercase tracking-[0.6em] mt-2 font-[var(--font-saint-regus)]"
                >
                  Collectible Music Cards
                </motion.p>
              </div>
            </div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.7 }}
              className="text-center space-y-3"
            >
              <p className="text-white/60 text-[13px] leading-relaxed font-[var(--font-saint-regus)] tracking-wide">
                Connect your Spotify to mint cards from your actual listening history — with real energy, valence & tempo data.
              </p>
              <div className="flex items-center justify-center gap-4 pt-1">
                {["Your Top Tracks", "Real Audio Data", "Holographic Cards"].map((feat, i) => (
                  <motion.div
                    key={feat}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 + i * 0.1 }}
                    className="flex items-center gap-1"
                  >
                    <div className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span className="text-[8px] text-white/30 uppercase tracking-[0.25em] font-[var(--font-saint-regus)]">
                      {feat}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.7 }}
            >
              <button
                onClick={handleLogin}
                disabled={loading}
                className="group relative w-full py-4 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] active:scale-[0.98] transition-all duration-200 overflow-hidden shadow-[0_0_40px_rgba(29,185,84,0.25)] hover:shadow-[0_0_60px_rgba(29,185,84,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {/* Button shimmer */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
                <div className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  ) : (
                    <SpotifyLogo className="w-5 h-5 text-black" />
                  )}
                  <span className="text-black font-[var(--font-saint-regus)] text-sm tracking-[0.25em] uppercase font-bold">
                    {loading ? "Connecting…" : "Connect with Spotify"}
                  </span>
                </div>
              </button>
            </motion.div>

            {/* Error state */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-center text-[11px] text-red-400/80 font-[var(--font-saint-regus)] tracking-wide"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Fine print */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-center text-[9px] text-white/15 font-[var(--font-saint-regus)] tracking-[0.3em] uppercase"
            >
              We only read your music — never post or modify
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="text-[9px] text-white/15 uppercase tracking-[0.5em] font-[var(--font-saint-regus)]">
          Intelligence × Aesthetics × Collect
        </p>
      </motion.div>
    </main>
  );
}