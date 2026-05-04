import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ListMusic, Play, Trash2, Music } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { SongCard } from '../components/SongCard';

export const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playlists, deletePlaylist } = usePlayerStore();
  
  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/20">
        <ListMusic size={64} className="mb-4 opacity-10" />
        <p className="text-xl font-bold">Playlist not found</p>
        <button onClick={() => navigate('/')} className="mt-4 text-neon-purple hover:underline">Go back home</button>
      </div>
    );
  }

  const playAll = () => {
    if (playlist.songs.length === 0) return;
    usePlayerStore.setState({
      queue: playlist.songs,
      currentIndex: 0,
      isPlaying: true
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
      navigate('/library');
    }
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-5 md:px-8 pt-10 md:pt-14 pb-8 md:pb-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-6 relative text-center md:text-left">
          <div className="w-40 h-40 rounded-2xl glass flex items-center justify-center flex-shrink-0 shadow-neon-purple">
            <ListMusic size={64} className="text-white/20" />
          </div>

          <div className="flex-1">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-2 font-semibold">Playlist</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{playlist.name}</h1>
            
            <div className="flex items-center justify-center md:justify-start gap-4">
              <p className="text-white/40 text-sm">{playlist.songs.length} tracks</p>
              {playlist.songs.length > 0 && (
                <button
                  onClick={playAll}
                  className="flex items-center gap-2 gradient-btn text-white text-sm font-semibold px-6 py-2 rounded-full shadow-neon-purple"
                >
                  <Play size={16} fill="white" /> Play
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-500/10 rounded-full text-white/20 hover:text-red-400 transition-all"
                title="Delete Playlist"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 md:px-8 pb-12">
        {playlist.songs.length === 0 ? (
          <div className="text-center py-24 text-white/10">
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center mx-auto mb-6">
              <Music size={32} className="text-white/10" />
            </div>
            <p className="text-lg font-semibold">This playlist is empty</p>
            <p className="text-sm mt-2 max-w-xs mx-auto">Click the three dots on any song to add it here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
            {playlist.songs.map((song, i) => (
              <SongCard 
                key={`${song.id}-${i}`} 
                song={song} 
                onClick={() => {
                  usePlayerStore.setState({
                    queue: playlist.songs,
                    currentIndex: i,
                    isPlaying: true
                  });
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
