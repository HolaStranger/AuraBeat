import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, TrendingUp, Clock, Music2, Mic2, Sparkles, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saavnApi } from '../api/jiosaavn';
import { SongCard } from '../components/SongCard';
import { usePlayerStore } from '../store/playerStore';

const LANGUAGES = ['tamil', 'hindi', 'english', 'telugu', 'kannada', 'all'];

const GENRE_CHIPS = [
  { label: '🔥 Trending', query: 'trending hits' },
  { label: '💃 Dance', query: 'dance hits' },
  { label: '❤️ Romance', query: 'love songs' },
  { label: '😢 Sad', query: 'sad songs' },
  { label: '🎉 Party', query: 'party hits' },
  { label: '🙏 Devotional', query: 'devotional' },
  { label: '🎵 Classics', query: 'classic hits' },
  { label: '🏋️ Energy', query: 'high energy beats' },
];

export const Search = () => {
  const { language, setLanguage, setQueue, history } = usePlayerStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [albumResults, setAlbumResults] = useState([]);
  const [playlistResults, setPlaylistResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isGenreSearch, setIsGenreSearch] = useState(false);
  const inputRef = useRef(null);

  // Load suggestions when page mounts or language changes
  useEffect(() => {
    setSuggestionsLoading(true);
    saavnApi.getSuggestions(language).then(data => {
      setSuggestions(data);
      setSuggestionsLoading(false);
    });
  }, [language]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        const searchLang = isGenreSearch ? 'all' : language;
        
        // Search songs, albums, and playlists simultaneously
        const [songData, albumData, playlistData] = await Promise.all([
          saavnApi.search(query, searchLang),
          saavnApi.searchAlbums(query),
          saavnApi.searchPlaylists(query)
        ]);
        
        // De-duplicate songs by title (clean version) to avoid clutter
        const uniqueSongs = [];
        const seenTitles = new Set();
        for (const s of (songData || [])) {
          const clean = s.title.toLowerCase().split('(')[0].trim();
          if (!seenTitles.has(clean)) {
            uniqueSongs.push(s);
            seenTitles.add(clean);
          }
        }
        
        setResults(uniqueSongs);
        setAlbumResults(albumData);
        setPlaylistResults(playlistData);
        setLoading(false);
      } else if (!query.trim()) {
        setResults([]);
        setAlbumResults([]);
        setPlaylistResults([]);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query, language, isGenreSearch]);

  const play = (songs, i) => {
    setQueue(songs);
    usePlayerStore.getState().setCurrentIndex(i);
    usePlayerStore.getState().setIsPlaying(true);
  };

  // Genre chip: combine mood + user's language for personalised results
  const playGenre = (genreQuery) => {
    const combined = language && language !== 'all'
      ? `${language} ${genreQuery}`
      : genreQuery;
    setIsGenreSearch(true);
    setQuery(combined);
    inputRef.current?.focus();
  };

  // Manual typing: re-enable language filter
  const handleQueryChange = (val) => {
    setIsGenreSearch(false);
    setQuery(val);
  };

  const isSearching = query.trim().length > 1;
  const recentHistory = (history || []).slice(0, 4);

  return (
    <div className="min-h-full pb-32 md:pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/[0.04] px-5 md:px-8 pt-6 md:pt-10 pb-4 md:pb-5">
        <h1 className="text-2xl md:text-3xl font-black text-white mb-4 md:mb-5 tracking-tight">
          <span className="gradient-text">Search</span>
        </h1>

        {/* Search box */}
        <div className="relative max-w-2xl">
          <SearchIcon
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isFocused ? 'text-neon-rock' : 'text-white/30'}`}
            size={18}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder="Songs, artists, albums..."
            autoFocus
            className="w-full glass rounded-2xl text-white placeholder:text-white/25 pl-11 pr-10 py-3.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-neon-rock/40 transition-all"
          />
          {query && (
            <button
              onClick={() => { setIsGenreSearch(false); setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Language chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap">
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

      <div className="px-5 md:px-8 pt-6">
        {/* Results */}
        {loading ? (
          <div className="flex justify-center gap-3 py-20">
            <div className="w-2.5 h-2.5 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-neon-rock animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-neon-rock animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : isSearching && (results.length > 0 || albumResults.length > 0) ? (
          <div className="space-y-12">
            {/* Songs Section */}
            {results.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Top Songs</p>
                  <p className="text-white/20 text-[10px]">{results.length} found</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
                  {results.map((song, i) => (
                    <SongCard key={song.id} song={song} onClick={() => play(results, i)} />
                  ))}
                </div>
              </section>
            )}

            {/* Albums Section */}
            {albumResults.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Albums & Movies</p>
                  <p className="text-white/20 text-[10px]">{albumResults.length} found</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
                  {albumResults.map((album) => (
                    <Link 
                      key={album.id} 
                      to={`/album/${album.id}`}
                      className="glass rounded-2xl p-3 border border-white/5 hover:border-neon-rock/30 transition-all group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-3 relative">
                        <img src={album.image} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-neon-rock flex items-center justify-center">
                            <ChevronRight size={20} className="text-white" />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white truncate group-hover:text-neon-rock transition-colors">{album.title}</p>
                      <p className="text-[10px] text-white/30 truncate mt-1 uppercase tracking-wider">{album.artist}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Playlists Section */}
            {playlistResults.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Playlists & Jukeboxes</p>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/20 text-[8px] font-bold">Collections</span>
                  </div>
                  <p className="text-white/20 text-[10px]">{playlistResults.length} found</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
                  {playlistResults.map((playlist) => (
                    <Link 
                      key={playlist.id} 
                      to={`/view/playlist/${playlist.id}`}
                      className="glass rounded-2xl p-3 border border-white/5 hover:border-neon-purple/30 transition-all group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-3 relative">
                        <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-neon-purple group-hover:border-neon-purple transition-all shadow-lg group-hover:shadow-neon-purple/20">
                            <Play size={18} className="text-white ml-1 fill-white/20" />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/40 backdrop-blur-md text-[8px] font-black text-white/60 uppercase tracking-widest border border-white/5">
                          Jukebox
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white truncate group-hover:text-neon-purple transition-colors">{playlist.name}</p>
                      <p className="text-[10px] text-white/30 truncate mt-1 uppercase tracking-wider">{playlist.subtitle || 'Movie Collection'}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : isSearching && results.length === 0 && albumResults.length === 0 && playlistResults.length === 0 ? (
          <div className="text-center py-20 text-white/25">
            <p className="text-lg font-semibold text-white/40">Nothing found for "{query}"</p>
            <p className="text-sm mt-2">Try a different search term or language</p>
          </div>
        ) : (
          /* Discovery Panel — shown when not searching */
          <div className="space-y-10">

            {/* Genre Quick Picks */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles size={16} className="text-neon-rock" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Browse by Mood</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {GENRE_CHIPS.map(chip => (
                  <button
                    key={chip.label}
                    onClick={() => playGenre(chip.query)}
                    className="glass px-4 py-2 rounded-full text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.08] hover:shadow-neon-rock/20 hover:shadow-md transition-all duration-200 active:scale-95"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Recently Played */}
            {recentHistory.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-neon-purple" />
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Recently Played</h2>
                  </div>
                  <Link to="/history" className="text-[10px] font-black text-white/30 hover:text-neon-purple uppercase tracking-widest transition-colors">See All</Link>
                </div>
                <div className="space-y-1">
                  {recentHistory.map((song, i) => (
                    <button
                      key={`${song.id}-${i}`}
                      onClick={() => play(recentHistory, i)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors group text-left"
                    >
                      <img
                        src={song.image}
                        alt={song.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-neon-rock transition-colors">
                          {song.title}
                        </p>
                        <p className="text-xs text-white/35 truncate">{song.artist}</p>
                      </div>
                      <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 flex-shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Language Quick Picks */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Music2 size={16} className="text-neon-rock" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">{language} Spotlight</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => playGenre(`latest ${language} hits 2025`)}
                  className="glass p-4 rounded-2xl border border-white/5 hover:border-neon-rock/30 transition-all text-left group"
                >
                  <p className="text-[10px] font-black text-neon-rock uppercase tracking-widest mb-1">New Releases</p>
                  <p className="text-sm font-bold text-white/80 group-hover:text-white">Fresh {language} Tracks</p>
                </button>
                <button 
                  onClick={() => playGenre(`best of ${language} party`)}
                  className="glass p-4 rounded-2xl border border-white/5 hover:border-neon-purple/30 transition-all text-left group"
                >
                  <p className="text-[10px] font-black text-neon-purple uppercase tracking-widest mb-1">Party Mix</p>
                  <p className="text-sm font-bold text-white/80 group-hover:text-white">{language} Dance Hits</p>
                </button>
              </div>
            </section>

            {/* Trending Now */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={16} className="text-neon-rock" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Trending in {language}</h2>
              </div>
              {suggestionsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="glass rounded-xl p-3 animate-pulse">
                      <div className="aspect-square rounded-lg bg-white/10 mb-2" />
                      <div className="h-3 bg-white/10 rounded mb-1" />
                      <div className="h-2.5 bg-white/5 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
                  {suggestions.map((song, i) => (
                    <SongCard key={song.id} song={song} onClick={() => play(suggestions, i)} />
                  ))}
                </div>
              )}
            </section>

            {/* Artist discovery hint */}
            <section className="rounded-2xl glass p-6 flex items-center gap-5 border border-neon-rock/10">
              <div className="w-12 h-12 rounded-2xl bg-neon-rock/20 flex items-center justify-center flex-shrink-0">
                <Mic2 size={24} className="text-neon-rock" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm mb-1">Find your favourite artist</p>
                <p className="text-white/35 text-xs">Type their name above to explore their full discography</p>
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
};
