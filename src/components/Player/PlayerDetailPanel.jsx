import { X, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Repeat1, Heart, MoreVertical, ListMusic, Plus } from 'lucide-react';
import React, { useState } from 'react';
import clsx from 'clsx';
import { usePlayerStore } from '../../store/playerStore';
import { usePlayerContext } from '../../context/PlayerContext';
import { formatTime } from '../../utils/formatTime';
import { Visualizer } from './Visualizer';

export const PlayerDetailPanel = () => {
  const {
    currentSong, isPlaying, volume, setVolume,
    repeatMode, toggleRepeat, shuffleMode, toggleShuffle,
    playbackSpeed, setPlaybackSpeed, togglePlayerOpen,
    likedSongs, toggleLike, playlists, addToPlaylist, createPlaylist
  } = usePlayerStore();

  const [showMenu, setShowMenu] = useState(false);

  const { progress, duration, seek, togglePlayPause, playNext, playPrevious, analyser } = usePlayerContext();
  const song = currentSong();

  if (!song) return null;

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * duration);
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="h-full bg-black flex flex-col relative z-50 overflow-hidden select-none border-l border-white/5">
      {/* Visualizer Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <Visualizer analyser={analyser} isPlaying={isPlaying} />
      </div>

      <div className="flex-1 flex flex-col relative z-10 p-6 custom-scrollbar overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">AuraBeat Detail</span>
          <button 
            onClick={togglePlayerOpen}
            className="p-2 -mr-2 text-white/20 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Big Album Art */}
        <div className="mb-8">
          <div className="relative aspect-square w-full">
            <img
              src={song.image}
              alt={song.title}
              className={clsx(
                'w-full h-full rounded-2xl object-cover shadow-2xl transition-all duration-700',
                isPlaying ? 'scale-[1.02] shadow-neon-rock' : 'grayscale-[20%]'
              )}
            />
            {/* Ambient Glow */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-20 scale-110 bg-neon-rock/30 rounded-full animate-pulse-rock" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-8 group/info">
          <div className="flex-1 min-w-0 text-left">
            <h2 className="text-3xl font-black text-white mb-2 leading-tight tracking-tight truncate">{song.title}</h2>
            <p className="text-neon-rock/70 font-bold uppercase text-xs tracking-[0.2em]">{song.artist}</p>
          </div>

          {/* Collection Actions */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => toggleLike(song)}
              className={clsx(
                "p-3 rounded-2xl glass transition-all duration-300",
                likedSongs.some(s => s.id === song.id) ? "text-neon-pink shadow-neon-pink/20" : "text-white/20 hover:text-white hover:bg-white/10"
              )}
            >
              <Heart size={20} fill={likedSongs.some(s => s.id === song.id) ? "currentColor" : "none"} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={clsx(
                  "p-3 rounded-2xl glass transition-all duration-300",
                  showMenu ? "text-white bg-white/10" : "text-white/20 hover:text-white"
                )}
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <div 
                  className="absolute bottom-full right-0 mb-4 w-56 glass rounded-2xl py-2 shadow-2xl z-[70] animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <p className="px-5 py-2 text-[10px] font-bold text-white/25 uppercase tracking-widest border-b border-white/5 mb-1">Add to Playlist</p>
                  <button
                    onClick={() => {
                      const name = prompt("Enter playlist name:");
                      if (name) {
                        const nextId = Date.now().toString();
                        createPlaylist(name);
                        setTimeout(() => addToPlaylist(nextId, song), 100);
                      }
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-5 py-3 text-xs text-neon-purple hover:text-white hover:bg-neon-purple/20 transition-colors flex items-center gap-3 font-semibold"
                  >
                    <Plus size={14} />
                    <span>Create New Playlist</span>
                  </button>

                  <div className="h-px bg-white/5 my-1" />

                  {playlists.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto no-scrollbar">
                      {playlists.map(pl => (
                        <button
                          key={pl.id}
                          onClick={() => { addToPlaylist(pl.id, song); setShowMenu(false); }}
                          className="w-full text-left px-5 py-3 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-3"
                        >
                          <ListMusic size={14} />
                          <span className="truncate">{pl.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-5 py-4 text-[10px] text-white/20 italic text-center">No playlists yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Controls */}
        <div className="mt-auto space-y-8">
          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-mono text-white/30 tracking-widest">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              className="w-full h-[6px] bg-white/5 rounded-full cursor-pointer relative group hover:h-2 transition-all duration-300"
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-rock shadow-[0_0_15px_rgba(249,115,22,0.6)] relative"
                style={{ width: `${pct}%` }}
              >
                {/* Permanent glowing thumb */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_#fff] border-[3px] border-black scale-100 group-hover:scale-125 transition-transform" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={toggleShuffle} className={clsx(shuffleMode ? 'text-neon-rock' : 'text-white/20')}>
              <Shuffle size={18} />
            </button>
            <div className="flex items-center gap-6">
              <button onClick={playPrevious} className="text-white/40 hover:text-white"><SkipBack size={24} fill="currentColor" /></button>
              <button onClick={togglePlayPause} className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
              </button>
              <button onClick={playNext} className="text-white/40 hover:text-white"><SkipForward size={24} fill="currentColor" /></button>
            </div>
            <button onClick={toggleRepeat} className={clsx(repeatMode !== 'off' ? 'text-neon-rock' : 'text-white/20')}>
              {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          {/* Precision Speed */}
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold text-white/20 uppercase tracking-widest">
              <span>Playback Speed</span>
              <span className="text-neon-rock">{playbackSpeed.toFixed(2)}x</span>
            </div>
            <input
              type="range" min="0.5" max="2.5" step="0.05" value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="w-full h-1 accent-neon-rock cursor-pointer bg-white/5 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
