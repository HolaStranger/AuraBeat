import React, { useState } from 'react';
import { Play, Heart, MoreVertical, ListMusic, Plus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { usePlayerStore } from '../store/playerStore';

export const SongCard = ({ song, onClick, isTrending = false, isNew = false }) => {
  const navigate = useNavigate();
  const { likedSongs, toggleLike, playlists, addToPlaylist } = usePlayerStore();
  const [showMenu, setShowMenu] = useState(false);
  const isLiked = likedSongs.some(s => s.id === song?.id);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(song);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (song) toggleLike(song);
  };

  return (
    <div
      onClick={handlePlayClick}
      className="group relative glass rounded-2xl p-2.5 cursor-pointer transition-all duration-500 hover:bg-white/[0.05] hover:shadow-neon-rock/20 border border-transparent hover:border-white/10 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Badge */}
      {(isTrending || isNew) && (
        <div className="absolute top-2 left-2 z-10">
          {isTrending ? (
            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              🔥 Hot
            </span>
          ) : (
            <span className="text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              ✦ New
            </span>
          )}
        </div>
      )}

      {/* Album Art */}
      <div className="relative aspect-square mb-3 rounded-xl overflow-hidden">
        <img
          src={song?.image || 'https://placehold.co/400x400/1a0a2e/8b5cf6?text=♪'}
          alt={song?.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-end justify-end p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handlePlayClick}
            className="w-11 h-11 gradient-btn rounded-full flex items-center justify-center shadow-neon-rock"
          >
            <Play size={16} fill="white" className="text-white ml-0.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm text-white truncate flex-1">{song?.title || 'Unknown Track'}</h3>
          <button
            onClick={handleLikeClick}
            className={clsx(
              'flex-shrink-0 transition-all duration-200',
              isLiked ? 'text-neon-pink' : 'text-white/20 hover:text-white/60'
            )}
          >
            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
          </button>
        </div>
        {song?.artistId ? (
          <Link 
            to={`/artist/${song.artistId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-white/40 truncate mt-0.5 hover:text-neon-purple hover:underline inline-block transition-colors max-w-full"
          >
            {song?.artist || 'Unknown Artist'}
          </Link>
        ) : (
          <p className="text-xs text-white/40 truncate mt-0.5">{song?.artist || 'Unknown Artist'}</p>
        )}
      </div>

      {/* Actions - Top Right More Menu */}
      <div className="absolute top-4 right-4 z-20 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className={clsx(
              "p-1.5 rounded-full backdrop-blur-md transition-all shadow-lg",
              showMenu ? "text-white bg-white/20" : "text-white/50 bg-black/40 hover:text-white hover:bg-black/60"
            )}
          >
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <div 
              className="absolute bottom-full right-0 mb-2 w-48 bg-[#0a0a0c]/95 backdrop-blur-2xl rounded-xl py-2 shadow-2xl border border-white/10 z-[70] animate-in fade-in slide-in-from-bottom-1"
              onMouseLeave={() => setShowMenu(false)}
            >
              <p className="px-4 py-1 text-[10px] font-bold text-white/25 uppercase tracking-widest border-b border-white/5 mb-1">Add to Playlist</p>
              
              {/* Create New Playlist option */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const name = prompt("Enter playlist name:");
                  if (name) {
                    const { playlists: pld } = usePlayerStore.getState();
                    const nextId = Date.now().toString();
                    usePlayerStore.getState().createPlaylist(name);
                    // Add song to newly created playlist
                    setTimeout(() => usePlayerStore.getState().addToPlaylist(nextId, song), 100);
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
      </div>
    </div>
  );
};
