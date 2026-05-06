import React, { useState } from 'react';
import { Play, Heart, MoreVertical, ListMusic, Plus } from 'lucide-react';
import clsx from 'clsx';
import { usePlayerStore } from '../store/playerStore';

const formatTime = (s) => {
  if (!s || isNaN(s)) return '--:--';
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
};

export const SongRow = ({ song, index, onPlay }) => {
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
          <p className="text-xs text-white/35 truncate">{song.artist}</p>
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
              className="absolute bottom-full right-0 mb-2 w-48 bg-[#0a0a0c]/95 backdrop-blur-2xl rounded-xl py-2 shadow-2xl border border-white/10 z-[70] animate-in fade-in slide-in-from-bottom-1"
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
