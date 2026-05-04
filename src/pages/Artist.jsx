import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saavnApi } from '../api/jiosaavn';
import { SongCard } from '../components/SongCard';
import { usePlayerStore } from '../store/playerStore';
import { Play, Disc, Music, User } from 'lucide-react';

const decodeHtml = (str) => {
  if (!str) return str;
  return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
};

export const Artist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setQueue } = usePlayerStore();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    saavnApi.getArtistDetails(id)
      .then(setArtist)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="h-full flex items-center justify-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full bg-neon-purple animate-bounce" />
      <div className="w-2.5 h-2.5 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2.5 h-2.5 rounded-full bg-neon-rock animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );

  if (!artist) return (
    <div className="h-full flex flex-col items-center justify-center text-white/20">
      <User size={64} className="mb-4 opacity-10" />
      <p className="text-xl font-bold">Artist not found</p>
    </div>
  );

  const playTopSongs = () => {
    if (artist.topSongs.length === 0) return;
    setQueue(artist.topSongs);
    usePlayerStore.getState().setCurrentIndex(0);
    usePlayerStore.getState().setIsPlaying(true);
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-5 md:px-8 pt-10 md:pt-16 pb-8 md:pb-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 relative text-center md:text-left">
          <img 
            src={artist.image?.[artist.image.length-1]?.link || 'https://placehold.co/300x300/1a0a2e/8b5cf6?text=Artist'} 
            alt={artist.name}
            className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover shadow-neon-purple border-4 border-white/5"
          />
          <div className="flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 text-blue-400 mb-2">
              <span className="bg-blue-500/10 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest border border-blue-500/20">Verified Artist</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 md:mb-6 drop-shadow-xl">{decodeHtml(artist.name)}</h1>
            
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <button 
                onClick={playTopSongs}
                className="w-full md:w-auto flex items-center justify-center gap-2 gradient-btn text-white text-sm font-bold px-8 py-3 rounded-full shadow-neon-purple"
              >
                <Play size={18} fill="white" /> Play Top Songs
              </button>
              <div className="text-white/40 text-sm">
                <span className="font-bold text-white/60">{artist.followerCount || '0'}</span> Followers
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 md:px-8 pb-12 space-y-12">
        {/* Top Songs */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Popular Tracks</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
            {artist.topSongs.slice(0, 5).map((song, i) => (
              <SongCard 
                key={song.id} 
                song={song} 
                onClick={() => {
                  setQueue(artist.topSongs);
                  usePlayerStore.getState().setCurrentIndex(i);
                  usePlayerStore.getState().setIsPlaying(true);
                }} 
              />
            ))}
          </div>
        </section>

        {/* Top Albums */}
        {artist.topAlbums && artist.topAlbums.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
              {artist.topAlbums.map((album) => (
                <div 
                  key={album.id}
                  onClick={() => navigate(`/album/${album.id}`)}
                  className="group glass rounded-2xl p-3 cursor-pointer hover:bg-white/[0.07] hover:shadow-neon-purple transition-all"
                >
                  <div className="relative aspect-square mb-3 rounded-xl overflow-hidden">
                    <img 
                      src={album.image?.[album.image.length-1]?.link || 'https://placehold.co/300x300/1a0a2e/8b5cf6?text=Album'} 
                      alt={album.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Disc size={32} className="text-white animate-spin-slow" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm text-white truncate">{album.name}</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{album.year || 'Album'}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
