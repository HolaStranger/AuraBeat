import { X, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Repeat1, Heart, MoreVertical, ListMusic, Plus, Search, Mic2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { usePlayerStore } from '../../store/playerStore';
import { usePlayerContext } from '../../context/PlayerContext';
import { formatTime } from '../../utils/formatTime';
import { Visualizer } from './Visualizer';
import { saavnApi } from '../../api/jiosaavn';
import { Clock } from 'lucide-react';

export const PlayerDetailPanel = () => {
  const {
    currentSong, isPlaying, volume, setVolume,
    repeatMode, toggleRepeat, shuffleMode, toggleShuffle,
    playbackSpeed, setPlaybackSpeed, togglePlayerOpen,
    likedSongs, toggleLike, playlists, addToPlaylist, createPlaylist,
    queue, currentIndex, setCurrentIndex
  } = usePlayerStore();

  const [showMenu, setShowMenu] = useState(false);

  const { progress, duration, seek, togglePlayPause, playNext, playPrevious, analyser } = usePlayerContext();
  const song = currentSong();
  
  const [lyrics, setLyrics] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [activeTab, setActiveTab] = useState('similar'); // 'similar' or 'lyrics'
  const [loadingExtra, setLoadingExtra] = useState(false);
  const { sleepTimer, setSleepTimer } = usePlayerStore();

  useEffect(() => {
    if (!song) return;
    setLoadingExtra(true);
    setLyrics(null);
    Promise.all([
      saavnApi.getLyrics(song.id),
      saavnApi.getSimilarSongs(song.id)
    ]).then(([l, s]) => {
      setLyrics(l);
      setSimilar(s);
    }).finally(() => setLoadingExtra(false));
  }, [song?.id]);

  if (!song) return null;

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * duration);
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="h-full bg-black flex flex-col relative z-50 overflow-hidden select-none border-l-0 md:border-l border-white/5">
      {/* Visualizer Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <Visualizer analyser={analyser} isPlaying={isPlaying} />
      </div>

      <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">AuraBeat Detail</span>
            <button 
              onClick={togglePlayerOpen}
              className="p-2.5 -mr-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X size={22} />
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
                    <p className="px-5 py-2 text-[10px] font-black text-white/50 uppercase tracking-[0.2em] border-b border-white/10 mb-1">Add to Playlist</p>
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
                      className="w-full text-left px-5 py-3 text-xs text-neon-rock hover:text-white hover:bg-neon-rock/20 transition-all flex items-center gap-3 font-bold"
                    >
                      <Plus size={14} strokeWidth={3} />
                      <span>Create New Playlist</span>
                    </button>

                    <div className="h-px bg-white/10 my-1" />
                    
                    <p className="px-5 py-2 text-[10px] font-black text-white/50 uppercase tracking-[0.2em] border-b border-white/10 mb-1 flex items-center gap-2">
                      <Clock size={10} strokeWidth={3} />
                      <span>Sleep Timer</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2 px-4 py-3">
                      {[15, 30, 60].map(m => (
                        <button
                          key={m}
                          onClick={() => { setSleepTimer(m); setShowMenu(false); }}
                          className={clsx(
                            "py-2 rounded-xl text-[11px] font-black transition-all",
                            sleepTimer.active && Math.round((sleepTimer.endAt - Date.now())/60000) === m
                              ? "bg-white text-black shadow-lg shadow-white/20"
                              : "bg-white/10 text-white/90 hover:bg-white/20"
                          )}
                        >
                          {m}m
                        </button>
                      ))}
                      <button
                        onClick={() => { setSleepTimer(0); setShowMenu(false); }}
                        className="col-span-3 mt-2 py-2 text-[10px] font-black text-neon-pink hover:text-white transition-colors uppercase tracking-widest"
                      >
                        Turn Off Timer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs: Similar / Lyrics */}
          <div className="flex border-b border-white/5 mb-6">
            <button 
              onClick={() => setActiveTab('similar')}
              className={clsx(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                activeTab === 'similar' ? "text-neon-rock border-b-2 border-neon-rock" : "text-white/20 hover:text-white/40"
              )}
            >
              Up Next
            </button>
            <button 
              onClick={() => setActiveTab('lyrics')}
              className={clsx(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                activeTab === 'lyrics' ? "text-neon-rock border-b-2 border-neon-rock" : "text-white/20 hover:text-white/40"
              )}
            >
              Lyrics
            </button>
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'lyrics' ? (
              <div className="space-y-4">
                {loadingExtra ? (
                  <div className="space-y-4 animate-pulse">
                    {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-white/5 rounded-full w-full" style={{ width: `${100 - (i * 10)}%` }} />)}
                  </div>
                ) : lyrics ? (
                  <div className="text-[15px] font-medium text-white/80 leading-[2] whitespace-pre-wrap select-text selection:bg-neon-rock selection:text-white tracking-wide font-sans text-center px-4">
                    {lyrics
                      .replace(/<br\s*\/?>/gi, '\n')
                      .replace(/\\n/g, '\n')
                      .replace(/\s\s+/g, '\n\n') // Double-newline for double-spaces for better separation
                      .replace(/&quot;/g, '"')
                      .replace(/&amp;/g, '&')
                      .trim()}
                  </div>
                ) : (
                  <div className="text-center py-20 flex flex-col items-center gap-6">
                    <div className="p-5 rounded-3xl bg-white/5 text-white/20">
                      <Mic2 size={40} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-white/40 font-bold">Lyrics not available locally</p>
                      <p className="text-white/20 text-xs px-10">We couldn't find lyrics on the server, but you can find them online.</p>
                    </div>
                    <button 
                      onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(song.title + ' ' + song.artist + ' lyrics')}`, '_blank')}
                      className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] border border-white/5 transition-all flex items-center gap-3 active:scale-95"
                    >
                      <Search size={14} />
                      <span>Search Lyrics Online</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1 pb-10">
                {loadingExtra ? (
                  <div className="space-y-3 animate-pulse">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-xl w-full" />)}
                  </div>
                ) : (
                  <>
                    {/* Show Queue First */}
                    {queue.length > currentIndex + 1 && (
                      <div className="mb-6">
                        <p className="px-3 mb-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">From Queue</p>
                        {queue.slice(currentIndex + 1, currentIndex + 6).map((s, i) => (
                          <button
                            key={`${s.id}-q-${i}`}
                            onClick={() => setCurrentIndex(currentIndex + 1 + i)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group text-left"
                          >
                            <img src={s.image} className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate group-hover:text-neon-rock transition-colors">{s.title}</p>
                              <p className="text-[10px] text-white/30 truncate uppercase tracking-wider">{s.artist}</p>
                            </div>
                            <Play size={12} className="text-white/20 group-hover:text-white" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recommendations */}
                    {similar.length > 0 && (
                      <div>
                        <p className="px-3 mb-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Recommendations</p>
                        {similar.map((s, i) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              const newQueue = [...queue.slice(0, currentIndex + 1), s, ...queue.slice(currentIndex + 1)];
                              usePlayerStore.setState({ queue: newQueue });
                              setTimeout(() => setCurrentIndex(currentIndex + 1), 50);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group text-left"
                          >
                            <img src={s.image} className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate group-hover:text-neon-rock transition-colors">{s.title}</p>
                              <p className="text-[10px] text-white/30 truncate uppercase tracking-wider">{s.artist}</p>
                            </div>
                            <Plus size={14} className="text-white/20 group-hover:text-white" />
                          </button>
                        ))}
                      </div>
                    )}

                    {queue.length <= currentIndex + 1 && similar.length === 0 && (
                      <p className="text-center py-20 text-white/20 italic text-sm">No songs in queue or recommendations found</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Detailed Controls at Bottom */}
        <div className="bg-black/90 backdrop-blur-2xl p-6 pt-2 pb-10 md:pb-8 border-t border-white/10 space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-mono text-white/30 tracking-widest uppercase">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              className="w-full h-1 bg-white/15 rounded-full cursor-pointer relative group hover:h-1.5 transition-all"
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full bg-neon-rock shadow-[0_0_10px_rgba(249,115,22,0.4)] relative"
                style={{ width: `${pct}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={toggleShuffle} className={clsx(shuffleMode ? 'text-neon-rock' : 'text-white/20')}>
              <Shuffle size={14} />
            </button>
            <div className="flex items-center gap-6">
              <button onClick={playPrevious} className="text-white/40 hover:text-white transition-colors"><SkipBack size={18} fill="currentColor" /></button>
              <button onClick={togglePlayPause} className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">
                {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-1" />}
              </button>
              <button onClick={playNext} className="text-white/40 hover:text-white transition-colors"><SkipForward size={18} fill="currentColor" /></button>
            </div>
            <button onClick={toggleRepeat} className={clsx(repeatMode !== 'off' ? 'text-neon-rock' : 'text-white/20')}>
              {repeatMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
            </button>
          </div>

          {/* Speed Slider */}
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest whitespace-nowrap">Speed {playbackSpeed.toFixed(1)}x</span>
            <input
              type="range" min="0.5" max="2.0" step="0.1" value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="flex-1 h-1 accent-neon-rock cursor-pointer bg-white/5 rounded-full"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
