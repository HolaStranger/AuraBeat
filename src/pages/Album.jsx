import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { saavnApi } from '../api/jiosaavn';
import { SongCard } from '../components/SongCard';
import { usePlayerStore } from '../store/playerStore';
import { Play, Disc, Calendar, Music } from 'lucide-react';

const decodeHtml = (str) => {
  if (!str) return str;
  return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
};

export const Album = () => {
  const { id } = useParams();
  const { setQueue } = usePlayerStore();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    saavnApi.getAlbumDetails(id)
      .then(setAlbum)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="h-full flex items-center justify-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full bg-neon-purple animate-bounce" />
      <div className="w-2.5 h-2.5 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2.5 h-2.5 rounded-full bg-neon-rock animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );

  if (!album) return (
    <div className="h-full flex flex-col items-center justify-center text-white/20">
      <Disc size={64} className="mb-4 opacity-10" />
      <p className="text-xl font-bold">Album not found</p>
    </div>
  );

  const playAll = () => {
    if (!album.songs || album.songs.length === 0) return;
    setQueue(album.songs);
    usePlayerStore.getState().setCurrentIndex(0);
    usePlayerStore.getState().setIsPlaying(true);
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-8 pt-16 pb-10 relative overflow-hidden">
        <div className="flex items-end gap-8 relative">
          <img 
            src={album.image?.[album.image.length-1]?.link || 'https://placehold.co/300x300/1a0a2e/8b5cf6?text=Album'} 
            alt={album.name}
            className="w-48 h-48 rounded-2xl object-cover shadow-neon-pink border-4 border-white/5"
          />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-neon-pink uppercase tracking-[0.2em] mb-3">Album</p>
            <h1 className="text-5xl font-black text-white mb-6 drop-shadow-xl">{decodeHtml(album.name)}</h1>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={playAll}
                className="flex items-center gap-2 gradient-btn text-white text-sm font-bold px-8 py-3 rounded-full shadow-neon-purple"
              >
                <Play size={18} fill="white" /> Play Album
              </button>
              <div className="flex items-center gap-4 text-white/40 text-sm font-medium">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {album.year}</span>
                <span className="flex items-center gap-1.5"><Music size={14} /> {album.songCount} Songs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <div className="px-8 pb-12">
        <h2 className="text-xl font-bold text-white mb-6">Tracklist</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {album.songs.map((song, i) => (
            <SongCard 
              key={song.id} 
              song={song} 
              onClick={() => {
                setQueue(album.songs);
                usePlayerStore.getState().setCurrentIndex(i);
                usePlayerStore.getState().setIsPlaying(true);
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
