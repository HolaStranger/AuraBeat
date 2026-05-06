import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ListMusic, Play, Shuffle, Trash2, Music, ArrowLeft } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { SongRow } from '../components/SongRow';

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

  const shufflePlay = () => {
    if (playlist.songs.length === 0) return;
    const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
    usePlayerStore.setState({
      queue: shuffled,
      currentIndex: 0,
      isPlaying: true,
      shuffleMode: true
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
      navigate('/library');
    }
  };

  return (
    <div className="min-h-full relative">
      {/* Floating Back Button - moved higher to avoid overlap */}
      <div className="absolute top-4 left-5 md:left-8 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="glass p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all group shadow-xl border border-white/10"
          title="Go Back"
        >
          <ArrowLeft size={20} className="group-active:scale-90 transition-transform" />
        </button>
      </div>

      {/* Header - added more padding-top to push content down */}
      <div className="px-5 md:px-8 pt-16 md:pt-20 pb-8 md:pb-10 relative overflow-hidden">
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
                </div>
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
              (playlist.songs || []).forEach(song => {
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
                    usePlayerStore.setState({
                      queue: unique,
                      currentIndex: i,
                      isPlaying: true
                    });
                  }} 
                />
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
