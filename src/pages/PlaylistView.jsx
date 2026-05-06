import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ListMusic, Play, Loader, Music, ArrowLeft } from 'lucide-react';
import { saavnApi } from '../api/jiosaavn';
import { usePlayerStore } from '../store/playerStore';
import { SongCard } from '../components/SongCard';
import { SongRow } from '../components/SongRow';

export const PlaylistView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      const data = await saavnApi.getPlaylistDetails(id);
      setPlaylist(data);
      setLoading(false);
    };

    if (id) {
      fetchPlaylist();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-neon-purple">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/20">
        <ListMusic size={64} className="mb-4 opacity-10" />
        <p className="text-xl font-bold">Playlist not found</p>
        <button onClick={() => navigate('/')} className="mt-4 text-neon-purple hover:underline">
          Go back home
        </button>
      </div>
    );
  }

  const playAll = () => {
    if (!playlist.songs || playlist.songs.length === 0) return;
    usePlayerStore.setState({
      queue: playlist.songs,
      currentIndex: 0,
      isPlaying: true
    });
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

      {/* Header section refined */}
      <div className="px-8 pt-6 pb-10 relative overflow-hidden">
        <div className="flex items-end gap-6 relative">
          <div className="w-40 h-40 rounded-2xl glass flex items-center justify-center flex-shrink-0 shadow-neon-purple overflow-hidden">
            {playlist.image ? (
              <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <ListMusic size={64} className="text-white/20" />
            )}
          </div>

          <div className="flex-1">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-2 font-semibold">Playlist</p>
            <h1 className="text-4xl font-extrabold text-white mb-4">{playlist.name || 'Unknown Playlist'}</h1>
            
            <div className="flex items-center gap-4">
              <p className="text-white/40 text-sm">{playlist.songs?.length || 0} tracks</p>
              {playlist.songs?.length > 0 && (
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

      {/* Content */}
      <div className="px-8 pb-12">
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