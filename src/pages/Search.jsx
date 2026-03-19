import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { saavnApi } from '../api/jiosaavn';
import { SongCard } from '../components/SongCard';
import { usePlayerStore } from '../store/playerStore';

const LANGUAGES = ['tamil', 'hindi', 'english', 'all'];

export const Search = () => {
  const { language, setLanguage, setQueue } = usePlayerStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        const data = await saavnApi.search(query, language);
        setResults(data);
        setLoading(false);
      } else if (!query.trim()) setResults([]);
    }, 500);
    return () => clearTimeout(t);
  }, [query, language]);

  const play = (songs, i) => {
    setQueue(songs);
    usePlayerStore.getState().setCurrentIndex(i);
    usePlayerStore.getState().setIsPlaying(true);
  };

  return (
    <div className="min-h-full px-8 pt-14 pb-8">
      {/* Header */}
      <div className="relative mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-6">
          <span className="gradient-text">Search</span>
        </h1>

        {/* Search box */}
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Songs, artists, albums..."
            autoFocus
            className="w-full glass rounded-2xl text-white placeholder:text-white/25 pl-11 pr-10 py-3.5 text-sm font-medium focus:outline-none focus:neon-border transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Language chips */}
        <div className="flex gap-2 mt-4">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-150 ${
                language === lang
                  ? 'gradient-btn text-white shadow-neon-rock'
                  : 'glass text-white/40 hover:text-white/70 hover:bg-white/[0.05]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center gap-3 py-20">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-neon-rock animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-neon-rock animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-white/30 text-xs mb-5 uppercase tracking-widest">{results.length} results for "{query}"</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((song, i) => (
              <SongCard key={song.id} song={song} onClick={() => play(results, i)} />
            ))}
          </div>
        </>
      ) : query.length > 2 ? (
        <div className="text-center py-20 text-white/25">
          <p className="text-lg font-semibold text-white/40">Nothing found for "{query}"</p>
          <p className="text-sm mt-2">Try a different search term or language</p>
        </div>
      ) : (
        <div className="text-center py-24 text-white/15">
          <div className="w-24 h-24 rounded-full glass flex items-center justify-center mx-auto mb-6">
            <SearchIcon size={40} className="text-white/20" />
          </div>
          <p className="text-lg font-semibold text-white/30">What do you want to hear?</p>
        </div>
      )}
    </div>
  );
};
