import React, { useEffect, useState } from 'react';
import { X, Music } from 'lucide-react';
import { saavnApi } from '../../api/jiosaavn';

export const LyricsPanel = ({ songId, onClose }) => {
  const [lyrics, setLyrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!songId) return;
    setLoading(true);
    saavnApi.getLyrics(songId)
      .then(setLyrics)
      .finally(() => setLoading(false));
  }, [songId]);

  return (
    <div className="absolute inset-0 z-[60] glass-dark backdrop-blur-3xl flex flex-col animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Music size={16} className="text-neon-purple" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Lyrics</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-10 no-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
            <p className="text-white/30 text-xs font-medium animate-pulse">Fetching lyrics...</p>
          </div>
        ) : lyrics ? (
          <div className="max-w-2xl mx-auto">
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed text-center whitespace-pre-wrap selection:bg-neon-purple/30">
              {lyrics.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-6">
              <X size={32} className="text-white/10" />
            </div>
            <p className="text-lg font-semibold text-white/40">Lyrics not available</p>
            <p className="text-white/20 text-sm mt-2">We couldn't find lyrics for this track</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-6 py-4 text-center">
        <p className="text-[10px] text-white/10 uppercase tracking-widest">Enjoy your personal music hub</p>
      </div>
    </div>
  );
};
