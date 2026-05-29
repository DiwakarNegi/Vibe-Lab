"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleSpotifyCallback } from "@/lib/spotify-auth";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if (error) {
      console.error("Spotify auth error:", error);
      router.replace("/login?error=spotify_denied");
      return;
    }

    if (!code || !state) {
      router.replace("/login?error=missing_params");
      return;
    }

    handleSpotifyCallback(code, state)
      .then(() => router.replace("/"))
      .catch((err) => {
        console.error("Callback failed:", err);
        router.replace("/login?error=callback_failed");
      });
  }, [params, router]);

  return null;
}

export default function SpotifyCallbackPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent border-white/30 animate-spin mx-auto" />
        <p className="text-white/40 text-sm tracking-[0.3em] uppercase font-[var(--font-saint-regus)]">
          Connecting to Spotify…
        </p>
      </div>
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
