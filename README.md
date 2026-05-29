# Vibe Lab

A music card collecting experience powered by your Spotify listening history. Discover tracks from your top 50 songs, pull them as collectible cards with randomised rarity tiers, and build your personal Vibe Vault — one drop at a time.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Spotify](https://img.shields.io/badge/Spotify-1DB954?style=flat&logo=spotify&logoColor=white)

---

## What It Does

Vibe Lab turns your Spotify listening history into a card game. Sign in with Spotify, then pull random song cards from your top 50 tracks. Each card is assigned a rarity on the spot — drop luck determines whether you land a common track or a legendary one. Your collection is stored locally in your Vibe Vault, where you can reorder and manage your pulls.

The animated orb at the centre of the UI (VibeCore) pulses and rotates in sync with audio energy in real-time, giving the experience a tactile, reactive feel.

---

## Features

- **Spotify OAuth** — Secure sign-in via Spotify; no passwords stored
- **Card Discovery** — Each pull randomly selects from your top 50 tracks with weighted rarity
- **Rarity System** — Four tiers assigned on every pull:
  - `LEGENDARY` — 5% chance
  - `EPIC` — 20% chance
  - `RARE` — 50% chance
  - `COMMON` — remaining
- **Audio Previews** — Plays track previews; falls back to iTunes Search API since Spotify deprecated preview URLs
- **Vibe Vault** — Persistent collection saved to localStorage; reorder or delete cards freely
- **VibeCore Visualiser** — GSAP-animated orb that scales and rotates with real-time audio energy
- **Reveal Modal** — Cinematic card reveal before a track is added to your vault

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | GSAP |
| Auth | Spotify OAuth 2.0 |
| Music Data | Spotify Web API |
| Audio Fallback | iTunes Search API |
| Storage | localStorage |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Spotify Developer](https://developer.spotify.com/dashboard) account with an app created

### 1. Clone the repo

```bash
git clone https://github.com/DiwakarNegi/Vibe-Lab.git
cd Vibe-Lab
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

In your Spotify Developer Dashboard, add `http://localhost:3000/api/auth/spotify/callback` as a Redirect URI.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
├── app/
│   ├── api/auth/spotify/callback/   # Spotify OAuth callback
│   ├── login/                       # Login page
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Main vault + discovery page
├── components/
│   ├── SongCard.tsx                 # Individual collectible card
│   ├── SongCardGrid.tsx             # Vault grid layout
│   ├── RevealModal.tsx              # Card reveal animation
│   └── VibeCore.tsx                 # Audio-reactive animated orb
├── hooks/
│   └── useAudioAnalysis.ts          # Real-time audio energy hook
├── lib/                             # Spotify API helpers & utilities
├── providers/                       # Session & context providers
└── types/                           # TypeScript definitions
```

---

## How the Rarity System Works

On every "Discover New Card" pull, a random number determines rarity before the track is selected:

```
[0 – 0.05)   → LEGENDARY
[0.05 – 0.25) → EPIC
[0.25 – 0.75) → RARE
[0.75 – 1.0)  → COMMON
```

Each pulled card gets a unique instance ID (timestamp) so duplicates can coexist in your vault as separate entries.

---

## License

MIT

---

Built by [Diwakar Negi](https://github.com/DiwakarNegi)
