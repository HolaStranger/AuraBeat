# 🎵 Product Requirements Document
## RetroTape — Music Player Web App
**Version:** 1.1 (Updated after Review)
**Date:** March 2026
**Status:** 🟢 Approved — Ready to Vibe Code

---

## 1. Overview

**RetroTape** is a web-based music player with a **retro cassette/tape deck aesthetic** — but playing the **latest & trending songs**. Think: old-school Walkman look, new-school hits. Multi-language support (Tamil-first, plus Hindi, English, and more) powered by the **self-hosted unofficial JioSaavn API** on Vercel.

No login required. Playlists and liked songs saved via **localStorage** (simple, zero backend needed — perfect for vibe coding). Mobile-ready later via **Capacitor**.

---

## 2. Problem Statement

| Problem | How RetroTape Solves It |
|---|---|
| Spotify/Apple Music paywalls Tamil music | Free streaming via JioSaavn API |
| All music apps look the same | Retro cassette UI — unforgettable personality |
| Complex setup blocks solo devs | localStorage-first, no backend, self-host API on Vercel |
| Finding latest Tamil/regional songs is scattered | JioSaavn charts + multi-language search in one place |

---

## 3. Target Users

| User | Description |
|---|---|
| Tamil music lovers | Primary — wants latest Tamil film & trending songs |
| Multi-language listeners | Tamil + Hindi + English in one app |
| Nostalgia + modern mashup fans | Loves retro look but wants new music |
| Solo dev / portfolio showcase | Clean, impressive project to show off |

---

## 4. Tech Stack (Finalised)

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite | Fast dev, component-friendly |
| Styling | Tailwind CSS | Easy retro theming with utility classes |
| State Management | Zustand | Lightweight player + queue state |
| Music API | JioSaavn Unofficial API (self-host on Vercel) | Free, no key, Tamil + multi-lang |
| Audio Engine | Howler.js | Reliable cross-browser MP3 playback |
| Storage | localStorage | Zero backend, vibe-code friendly |
| Mobile (later) | Capacitor | Wrap web app → iOS/Android, no rewrite |

### 🚀 API Setup (One-Time)
1. Fork `github.com/sumitkolhe/jiosaavn-api`
2. Deploy to your Vercel (free tier) — 1-click deploy
3. Set your Vercel URL as `VITE_API_BASE_URL` in `.env`
4. Done — all endpoints live on your own domain, no CORS issues

### Key API Endpoints Used

| Feature | Endpoint |
|---|---|
| Search | `GET /api/search/all?query=&language=tamil,hindi,english` |
| Song details + stream URL | `GET /api/songs/{id}` |
| Trending / Charts | `GET /api/playlists?id={jiosaavn-chart-id}` |
| Album | `GET /api/albums?id=` |
| Artist | `GET /api/artists/{id}/songs` |
| Lyrics | `GET /api/songs/{id}/lyrics` |
| New Releases | `GET /api/search/songs?query=new+releases+2025&sort=latest` |

---

## 5. Core Features — V1 Scope

### 5.1 🎵 Music Playback (P0 — Must Have)
- [ ] Play / Pause / Stop
- [ ] Next / Previous track
- [ ] Seek bar with scrubbing
- [ ] Volume control + mute
- [ ] Shuffle mode
- [ ] Repeat: Off / Repeat All / Repeat One
- [ ] Progress timer (current / total)
- [ ] Persistent bottom player bar (always visible across all pages)
- [ ] Expandable full-screen Now Playing view

### 5.2 🔍 Search & Browse (P0 — Must Have)
- [ ] Universal search (songs, artists, albums)
- [ ] Language filter chip: **Tamil** | Hindi | English | All
- [ ] Tamil-first default — search defaults to Tamil unless changed
- [ ] Search results tabbed: Songs / Albums / Artists
- [ ] Debounced live search (no button press needed)

