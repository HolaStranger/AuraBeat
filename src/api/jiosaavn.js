const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://jiosaavn-api-privatecvc2.vercel.app';

// Helper: decode HTML entities
const decodeHtml = (str) => {
  if (!str) return str;
  return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
};

// Helper: extract highest quality stream URL and image
const formatSong = (song) => {
  if (!song) return null;

  // This API uses 'link' not 'url' for download URLs
  const streamUrl =
    song.downloadUrl?.find(d => d.quality === '320kbps')?.link ||
    song.downloadUrl?.find(d => d.quality === '160kbps')?.link ||
    song.downloadUrl?.[song.downloadUrl.length - 1]?.link;

  const image =
    song.image?.find(i => i.quality === '500x500')?.link ||
    song.image?.[song.image.length - 1]?.link;

  if (!streamUrl) return null;

  return {
    id: song.id,
    title: decodeHtml(song.name),
    artist: decodeHtml(song.primaryArtists),
    artistId: song.primaryArtistsId || song.artistId, // Handle both formats
    album: decodeHtml(song.album?.name),
    albumId: song.album?.id,
    image,
    url: streamUrl,
    duration: Number(song.duration) || 0,
    year: song.year,
    language: song.language,
  };
};

const formatPlaylist = (playlist) => {
  if (!playlist) return null;

  const image =
    playlist.image?.find(i => i.quality === '500x500')?.link ||
    playlist.image?.[playlist.image.length - 1]?.link ||
    (typeof playlist.image === 'string' ? playlist.image : null);

  // JioSaavn search results use 'title' but playlist detail uses 'name'
  const name = decodeHtml(playlist.listname || playlist.title || playlist.name);
  const id = playlist.listid || playlist.id;

  if (!id || !name) return null;

  return {
    id,
    name,
    subtitle: decodeHtml(playlist.subtitle || playlist.more_info?.firstname || ''),
    image,
  };
};

// Filter results by language client-side when needed
const filterByLang = (songs, lang) => {
  if (!lang || lang === 'all') return songs;
  return songs.filter(s => s.language?.toLowerCase() === lang.toLowerCase());
};

