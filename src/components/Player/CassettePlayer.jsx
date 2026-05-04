import {
  Play, Pause, SkipForward, SkipBack,
  Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Volume1,
  Maximize2, Heart, MoreVertical, ListMusic, Plus
} from 'lucide-react';
import React, { useState } from 'react';
import clsx from 'clsx';
import { usePlayerStore } from '../../store/playerStore';
import { usePlayerContext } from '../../context/PlayerContext';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { formatTime } from '../../utils/formatTime';

export const CassettePlayer = () => {
  const {
    currentSong, isPlaying, volume, setVolume,
    repeatMode, toggleRepeat, shuffleMode, toggleShuffle,
    playbackSpeed, setPlaybackSpeed, queue, togglePlayerOpen,
    likedSongs, toggleLike, playlists, addToPlaylist, createPlaylist
  } = usePlayerStore();

  const [showMenu, setShowMenu] = useState(false);
  const { progress, duration, seek, togglePlayPause, playNext, playPrevious } = usePlayerContext();
  
  // Register keyboard controls
  useKeyboardControls(togglePlayPause, playNext, playPrevious);

  const song = currentSong();

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * duration);
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  if (!song && queue.length === 0) return null;

  return (
    <div className="h-[80px] md:h-[88px] bg-[#010103] border-t border-white/[0.02] flex flex-col relative z-50 overflow-hidden select-none">
      {/* Enhanced Progress ribbon */}
      <div
        className="w-full h-[4px] md:h-[6px] cursor-pointer group relative z-10 bg-white/5 hover:h-2 transition-all duration-300"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-gradient-to-r from-neon-purple to-neon-rock shadow-[0_0_15px_rgba(249,115,22,0.6)] relative"
          style={{ width: `${pct}%` }}
        >
          {/* Permanent glowing thumb */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-[0_0_10px_#fff] border-[2px] md:border-[3px] border-black scale-100 group-hover:scale-125 transition-transform" />
        </div>
      </div>

      <div className="flex-1 flex items-center px-4 md:px-6 gap-3 md:gap-6 relative z-10">
        {/* Left: Info */}
        <div 
          className="flex items-center gap-3 md:gap-4 flex-1 md:w-1/4 min-w-0 cursor-pointer group"
          onClick={togglePlayerOpen}
        >
          <div className="relative flex-shrink-0">
            <img
              src={song?.image || 'https://placehold.co/48x48/1a0a2e/8b5cf6?text=♪'}
              alt={song?.title}
              className={clsx('w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-2xl transition-all duration-300', isPlaying && 'scale-105')}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <Maximize2 size={16} className="text-white" />
            </div>
          </div>
          <div className="min-w-0 flex items-center gap-2 md:gap-3">
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-bold text-white truncate group-hover:text-neon-rock transition-colors">{song?.title}</p>
              <p className="text-[10px] md:text-xs text-white/40 truncate mt-0.5 uppercase tracking-wider">{song?.artist}</p>
            </div>

            {/* Collection Actions - Hidden on mobile */}
            <div className="hidden sm:flex items-center ml-2 border-l border-white/5 pl-3 gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                className={clsx(
                  "p-2 rounded-full transition-all",
                  likedSongs.some(s => s.id === song?.id) ? "text-neon-pink" : "text-white/20 hover:text-white/60 hover:bg-white/5"
                )}
              >
                <Heart size={16} fill={likedSongs.some(s => s.id === song?.id) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={toggleShuffle} className={clsx('hidden md:block transition-colors', shuffleMode ? 'text-neon-rock' : 'text-white/20 hover:text-white/40')}>
              <Shuffle size={16} />
            </button>
            <button onClick={playPrevious} className="text-white/60 hover:text-white transition-colors">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 md:w-11 md:h-11 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
            </button>
            <button onClick={playNext} className="text-white/60 hover:text-white transition-colors">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button onClick={toggleRepeat} className={clsx('hidden md:block transition-colors', repeatMode !== 'off' ? 'text-neon-rock' : 'text-white/20 hover:text-white/40')}>
              {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>
          <div className="hidden md:block text-[10px] font-mono text-white/20 tracking-tighter">
            {formatTime(progress)} / {formatTime(duration)}
          </div>
        </div>

        {/* Right: Utils (Desktop Only) */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="text-white/30 hover:text-white/70 transition-colors">
              <VolumeIcon size={16} />
            </button>
            <input
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="w-18 h-1 accent-neon-rock cursor-pointer bg-white/5 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