### 5.3 🏠 Home / Discover (P0 — Must Have)
- [ ] **Latest & Trending** section — Tamil charts, Hindi charts, Global Top 50
- [ ] **New Releases** — freshest songs this week
- [ ] **Featured Artists** row (Tamil-forward: Anirudh, AR Rahman, Sid Sriram, etc.)
- [ ] Quick-play cards with album art

### 5.4 💿 Album & Artist Pages (P1 — Should Have)
- [ ] Album page: cover art, release year, full tracklist
- [ ] Artist page: top songs, discography, similar artists
- [ ] Breadcrumb navigation

### 5.5 📋 Queue Management (P1 — Should Have)
- [ ] Add to queue / Play next
- [ ] View current queue (side drawer)
- [ ] Reorder queue (drag & drop)
- [ ] Clear queue

### 5.6 🗂️ Playlist Management (P1 — Should Have)
- [ ] Create playlist (saved to localStorage)
- [ ] Add / remove songs
- [ ] Rename / delete playlist
- [ ] "Liked Songs" auto-playlist (heart button on any song)
- [ ] Play playlist in order or shuffled

### 5.7 🎤 Lyrics (P2 — Nice to Have)
- [ ] Display lyrics in full-screen Now Playing view
- [ ] Fetched from JioSaavn `/lyrics` endpoint
- [ ] Tamil + English lyrics both shown if available

### 5.8 🌐 Language Switcher (P1 — Should Have)
- [ ] Global language preference (Tamil / Hindi / English / All)
- [ ] Persisted in localStorage
- [ ] Affects home feed, trending, and default search results

---

## 6. UI/UX Design Direction

### Aesthetic: **Retro Cassette Deck — but playing 2025 bangers**

> The contrast IS the identity. Old hardware, new music. Like playing Anirudh on a 1980s tape deck.

