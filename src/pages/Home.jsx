import React, { useEffect, useState } from 'react';
import { Play, Heart, MoreVertical, ListMusic, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saavnApi } from '../api/jiosaavn';
import { SongCard } from '../components/SongCard';
import { usePlayerStore } from '../store/playerStore';

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
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{song.title}</p>
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
        <button
          onClick={e => { e.stopPropagation(); toggleLike(song); }}
          className={`transition-opacity ${isLiked ? 'text-neon-pink opacity-100' : 'text-white/30 hover:text-white/60'}`}
        >
          <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
        </button>

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([saavnApi.getTrending(language), saavnApi.getNewReleases(language)])
      .then(([t, n]) => { setTrending(t.slice(0, 10)); setNewReleases(n.slice(0, 10)); })
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
    <div className="min-h-full pb-24">
      {/* Hero header */}
      <div className="px-8 pt-12 pb-8">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em] mb-3">{greeting}</p>
        <h1 className="text-5xl font-black text-white mb-2 tracking-tighter leading-none">
          Discover<span className="text-neon-rock">.</span>
        </h1>
        <p className="text-white/20 text-xs tracking-wider mt-1">
          Handpicked for you in <span className="text-neon-rock/60 font-bold uppercase">{language}</span>
        </p>
      </div>

      <div className="px-8 space-y-10">
        {loading ? (
          <div className="flex items-center justify-center py-32 gap-4">
            <div className="w-2 h-2 rounded-full bg-neon-rock animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-neon-rock animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-2 h-2 rounded-full bg-neon-rock animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        ) : (
          <>
            {/* Fresh Drops – Song Cards */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-6 bg-neon-rock rounded-full" />
                <h2 className="text-base font-black text-white uppercase tracking-[0.25em]">Fresh Drops</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {newReleases.slice(0, 5).map((song, i) => (
                  <SongCard key={song.id} song={song} isNew onClick={() => play(newReleases, i)} />
                ))}
              </div>
            </section>

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
  );
};
