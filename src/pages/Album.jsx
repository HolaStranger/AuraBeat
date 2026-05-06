import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saavnApi } from '../api/jiosaavn';
import { SongCard } from '../components/SongCard';
import { SongRow } from '../components/SongRow';
import { usePlayerStore } from '../store/playerStore';
import { Play, Disc, Loader, ArrowLeft, Shuffle, Heart } from 'lucide-react';
import clsx from 'clsx';

const decodeHtml = (str) => {
  if (!str) return str;
  return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
};

export const Album = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { savedAlbums, toggleSaveAlbum } = usePlayerStore();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  const isSaved = savedAlbums.some(a => a.id === id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    saavnApi.getAlbumDetails(id)
      .then(setAlbum)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-neon-purple">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/20">
        <Disc size={64} className="mb-4 opacity-10" />
        <p className="text-xl font-bold">Album not found</p>
        <button onClick={() => navigate('/')} className="mt-4 text-neon-purple hover:underline">
          Go back home
        </button>
      </div>
    );
  }

  const playAll = () => {
    if (!album.songs || album.songs.length === 0) return;
    usePlayerStore.setState({
      queue: album.songs,
      currentIndex: 0,
      isPlaying: true,
      shuffleMode: false
    });
  };

  const shufflePlay = () => {
    if (!album.songs || album.songs.length === 0) return;
    const shuffled = [...album.songs].sort(() => Math.random() - 0.5);
    usePlayerStore.setState({
      queue: shuffled,
      currentIndex: 0,
      isPlaying: true,
      shuffleMode: true
    });
  };

  // Extract the image, handling the nested array format from JioSaavn
  const albumImage = Array.isArray(album.image) 
    ? (album.image[album.image.length - 1]?.url || album.image[album.image.length - 1]?.link)
    : album.image;

  return (
    <div className="min-h-full relative">
      {/* Floating Back Button - moved higher to avoid image overlap */}
      <div className="absolute top-4 left-5 md:left-8 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="glass p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all group shadow-xl border border-white/10"
          title="Go Back"
        >
          <ArrowLeft size={20} className="group-active:scale-90 transition-transform" />
        </button>
      </div>

      {/* Header - added more padding-top to push image down */}
      <div className="px-5 md:px-8 pt-16 md:pt-20 pb-8 md:pb-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-6 relative text-center md:text-left">
          <div className="w-40 h-40 rounded-2xl glass flex items-center justify-center flex-shrink-0 shadow-neon-purple overflow-hidden">
            {albumImage ? (
              <img src={albumImage} alt={album.name} className="w-full h-full object-cover" />
            ) : (
              <Disc size={64} className="text-white/20" />
            )}
          </div>

          <div className="flex-1">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-2 font-semibold">Album</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{decodeHtml(album.name) || 'Unknown Album'}</h1>
            
            <div className="flex items-center justify-center md:justify-start gap-4">
              <p className="text-white/40 text-sm">{album.songs?.length || 0} tracks</p>
              {album.songs?.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={playAll}
                    className="flex items-center gap-2 gradient-btn text-white text-sm font-semibold px-6 py-2 rounded-full shadow-neon-purple"
                  >
                    <Play size={16} fill="white" /> Play
                  </button>
                  <button
                    onClick={shufflePlay}
                    className="flex items-center gap-2 glass text-white/70 hover:text-white text-sm font-semibold px-6 py-2 rounded-full border border-white/5 hover:border-white/20 transition-all"
                  >
                    <Shuffle size={16} /> Shuffle
                  </button>
                  <button
                    onClick={() => toggleSaveAlbum({ id, name: album.name, image: albumImage, artist: album.primaryArtists })}
                    className={clsx(
                      "p-2.5 rounded-full glass border border-white/5 transition-all",
                      isSaved ? "text-neon-pink bg-neon-pink/10 border-neon-pink/20" : "text-white/40 hover:text-white"
                    )}
                  >
                    <Heart size={18} fill={isSaved ? "currentColor" : "none"} strokeWidth={isSaved ? 0 : 2} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <div className="px-5 md:px-8 pb-12">
        <div className="rounded-2xl overflow-hidden border border-white/[0.03] bg-white/[0.01]">
          <div
            className="hidden md:grid px-4 py-2 border-b border-white/[0.04] text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ gridTemplateColumns: '28px 1fr auto' }}
          >
            <span className="text-center">#</span>
            <span>Title</span>
            <span className="pr-2">Time</span>
          </div>
          {(() => {
            const unique = [];
            const seen = new Set();
            (album.songs || []).forEach(song => {
              const cleanTitle = (song.title || '').toLowerCase().trim();
              if (!seen.has(cleanTitle)) {
                unique.push(song);
                seen.add(cleanTitle);
              }
            });
            return unique.map((song, i) => (
              <SongRow 
                key={`${song.id}-${i}`} 
                song={song} 
                index={i}
                onPlay={() => {
                  usePlayerStore.setState({ queue: unique, currentIndex: i, isPlaying: true });
                }} 
              />
            ));
          })()}
        </div>
      </div>
    </div>
  );
};
