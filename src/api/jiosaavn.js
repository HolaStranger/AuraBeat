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

// Filter results by language client-side when needed
const filterByLang = (songs, lang) => {
  if (!lang || lang === 'all') return songs;
  return songs.filter(s => s.language?.toLowerCase() === lang.toLowerCase());
};

export const saavnApi = {
  // Search — language param causes 400, so we filter client-side instead
  search: async (query, lang = 'tamil') => {
    try {
      const searchQuery = lang && lang !== 'all' ? `${query} ${lang}` : query;
      const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(searchQuery)}&limit=30`);
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
      const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(`trending ${lang} 2024 2025`)}`);
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
      const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(`new hits ${lang} 2025`)}`);
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
};
