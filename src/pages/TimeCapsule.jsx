import React from 'react';
import { Sparkles, Calendar, Play, ChevronRight, History } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { SongCard } from '../components/SongCard';
import { PageTransition } from '../components/PageTransition';

export const TimeCapsule = () => {
  const { timeCapsule, setQueue } = usePlayerStore();

  const playDate = (date) => {
    const songs = timeCapsule[date] || [];
    if (songs.length === 0) return;
    setQueue(songs);
    usePlayerStore.getState().setCurrentIndex(0);
    usePlayerStore.getState().setIsPlaying(true);
  };

  const playSong = (songs, index) => {
    setQueue(songs);
    usePlayerStore.getState().setCurrentIndex(index);
    usePlayerStore.getState().setIsPlaying(true);
  };

  const dates = Object.keys(timeCapsule).sort().reverse();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Today\'s Aura';
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';

    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <PageTransition>
      <div className="min-h-full pb-20">
        {/* Header */}
        <div className="px-5 md:px-8 pt-8 md:pt-12 pb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-rock/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-purple/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-neon-rock/20 text-neon-rock">
                <Sparkles size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Premium Feature</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Time <span className="gradient-text">Capsule</span></h1>
            <p className="text-white/40 max-w-lg text-sm leading-relaxed">
              Your daily musical identity. We capture the songs that defined your "Aura" each day, creating a living archive of your journey.
            </p>
          </div>
        </div>

        <div className="px-5 md:px-8 space-y-16">
          {dates.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center text-white/10">
                <History size={40} strokeWidth={1} />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-white/40">Your capsule is empty</p>
                <p className="text-white/20 text-sm max-w-xs mx-auto">Start listening or hearting songs to generate your first Daily Aura.</p>
              </div>
            </div>
          ) : (
            dates.map((date) => (
              <section key={date} className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-neon-rock to-neon-purple" />
                    <div>
                      <h2 className="text-xl font-extrabold text-white">{formatDate(date)}</h2>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{timeCapsule[date].length} Tracks Captured</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => playDate(date)}
                    className="flex items-center gap-2 glass px-5 py-2 rounded-full text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                  >
                    <Play size={14} fill="currentColor" /> Play Day
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
                  {timeCapsule[date].slice(0, 6).map((song, i) => (
                    <SongCard 
                      key={`${song.id}-${date}-${i}`} 
                      song={song} 
                      onClick={() => playSong(timeCapsule[date], i)} 
                    />
                  ))}
                  {timeCapsule[date].length > 6 && (
                    <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 border border-white/5 opacity-50 hover:opacity-100 transition-opacity">
                       <p className="text-xs font-bold text-white/40">+{timeCapsule[date].length - 6} more tracks</p>
                    </div>
                  )}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
};
