import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saavnApi } from '../api/jiosaavn';
import { SongCard } from '../components/SongCard';
import { usePlayerStore } from '../store/playerStore';
import { Play, Disc, Loader } from 'lucide-react';

const decodeHtml = (str) => {
  if (!str) return str;
  return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
};

export const Album = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

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
      isPlaying: true
    });
  };

  // Extract the image, handling the nested array format from JioSaavn
  const albumImage = Array.isArray(album.image) 
    ? album.image[album.image.length - 1]?.link 
    : album.image;

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-5 md:px-8 pt-10 md:pt-14 pb-8 md:pb-10 relative overflow-hidden">
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
                <button
                  onClick={playAll}
                  className="flex items-center gap-2 gradient-btn text-white text-sm font-semibold px-6 py-2 rounded-full shadow-neon-purple"
                >
                  <Play size={16} fill="white" /> Play
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <div className="px-5 md:px-8 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
          {album.songs?.map((song, i) => (
            <SongCard 
              key={`${song.id}-${i}`} 
              song={song} 
              onClick={() => {
                usePlayerStore.setState({ queue: album.songs, currentIndex: i, isPlaying: true });
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
