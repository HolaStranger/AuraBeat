import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      // Queue & Playback state
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      volume: 1,
      repeatMode: 'off', // 'off', 'all', 'one'
      shuffleMode: false,
      autoPlay: true,
      playbackSpeed: 1,
      isPlayerOpen: false,
      
      // Sleep Timer
      sleepTimer: { active: false, minutes: 0, endAt: null },

      // User Data
      likedSongs: [],
      savedAlbums: [], // [{ id, title, artist, image, ... }]
      playlists: [], // [{ id, name, songs: [], createdAt }]
      history: [],   // [song, song, ...]
      language: 'tamil',

      // Album Actions
      toggleSaveAlbum: (album) => set((state) => {
        const isSaved = state.savedAlbums.some(a => a.id === album.id);
        return { 
          savedAlbums: isSaved 
            ? state.savedAlbums.filter(a => a.id !== album.id) 
            : [{ ...album, type: 'album' }, ...state.savedAlbums] 
        };
      }),

      // UI State
      togglePlayerOpen: () => set((state) => ({ isPlayerOpen: !state.isPlayerOpen })),

      // Queue Actions
      setQueue: (songs) => set({ queue: songs, currentIndex: songs.length > 0 ? 0 : -1 }),
      addNext: (song) => set((state) => {
        const newQueue = [...state.queue];
        if (state.currentIndex === -1) {
          return { queue: [song], currentIndex: 0, isPlaying: true };
        }
        // Remove if exists and add after current
        const filtered = newQueue.filter(s => s.id !== song.id);
        const idx = filtered.findIndex(s => s.id === state.queue[state.currentIndex]?.id);
        filtered.splice(idx + 1, 0, song);
        return { queue: filtered };
      }),
      addToQueue: (song) => set((state) => {
        if (state.queue.some(s => s.id === song.id)) return { queue: state.queue };
        if (state.queue.length === 0) {
          return { queue: [song], currentIndex: 0, isPlaying: true };
        }
        return { queue: [...state.queue, song] };
      }),
      removeFromQueue: (id) => set((state) => {
        const newQueue = state.queue.filter(s => s.id !== id);
        let newIndex = state.currentIndex;
        if (newIndex >= newQueue.length) newIndex = newQueue.length - 1;
        return { queue: newQueue, currentIndex: newIndex };
      }),
      clearQueue: () => set({ queue: [], currentIndex: -1, isPlaying: false }),
      
      setCurrentIndex: (index) => {
        const song = get().queue[index];
        if (song) {
          get().addToHistory(song);
          get().updateTimeCapsule(song);
        }
        set({ currentIndex: index });
      },
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setVolume: (volume) => set({ volume }),
      toggleRepeat: () => set((state) => {
        const modes = ['off', 'all', 'one'];
        return { repeatMode: modes[(modes.indexOf(state.repeatMode) + 1) % modes.length] };
      }),
      toggleShuffle: () => set((state) => ({ shuffleMode: !state.shuffleMode })),
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

      // Playlist Actions
      createPlaylist: (name) => set((state) => ({
        playlists: [{ id: Date.now().toString(), name, songs: [], createdAt: new Date().toISOString() }, ...state.playlists]
      })),
      deletePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== id)
      })),
      addToPlaylist: (playlistId, song) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId && !p.songs.some(s => s.id === song.id)) {
            return { ...p, songs: [song, ...p.songs] };
          }
          return p;
        })
      })),
      removeFromPlaylist: (playlistId, songId) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            return { ...p, songs: p.songs.filter(s => s.id !== songId) };
          }
          return p;
        })
      })),

      // History
      addToHistory: (song) => set((state) => {
        const filtered = state.history.filter(s => s.id !== song.id);
        return { history: [song, ...filtered].slice(0, 50) };
      }),

      // Sleep Timer
      setSleepTimer: (minutes) => {
        if (minutes === 0) {
          set({ sleepTimer: { active: false, minutes: 0, endAt: null } });
        } else {
          const endAt = Date.now() + minutes * 60 * 1000;
          set({ sleepTimer: { active: true, minutes, endAt } });
        }
      },

      // Time Capsule (Daily Aura)
      timeCapsule: {}, // { 'YYYY-MM-DD': [song, song, ...] }

      updateTimeCapsule: (song) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const capsule = { ...state.timeCapsule };
        
        if (!capsule[today]) {
          capsule[today] = [];
        }

        const existingIdx = capsule[today].findIndex(s => s.id === song.id);
        if (existingIdx !== -1) {
          // Move to top and increment internal playCount if we wanted, 
          // but for now just ensure it's in today's list
          const existing = capsule[today][existingIdx];
          capsule[today].splice(existingIdx, 1);
          capsule[today].unshift(existing);
        } else {
          capsule[today].unshift(song);
        }

        // Cleanup: keep only last 10 days
        const dates = Object.keys(capsule).sort().reverse();
        if (dates.length > 10) {
          const newCapsule = {};
          dates.slice(0, 10).forEach(d => {
            newCapsule[d] = capsule[d];
          });
          return { timeCapsule: newCapsule };
        }

        return { timeCapsule: capsule };
      }),

      // User Actions
      toggleLike: (song) => set((state) => {
        const isLiked = state.likedSongs.some(s => s.id === song.id);
        if (!isLiked) get().updateTimeCapsule(song); // Hearts also count for the Aura
        return { likedSongs: isLiked ? state.likedSongs.filter(s => s.id !== song.id) : [song, ...state.likedSongs] };
      }),
      setLanguage: (lang) => set({ language: lang }),
      
      // Selectors
      currentSong: () => {
        const s = get();
        return s.queue[s.currentIndex] || null;
      }
    }),
    {
      name: 'aurabeat-v2-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        likedSongs: state.likedSongs, 
        savedAlbums: state.savedAlbums,
        playlists: state.playlists, 
        history: state.history,
        timeCapsule: state.timeCapsule,
        language: state.language,
        volume: state.volume,
        playbackSpeed: state.playbackSpeed,
        queue: state.queue,
        currentIndex: state.currentIndex,
        repeatMode: state.repeatMode,
        shuffleMode: state.shuffleMode,
        isPlayerOpen: state.isPlayerOpen,
      }),
    }
  )
);
