import React from 'react';
import { Heart, Play, Disc } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { SongCard } from '../components/SongCard';
import { PageTransition } from '../components/PageTransition';

export const Library = () => {
  const { likedSongs, savedAlbums, setQueue } = usePlayerStore();

  const play = (songs, i) => {
    setQueue(songs);
    usePlayerStore.getState().setCurrentIndex(i);
    usePlayerStore.getState().setIsPlaying(true);
  };

  return (
    <PageTransition>
    <div className="min-h-full">
      {/* Header section refined */}
      <div className="px-5 md:px-8 pt-4 pb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-6 relative text-center md:text-left">
          {/* Cover artwork */}
          <div
            className="w-36 h-36 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-neon-rock border border-white/5"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #fb923c)' }}
          >
            <Heart size={52} className="text-white drop-shadow-lg" fill="white" />
          </div>

          <div className="flex-1">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-2 font-semibold">Collection</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Liked Songs</h1>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <p className="text-white/40 text-sm">{likedSongs.length} tracks</p>
              {likedSongs.length > 0 && (
                <button
                  onClick={() => play(likedSongs, 0)}
                  className="flex items-center gap-2 gradient-btn text-white text-sm font-semibold px-5 py-2 rounded-full shadow-neon-rock"
                >
                  <Play size={15} fill="white" /> Play All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 pb-8">
        {likedSongs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full glass flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-white/15" />
            </div>
            <p className="text-lg font-semibold text-white/40 mb-2">No liked songs yet</p>
            <p className="text-white/25 text-sm">Hover over a song and hit the ♥ to save it here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
            {likedSongs.map((song, i) => (
              <SongCard key={song.id} song={song} onClick={() => play(likedSongs, i)} />
            ))}
          </div>
        )}
      </div>

    </div>
    </PageTransition>
  );
};
