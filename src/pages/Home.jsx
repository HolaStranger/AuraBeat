import React, { useEffect, useState } from 'react';
import { Play, Heart, MoreVertical, ListMusic, Plus, Disc } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { saavnApi } from '../api/jiosaavn';
import { SongCard } from '../components/SongCard';
import { Grid } from '../components/Grid';
import { SongCardSkeleton } from '../components/skeletons/SongCardSkeleton';
import { GridItemSkeleton } from '../components/skeletons/GridItemSkeleton';
import { usePlayerStore } from '../store/playerStore';
import { PageTransition } from '../components/PageTransition';

const LANGUAGES = ['tamil', 'hindi', 'english', 'telugu', 'all'];

const formatTime = (s) => {
  if (!s || isNaN(s)) return '--:--';
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
};

const SongRow = ({ song, index, onPlay }) => {
  const { likedSongs, toggleLike, playlists, addToPlaylist, createPlaylist } = usePlayerStore();
  const [showMenu, setShowMenu] = useState(false);
  const isLiked = likedSongs.some(s => s.id === song?.id);

  return (
    <div
      onClick={onPlay}
      className="group grid items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
      style={{ gridTemplateColumns: '28px 1fr auto' }}
    >
      <span className="text-sm text-white/25 text-center group-hover:hidden">{index + 1}</span>
      <button onClick={(e) => { e.stopPropagation(); onPlay(); }} className="hidden group-hover:flex justify-center">
        <Play size={14} fill="white" className="text-white" />
      </button>

      <div className="flex items-center gap-3 min-w-0">
        <img src={song.image} alt={song.title} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white truncate">{song.title}</p>
            <button
              onClick={e => { e.stopPropagation(); toggleLike(song); }}
              className={clsx(
                "transition-all duration-200",
                isLiked ? "text-neon-pink" : "text-white/10 hover:text-white/40"
              )}
            >
              <Heart size={12} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2} />
            </button>
          </div>
          {song.artistId ? (
            <Link
              to={`/artist/${song.artistId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-white/35 truncate hover:text-neon-purple hover:underline transition-colors block"
            >
              {song.artist}
            </Link>
          ) : (
            <p className="text-xs text-white/35 truncate">{song.artist}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-white/30 text-sm">
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className={clsx(
              "p-1.5 rounded-full transition-all",
              showMenu ? "text-white bg-white/10" : "text-white/30 hover:text-white hover:bg-white/5"
            )}
          >
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <div
              className="absolute bottom-full right-0 mb-2 w-48 glass rounded-xl py-2 shadow-neon-purple z-[70] animate-in fade-in slide-in-from-bottom-1"
              onMouseLeave={() => setShowMenu(false)}
            >
              <p className="px-4 py-1 text-[10px] font-bold text-white/25 uppercase tracking-widest border-b border-white/5 mb-1">Add to Playlist</p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const name = prompt("Enter playlist name:");
                  if (name) {
                    const nextId = Date.now().toString();
                    createPlaylist(name);
                    setTimeout(() => addToPlaylist(nextId, song), 100);
                  }
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-neon-purple hover:text-white hover:bg-neon-purple/20 transition-colors flex items-center gap-2 font-semibold"
              >
                <Plus size={12} />
                <span>Create New Playlist</span>
              </button>

              <div className="h-px bg-white/5 my-1" />

              {playlists.length > 0 ? (
                <div className="max-h-32 overflow-y-auto no-scrollbar">
                  {playlists.map(pl => (
                    <button
                      key={pl.id}
                      onClick={(e) => { e.stopPropagation(); addToPlaylist(pl.id, song); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-2"
                    >
                      <ListMusic size={12} />
                      <span className="truncate">{pl.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-2 text-[10px] text-white/20 italic text-center">No playlists yet</p>
              )}
            </div>
          )}
        </div>

        <span className="font-mono text-xs text-white/20">{formatTime(song.duration)}</span>
      </div>
    </div>
  );
};

export const Home = () => {
  const { language, setQueue } = usePlayerStore();
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      saavnApi.getTrending(language),
      saavnApi.getNewReleases(language),
      saavnApi.searchPlaylists('top hits', language),
    ])
      .then(([t, n, p]) => {
        setTrending(t.slice(0, 10));
        setNewReleases(n.slice(0, 10));
        setPlaylists(p.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, [language]);

  const play = (songs, i) => {
    setQueue(songs);
    usePlayerStore.getState().setCurrentIndex(i);
    usePlayerStore.getState().setIsPlaying(true);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <PageTransition>
    <div className="min-h-full pb-32">
      {/* Hero header */}
      <div className="px-5 md:px-8 pt-8 md:pt-12 pb-6 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em] mb-3">{greeting}</p>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-1">
              Discover<span className="text-neon-rock">.</span>
            </h1>
            <p className="text-white/20 text-xs tracking-[0.2em] uppercase font-bold mt-2">
              Personalized for your <span className="text-neon-rock">Aura</span>
            </p>
          </div>

          {/* Interaction Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => usePlayerStore.getState().setLanguage(lang)}
                className={clsx(
                  "px-5 py-2 rounded-full text-xs font-bold capitalize transition-all duration-300",
                  language === lang
                    ? "gradient-btn text-white shadow-lg shadow-neon-rock/20 scale-105"
                    : "glass text-white/30 hover:text-white/80 hover:bg-white/10"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 space-y-10">
        {loading ? (
          <>
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-6 bg-gray-700 rounded-full animate-pulse" />
                <div className="h-6 w-40 rounded bg-gray-700 animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
                {[...Array(6)].map((_, i) => (
                  <SongCardSkeleton key={i} />
                ))}
              </div>
            </section>
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-6 bg-gray-700 rounded-full animate-pulse" />
                <div className="h-6 w-40 rounded bg-gray-700 animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
                {[...Array(6)].map((_, i) => (
                  <GridItemSkeleton key={i} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Fresh Drops – Song Cards */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-6 bg-neon-rock rounded-full" />
                <h2 className="text-base font-black text-white uppercase tracking-[0.25em]">Fresh Drops</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
                {newReleases.slice(0, 6).map((song, i) => (
                  <SongCard key={song.id} song={song} isNew onClick={() => play(newReleases, i)} />
                ))}
              </div>
            </section>

            {playlists.length > 0 && <Grid title="Top Playlists" items={playlists} type="view/playlist" />}

            {/* Top Charts – Vertical List */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-6 bg-neon-rock rounded-full" />
                <h2 className="text-base font-black text-white uppercase tracking-[0.25em]">Top Charts</h2>
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/[0.03] bg-white/[0.01]">
                <div
                  className="grid px-4 py-2 border-b border-white/[0.04] text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ gridTemplateColumns: '28px 1fr auto' }}
                >
                  <span className="text-center">#</span>
                  <span>Title</span>
                  <span className="pr-2">Time</span>
                </div>
                {newReleases.slice(0, 10).map((song, i) => (
                  <SongRow key={song.id} song={song} index={i} onPlay={() => play(newReleases, i)} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
    </PageTransition>
  );
};
