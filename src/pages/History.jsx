import React from 'react';
import { History as HistoryIcon, Trash2, Play } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { SongCard } from '../components/SongCard';

export const History = () => {
  const { history, setQueue, addToHistory } = usePlayerStore();

  const play = (songs, i) => {
    setQueue(songs);
    usePlayerStore.getState().setCurrentIndex(i);
    usePlayerStore.getState().setIsPlaying(true);
  };

  const clearHistory = () => {
    usePlayerStore.setState({ history: [] });
  };

  return (
    <div className="min-h-full px-8 pt-14 pb-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Recently <span className="gradient-text">Played</span>
          </h1>
          <p className="text-white/30 text-sm">Your last 50 tracks</p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
          >
            <Trash2 size={16} />
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-24 text-white/15">
          <div className="w-24 h-24 rounded-full glass flex items-center justify-center mx-auto mb-6">
            <HistoryIcon size={40} className="text-white/20" />
          </div>
          <p className="text-lg font-semibold text-white/30">Your history is empty</p>
          <p className="text-sm mt-2">Start listening to build your collection</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {history.map((song, i) => (
            <SongCard key={`${song.id}-${i}`} song={song} onClick={() => play(history, i)} />
          ))}
        </div>
      )}
    </div>
  );
};
