/**
 * Spotify PKCE Auth Flow
 * ---------------------
 * Uses the Authorization Code with PKCE flow — no client secret needed in the browser.
 * Required env var: NEXT_PUBLIC_SPOTIFY_CLIENT_ID
 * Redirect URI: must be registered in your Spotify Dashboard as
 *   http://localhost:3000/api/auth/spotify/callback  (dev)
 *   https://yourdomain.com/api/auth/spotify/callback (prod)
 */

const SCOPES = [
  "user-top-read",
  "user-read-private",
  "user-read-email",
  "user-library-read",
  "streaming",
].join(" ");

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function generateCodeVerifier(length = 128): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function initiateSpotifyLogin(): Promise<void> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  if (!clientId) throw new Error("NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not set");

  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = crypto.randomUUID();

  sessionStorage.setItem("spotify_code_verifier", verifier);
  sessionStorage.setItem("spotify_auth_state", state);

  const redirectUri = `${window.location.origin}/api/auth/spotify/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
    scope: SCOPES,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleSpotifyCallback(
  code: string,
  state: string
): Promise<void> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  if (!clientId) throw new Error("NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not set");

  const verifier = sessionStorage.getItem("spotify_code_verifier");
  const savedState = sessionStorage.getItem("spotify_auth_state");

  if (!verifier) throw new Error("Missing code verifier");
  if (state !== savedState) throw new Error("State mismatch — possible CSRF");

  const redirectUri = `${window.location.origin}/api/auth/spotify/callback`;
  
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description ?? `Token exchange failed: ${res.status}`);
  }

  const data = await res.json();

  localStorage.setItem("spotify_access_token", data.access_token);
  localStorage.setItem(
    "spotify_token_expiry",
    String(Date.now() + data.expires_in * 1000)
  );
  if (data.refresh_token) {
    localStorage.setItem("spotify_refresh_token", data.refresh_token);
  }

  // Clean up PKCE session values
  sessionStorage.removeItem("spotify_code_verifier");
  sessionStorage.removeItem("spotify_auth_state");
}

export function getSpotifySession(): {
  token: string | null;
  isAuthenticated: boolean;
} {
  if (typeof window === "undefined") return { token: null, isAuthenticated: false };

  const token = localStorage.getItem("spotify_access_token");
  const expiry = Number(localStorage.getItem("spotify_token_expiry") ?? 0);
  const isAuthenticated = Boolean(token && Date.now() < expiry);

  return { token: isAuthenticated ? token : null, isAuthenticated };
}

export function clearSpotifySession(): void {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_token_expiry");
  localStorage.removeItem("spotify_refresh_token");
}

export async function getItunesPreview(title: string, artist: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=5`);
    const data = await res.json();
    const match = (data.results ?? []).find((r: any) => r.previewUrl);
    return match?.previewUrl ?? null;
  } catch {
    return null;
  }
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string; width: number }[] };
  preview_url: string | null;
  popularity: number;
}

export async function getSpotifyTopTracks(limit = 50): Promise<SpotifyTrack[]> {
  const { token } = getSpotifySession();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=medium_term`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);

  const data = await res.json();
  return data.items as SpotifyTrack[];
}

export async function getSpotifyProfile(): Promise<{
  displayName: string;
  email: string;
  imageUrl: string | null;
  id: string;
} | null> {
  const { token } = getSpotifySession();
  if (!token) return null;

  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  const data = await res.json();
  return {
    id: data.id,
    displayName: data.display_name ?? data.id,
    email: data.email ?? "",
    imageUrl: data.images?.[0]?.url ?? null,
  };
}
