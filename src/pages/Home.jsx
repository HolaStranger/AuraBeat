import React, { useEffect, useState } from 'react';
import { Play, Heart, MoreVertical, ListMusic, Plus, Disc } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { saavnApi } from '../api/jiosaavn';
import { SongCard } from '../components/SongCard';
import { Grid } from '../components/Grid';
import { SongRow } from '../components/SongRow';
import { SongCardSkeleton } from '../components/skeletons/SongCardSkeleton';
import { GridItemSkeleton } from '../components/skeletons/GridItemSkeleton';
import { usePlayerStore } from '../store/playerStore';
import { PageTransition } from '../components/PageTransition';

const LANGUAGES = ['tamil', 'hindi', 'english', 'telugu', 'all'];


export const Home = () => {
  const { language, setQueue } = usePlayerStore();
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      saavnApi.getTrending(language),
      saavnApi.getNewReleases(language),
      saavnApi.searchPlaylists('top hits', language),
    ])
      .then(async ([t, n, p]) => {
        setTrending(t.slice(0, 10));
        setNewReleases(n.slice(0, 10));
        
        // Filter out empty playlists by pre-fetching details for the top results
        const pool = p.slice(0, 8);
        const details = await Promise.all(pool.map(pl => saavnApi.getPlaylistDetails(pl.id)));
        const valid = details.filter(d => d && d.songs && d.songs.length > 0);
        setPlaylists(valid.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, [language]);

  const play = (songs, i) => {
    setQueue(songs);
    usePlayerStore.getState().setCurrentIndex(i);
    usePlayerStore.getState().setIsPlaying(true);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <PageTransition>
    <div className="min-h-full pb-32">
      {/* Hero section refined */}
      <div className="px-5 md:px-8 pt-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neon-rock/10 flex items-center justify-center">
              <Disc size={16} className="text-neon-rock animate-spin-slow" />
            </div>
            <div>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">Personalized for you</p>
            </div>
          </div>

          {/* Interaction Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => usePlayerStore.getState().setLanguage(lang)}
                className={clsx(
                  "px-5 py-2 rounded-full text-xs font-bold capitalize transition-all duration-300",
                  language === lang
                    ? "gradient-btn text-white shadow-lg shadow-neon-rock/20 scale-105"
                    : "glass text-white/30 hover:text-white/80 hover:bg-white/10"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 space-y-10">
        {loading ? (
          <>
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-6 bg-gray-700 rounded-full animate-pulse" />
                <div className="h-6 w-40 rounded bg-gray-700 animate-pulse"></div>
              </div>
              <div className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4 -mx-5 px-5 sm:mx-0 sm:px-0">
                {[...Array(6)].map((_, i) => (
                  <SongCardSkeleton key={i} />
                ))}
              </div>
            </section>
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-6 bg-gray-700 rounded-full animate-pulse" />
                <div className="h-6 w-40 rounded bg-gray-700 animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-6 gap-3 md:gap-4">
                {[...Array(6)].map((_, i) => (
                  <GridItemSkeleton key={i} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Fresh Drops – Song Cards */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-6 bg-neon-rock rounded-full" />
                <h2 className="text-base font-black text-white uppercase tracking-[0.25em]">Fresh Drops</h2>
              </div>
              <div className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 md:gap-4 -mx-5 px-5 sm:mx-0 sm:px-0 pb-4 sm:pb-0">
                {newReleases.slice(0, 8).map((song, i) => (
                  <div key={song.id} className="flex-shrink-0 w-32 sm:w-auto">
                    <SongCard song={song} isNew onClick={() => play(newReleases, i)} />
                  </div>
                ))}
              </div>
            </section>

            {playlists.length > 0 && <Grid title="Top Playlists" items={playlists} type="view/playlist" />}

            {/* Top Charts – Vertical List */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-6 bg-neon-rock rounded-full" />
                <h2 className="text-base font-black text-white uppercase tracking-[0.25em]">Top Charts</h2>
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/[0.03] bg-white/[0.01]">
                <div
                  className="grid px-4 py-2 border-b border-white/[0.04] text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ gridTemplateColumns: '28px 1fr auto' }}
                >
                  <span className="text-center">#</span>
                  <span>Title</span>
                  <span className="pr-2">Time</span>
                </div>
                {newReleases.slice(0, 10).map((song, i) => (
                  <SongRow key={song.id} song={song} index={i} onPlay={() => play(newReleases, i)} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
    </PageTransition>
  );
};