| Element | Design Decision |
|---|---|
| **Color palette** | Dark warm brown background (#1a0f00), amber (#f5a623), cream (#f5e6c8), burnt orange accent |
| **Typography** | `Special Elite` (typewriter, headers) + `Courier Prime` (body/lyrics) + `Bebas Neue` (song titles) |
| **Main player** | Styled as a physical cassette tape deck — two spinning reels, VU meter, tape window showing album art |
| **Reel animation** | CSS spinning animation on the two tape reels — spins when playing, stops when paused |
| **Album art** | Shown inside the cassette tape window cutout (center of the tape) |
| **Seek bar** | Styled as a tape progress ribbon (not a generic pill slider) |
| **Buttons** | Big chunky retro buttons — Play/Pause as a physical press button with shadow/depth |
| **Cards** | Song cards look like old cassette tape labels — sticker-style with worn edges |
| **Textures** | Subtle grain/noise overlay on backgrounds for analog feel |
| **Trending badges** | "🔥 Latest Drop" / "📼 Now Trending" sticker-style labels on new songs |

### Screen Map

```
┌─────────────────────────────────────────────┐
│  Sidebar Nav        │  Main Content Area     │
│  ─────────────      │  ─────────────────     │
│  🏠 Home            │  [Active Screen]       │
│  🔍 Search          │                        │
│  💿 Library         │                        │
│  ❤️  Liked Songs    │                        │
│  📋 Playlists       │                        │
│                     │                        │
├─────────────────────────────────────────────┤
│        🎛️  Persistent Bottom Player Bar      │
│  [◀◀]  [▶ PLAY]  [▶▶]  ══════●══  🔊  🔀  │
└─────────────────────────────────────────────┘

Screens:
1. Home / Discover     → Tamil trending, new releases, featured
2. Search              → Live search, language filter, tabbed results
3. Album Page          → Tape-label style tracklist
4. Artist Page         → Discography grid
5. Library / Playlists → User's saved playlists
6. Now Playing (full)  → Cassette deck UI, lyrics overlay
7. Queue Drawer        → Right slide-in panel
```

---

## 7. Data & Storage (No Backend)

All user data lives in **localStorage** — zero backend needed for V1.

| Key | Data |
|---|---|
| `retrotape_liked` | Array of liked song IDs + metadata |
| `retrotape_playlists` | Array of playlist objects {id, name, songs[]} |
| `retrotape_queue` | Current play queue |
| `retrotape_recents` | Recently played songs (last 20) |
| `retrotape_language` | User's language preference |
| `retrotape_volume` | Last volume setting |

> 🔮 **Future:** If user wants cloud sync later, migrate localStorage to Supabase with minimal code change (Zustand store swap).

---

## 8. Mobile Strategy

| Phase | Plan |
|---|---|
| V1 | Web app — mobile responsive (works great on phone browser) |
| V2 | Wrap with **Capacitor** → publish to Play Store / App Store |
| Why Capacitor | No rewrite — same React codebase, just add native shell |
| What changes for mobile | Bottom nav instead of sidebar, swipe gestures on player |

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Page load < 3s; audio starts < 1.5s after tap |
| Responsive | Mobile-first; 375px → 1440px |
| Audio quality | 320kbps MP3 where JioSaavn provides it |
| Offline | Out of scope for V1 |
| Auth | No login in V1 |
| Browser support | Chrome, Firefox, Safari (last 2 versions) |

---

## 10. Out of Scope — V1

- ❌ User login / cloud accounts
- ❌ Social features (follow, share activity)
- ❌ Offline download / caching
- ❌ Podcasts
- ❌ Music videos
- ❌ Backend / database
- ❌ Native mobile app (Capacitor = V2)

---

## 11. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| JioSaavn blocks API | Medium | Self-host = your own Vercel URL, harder to block |
| Stream URLs expire (they do, ~30min TTL) | High | Always fetch fresh URL from API on each play — never cache stream URL |
| CORS issues in browser | Low | Self-hosting with CORS enabled solves this |
| JioSaavn removes Tamil catalogue | Very Low | Largest Tamil library in India — unlikely |
| localStorage limit (5MB) | Low | Store only metadata (IDs + names), not audio data |

---

## 12. Vibe Code Sprint Plan 🚀

| Sprint | What to Build | Est. Time |
|---|---|---|
| **Sprint 1** | Vite + React setup, Tailwind config, Vercel API deploy, basic song fetch + play | **Day 1** |
| **Sprint 2** | Home screen — Tamil trending + new releases cards | **Day 2** |
| **Sprint 3** | Search page — live search, language filter, tabbed results | **Day 2** |
| **Sprint 4** | Retro cassette bottom player bar — reels, seek, controls | **Day 3** |
| **Sprint 5** | Full-screen Now Playing view + lyrics | **Day 4** |
| **Sprint 6** | Album & Artist pages | **Day 4** |
| **Sprint 7** | Queue drawer + Liked Songs + Playlists (localStorage) | **Day 5** |
| **Sprint 8** | Polish — animations, grain texture, retro tape label cards | **Day 6** |
| **Sprint 9** | Bug fixes + responsive mobile polish | **Day 7** |
| **Total** | | **~1 week** |

---

## 13. Suggested Folder Structure

```
retrotape/
├── public/
│   └── fonts/          # Special Elite, Bebas Neue
├── src/
│   ├── api/
│   │   └── jiosaavn.js     # All API call functions
│   ├── components/
│   │   ├── Player/
│   │   │   ├── CassettePlayer.jsx   # Bottom bar
│   │   │   ├── NowPlaying.jsx       # Full-screen view
│   │   │   └── Reels.jsx            # Spinning reel animation
│   │   ├── SongCard.jsx             # Tape-label style card
│   │   ├── QueueDrawer.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Search.jsx
│   │   ├── Album.jsx
│   │   ├── Artist.jsx
│   │   └── Library.jsx
│   ├── store/
│   │   └── playerStore.js       # Zustand — player, queue, liked, playlists
│   ├── hooks/
│   │   └── usePlayer.js
│   └── App.jsx
├── .env                 # VITE_API_BASE_URL=https://your-api.vercel.app
└── vite.config.js
```

---

*PRD v1.1 — Finalised ✅ | Ready to vibe code 🎛️📼*