export const saavnApi = {
  searchPlaylists: async (query, lang = 'tamil') => {
    try {
      const searchQuery = lang && lang !== 'all' ? `${query} ${lang}` : query;
      const res = await fetch(`${API_BASE}/search/playlists?query=${encodeURIComponent(searchQuery)}&limit=20`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      return (data.data?.results || []).map(formatPlaylist).filter(Boolean);
    } catch (err) {
      console.error('Search playlists error:', err);
      return [];
    }
  },

  // Search — language param causes 400, so we filter client-side instead
  search: async (query, lang = 'tamil') => {
    try {
      const searchQuery = lang && lang !== 'all' ? `${query} ${lang}` : query;
      const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(searchQuery)}&limit=50`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const songs = (data.data?.results || []).map(formatSong).filter(Boolean);
      // Soft-filter: prefer language match but fall back to all results if too few
      const filtered = filterByLang(songs, lang);
      return filtered.length >= 3 ? filtered : songs;
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  },

  getTrending: async (lang = 'tamil') => {
    try {
      const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(`trending ${lang} 2024 2025`)}&limit=50`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const songs = (data.data?.results || []).map(formatSong).filter(Boolean);
      const filtered = filterByLang(songs, lang);
      return filtered.length >= 3 ? filtered : songs;
    } catch (err) {
      console.error('Trending error:', err);
      return [];
    }
  },

  getNewReleases: async (lang = 'tamil') => {
    try {
      const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(`new hits ${lang} 2025`)}&limit=50`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const songs = (data.data?.results || []).map(formatSong).filter(Boolean);
      const filtered = filterByLang(songs, lang);
      return filtered.length >= 3 ? filtered : songs;
    } catch (err) {
      console.error('New releases error:', err);
      return [];
    }
  },

  // Fetch fresh stream URL — stream URLs expire in ~30 min
  getSongDetails: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/songs?id=${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      // API returns { data: [song] } or { data: song }
      const raw = Array.isArray(data.data) ? data.data[0] : data.data;
      return formatSong(raw);
    } catch (err) {
      console.error('Song details error:', err);
      return null;
    }
  },

  getArtistDetails: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/artists?id=${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        ...data.data,
        topSongs: (data.data.topSongs || []).map(formatSong).filter(Boolean),
        topAlbums: data.data.topAlbums || []
      };
    } catch (err) {
      console.error('Artist details error:', err);
      return null;
    }
  },

  getAlbumDetails: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/albums?id=${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        ...data.data,
        songs: (data.data.songs || []).map(formatSong).filter(Boolean)
      };
    } catch (err) {
      console.error('Album details error:', err);
      return null;
    }
  },

  getPlaylistDetails: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/playlists?id=${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.data) return null;
      return {
        ...data.data,
        name: decodeHtml(data.data.listname || data.data.name || data.data.title),
        image: data.data.image?.find(i => i.quality === '500x500')?.link ||
               data.data.image?.[data.data.image?.length - 1]?.link ||
               data.data.image,
        songs: (data.data.songs || []).map(formatSong).filter(Boolean)
      };
    } catch (err) {
      console.error('Playlist details error:', err);
      return null;
    }
  },

  getAlbums: async (albumIds) => {
    try {
      const albums = await Promise.all(albumIds.map(id => saavnApi.getAlbumDetails(id)));
      return albums.filter(Boolean);
    } catch (err) {
      console.error('Albums error:', err);
      return [];
    }
  },

  // Get search suggestions / trending terms for the search page
  getSuggestions: async (lang = 'tamil') => {
    try {
      const queries = [
        `trending hits ${lang} 2025`,
        `best of ${lang}`,
        `top ${lang} songs`,
      ];
      const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(queries[0])}&limit=10`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data?.results || []).map(formatSong).filter(Boolean).slice(0, 8);
    } catch (err) {
      return [];
    }
  },

  getLyrics: async (id) => {
    const endpoints = [
      `${API_BASE}/songs/${id}/lyrics`,
      `${API_BASE}/songs/lyrics?id=${id}`,
      `${API_BASE}/lyrics?id=${id}`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.data?.lyrics) return data.data.lyrics;
          if (data.data && typeof data.data === 'string') return data.data;
        }
      } catch (e) { continue; }
    }
    
    // Fallback: check song details and different ID formats
    try {
      const endpoints = [
        `${API_BASE}/songs?id=${id}`,
        `${API_BASE}/songs/details?id=${id}`,
        `${API_BASE}/song?id=${id}`
      ];
      for (const url of endpoints) {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const raw = Array.isArray(data.data) ? data.data[0] : data.data;
          if (raw?.lyrics) return raw.lyrics;
        }
      }
    } catch (e) {}

    return null;
  },

  getSimilarSongs: async (id) => {
    const endpoints = [
      `${API_BASE}/songs/${id}/suggestions`,
      `${API_BASE}/songs/${id}/recommendations`,
      `${API_BASE}/songs/suggestions?id=${id}`,
      `${API_BASE}/recommendations/songs?id=${id}`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const results = data.data?.results || data.data || [];
          if (Array.isArray(results) && results.length > 0) {
            return results.map(formatSong).filter(Boolean);
          }
        }
      } catch (e) { console.warn('Endpoint failed:', url); }
    }

    // Hyper-Fallback: If everything 404s, search for the song title + language
    try {
      console.log('API Suggestions failed. Engaging Hyper-Fallback...');
      const song = await saavnApi.getSongDetails(id);
      if (song) {
        // Try searching for the song's own name to find related versions/covers
        const searchResults = await saavnApi.search(song.title, song.language || 'all');
        if (searchResults.length > 1) return searchResults.filter(s => s.id !== id);
        
        // If that's too narrow, search for top hits in the same language
        if (song.language) {
          console.log(`Searching for top ${song.language} hits...`);
          return await saavnApi.search(`top ${song.language} hits`, song.language);
        }
      }
    } catch (e) { console.error('Hyper-Fallback failed:', e); }
    
    return [];
  },
};
