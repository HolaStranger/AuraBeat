import React from 'react';
import { Disc, Play, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { PageTransition } from '../components/PageTransition';

export const SavedAlbums = () => {
  const { savedAlbums } = usePlayerStore();
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-full">
        {/* Header section */}
        <div className="px-5 md:px-8 pt-6 pb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-6 relative text-center md:text-left">
            <div
              className="w-36 h-36 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-neon-blue border border-white/10 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent animate-pulse" />
              <Disc size={52} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-spin-slow" />
            </div>

            <div className="flex-1">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-2 font-semibold">Collection</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Saved Albums</h1>
              <p className="text-white/40 text-sm">{savedAlbums.length} albums in your collection</p>
            </div>
          </div>
        </div>

        <div className="px-5 md:px-8 pb-12">
          {savedAlbums.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full glass flex items-center justify-center mx-auto mb-6">
                <Disc size={40} className="text-white/15" />
              </div>
              <p className="text-lg font-semibold text-white/40 mb-2">No saved albums yet</p>
              <p className="text-white/25 text-sm">Hit the heart icon on any album to save it here</p>
              <button 
                onClick={() => navigate('/search')}
                className="mt-6 text-neon-purple hover:underline text-sm font-bold"
              >
                Discover music
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 md:gap-4">
              {savedAlbums.map((album) => (
                <Link
                  key={album.id}
                  to={`/album/${album.id}`}
                  className="group glass rounded-2xl p-3 w-full block cursor-pointer hover:bg-white/[0.07] hover:shadow-neon-purple/20 border border-transparent hover:border-white/10 transition-all duration-300"
                >
                  <div className="relative aspect-square mb-3 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src={(() => {
                        const img = album.image;
                        if (!img) return 'https://placehold.co/400x400/1a0a2e/8b5cf6?text=♪';
                        if (typeof img === 'string') return img;
                        if (Array.isArray(img)) return img[img.length - 1]?.url || img[img.length - 1]?.link || 'https://placehold.co/400x400/1a0a2e/8b5cf6?text=♪';
                        if (typeof img === 'object') return img.url || img.link || 'https://placehold.co/400x400/1a0a2e/8b5cf6?text=♪';
                        return 'https://placehold.co/400x400/1a0a2e/8b5cf6?text=♪';
                      })()} 
                      alt={album.title || album.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Disc size={32} className="text-white animate-spin-slow" />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-white truncate group-hover:text-neon-purple transition-colors">{album.title || album.name}</h3>
                  <p className="text-[10px] text-white/30 truncate uppercase tracking-widest mt-1">{album.artist || album.primaryArtists}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
