// Relative proxy paths in DEV, full public URLs in production.
// This allows the app to work both locally (with proxy) and after deployment.
const API_ENDPOINTS = import.meta.env.DEV 
  ? ['/jio1', '/jio2', '/jio3', '/jio4']
  : [
      'https://jiosaavn-api-2.vercel.app',
      'https://jiosaavn-api-beta-one.vercel.app',
      'https://jioapi-v3.vercel.app',
      'https://saavn.me'
    ];

let currentEndpointIndex = 0;

const fetchWithFallback = async (path) => {
  let lastError = null;
  for (let i = 0; i < API_ENDPOINTS.length; i++) {
    const idx = (currentEndpointIndex + i) % API_ENDPOINTS.length;
    const url = `${API_ENDPOINTS[idx]}${path}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        currentEndpointIndex = idx;
        return res;
      }
      if (res.status === 402 || res.status === 403 || res.status === 429) {
        console.warn(`Endpoint ${API_ENDPOINTS[idx]} status ${res.status}, trying next...`);
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      console.warn(`Endpoint ${API_ENDPOINTS[idx]} failed:`, err.message);
    }
  }
  throw lastError || new Error('All API endpoints failed');
};

// Helper: Extract results from different API versions (v2/v3/v4)
const getResults = (data) => {
  if (!data) return [];
  // v3/v4 format: data.data.results
  if (data.data?.results) return data.data.results;
  // v2 format: data.results
  if (data.results) return data.results;
  // Direct array (some endpoints)
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

// Helper: Extract single item from different API versions
const getSingleItem = (data) => {
  if (!data) return null;
  if (data.data && !Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.data)) return data.data[0];
  if (data.results && Array.isArray(data.results)) return data.results[0];
  return data;
};

// Helper: decode HTML entities
const decodeHtml = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
};

// Helper: extract highest quality stream URL and image
const formatSong = (song) => {
  if (!song) return null;

  // v4 uses 'url', v3 uses 'link'
  const streamUrl =
    song.downloadUrl?.find(d => d.quality === '320kbps')?.url ||
    song.downloadUrl?.find(d => d.quality === '320kbps')?.link ||
    song.downloadUrl?.find(d => d.quality === '160kbps')?.url ||
    song.downloadUrl?.find(d => d.quality === '160kbps')?.link ||
    song.downloadUrl?.[song.downloadUrl.length - 1]?.url ||
    song.downloadUrl?.[song.downloadUrl.length - 1]?.link ||
    song.media_url || song.url;

  const image =
    song.image?.find(i => i.quality === '500x500')?.url ||
    song.image?.find(i => i.quality === '500x500')?.link ||
    song.image?.[song.image.length - 1]?.url ||
    song.image?.[song.image.length - 1]?.link ||
    (typeof song.image === 'string' ? song.image : null);

  if (!streamUrl) return null;

  // Extract artist name robustly
  let artistName = '';
  if (song.artists?.primary) {
    artistName = song.artists.primary.map(a => a.name).join(', ');
  } else if (Array.isArray(song.primaryArtists)) {
    artistName = song.primaryArtists.map(a => typeof a === 'object' ? a.name : a).join(', ');
  } else {
    artistName = song.primaryArtists || song.artist || 'Unknown Artist';
  }

  return {
    id: song.id,
    title: decodeHtml(song.name || song.title),
    artist: decodeHtml(artistName),
    artistId: song.artists?.primary?.[0]?.id || song.primaryArtistsId || song.artistId,
    album: decodeHtml(song.album?.name || song.album || ''),
    albumId: song.album?.id || song.albumid,
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
    playlist.image?.find(i => i.quality === '500x500')?.url ||
    playlist.image?.find(i => i.quality === '500x500')?.link ||
    playlist.image?.[playlist.image.length - 1]?.url ||
    playlist.image?.[playlist.image.length - 1]?.link ||
    (typeof playlist.image === 'string' ? playlist.image : null);

  // JioSaavn search results use 'title' but playlist detail uses 'name'
  const name = decodeHtml(playlist.listname || playlist.title || playlist.name);
  const id = playlist.listid || playlist.id;

  if (!id || !name) return null;

  return {
    id,
    name,
    subtitle: decodeHtml(playlist.subtitle || playlist.more_info?.firstname || playlist.firstname || ''),
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
      const res = await fetchWithFallback(`/search/playlists?query=${encodeURIComponent(`${query} ${lang}`)}&limit=100`);
      const data = await res.json();
      return getResults(data).map(formatPlaylist).filter(Boolean);
    } catch (err) {
      console.error('Search playlists error:', err);
      return [];
    }
  },

  search: async (query, lang = 'tamil') => {
    try {
      const trimmedQuery = query.trim();
      const res = await fetchWithFallback(`/search/songs?query=${encodeURIComponent(trimmedQuery)}&limit=100`);
      const data = await res.json();
      const songs = getResults(data).map(formatSong).filter(Boolean);
      
      const filtered = filterByLang(songs, lang);
      
      return filtered.length > 0 ? filtered : songs;
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  },

  searchAlbums: async (query, lang = 'tamil') => {
    try {
      const trimmedQuery = query.trim();
      const res = await fetchWithFallback(`/search/albums?query=${encodeURIComponent(trimmedQuery)}&limit=100`);
      const data = await res.json();
      const results = getResults(data);
      const albums = results.map(album => {
        let artistName = '';
        if (album.artists?.primary) {
          artistName = album.artists.primary.map(a => a.name).join(', ');
        } else if (Array.isArray(album.primaryArtists)) {
          artistName = album.primaryArtists.map(a => typeof a === 'object' ? a.name : a).join(', ');
        } else {
          artistName = album.primaryArtists || album.artist || 'Unknown Artist';
        }

        const image =
          album.image?.find(i => i.quality === '500x500')?.url ||
          album.image?.find(i => i.quality === '500x500')?.link ||
          album.image?.[album.image.length - 1]?.url ||
          album.image?.[album.image.length - 1]?.link ||
          (typeof album.image === 'string' ? album.image : '');

        return {
          id: album.id,
          title: decodeHtml(album.name || album.title),
          artist: decodeHtml(artistName),
          image,
          type: 'album',
          year: album.year,
          language: album.language
        };
      });

      const filtered = lang === 'all' ? albums : albums.filter(a => a.language?.toLowerCase() === lang.toLowerCase());
      return filtered.length > 0 ? filtered : albums;
    } catch (err) {
      console.error('Album search error:', err);
      return [];
    }
  },

  getTrending: async (lang = 'tamil') => {
    try {
      const res = await fetchWithFallback(`/search/songs?query=${encodeURIComponent(`trending ${lang} 2024 2025`)}&limit=100`);
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
      const res = await fetchWithFallback(`/search/songs?query=${encodeURIComponent(`new hits ${lang} 2025`)}&limit=100`);
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
      const res = await fetchWithFallback(`/songs?ids=${encodeURIComponent(id)}`);
      const data = await res.json();
      const raw = Array.isArray(data.data) ? data.data[0] : data.data;
      return formatSong(raw);
    } catch (err) {
      console.error('Song details error:', err);
      return null;
    }
  },

  getArtistDetails: async (id) => {
    try {
      const res = await fetchWithFallback(`/artists?id=${encodeURIComponent(id)}&limit=100`);
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
      const res = await fetchWithFallback(`/albums?id=${encodeURIComponent(id)}&limit=100`);
      const data = await res.json();
      const album = data.data;

      if (!album) return null;

      const image =
        album.image?.find(i => i.quality === '500x500')?.url ||
        album.image?.find(i => i.quality === '500x500')?.link ||
        album.image?.[album.image.length - 1]?.url ||
        album.image?.[album.image.length - 1]?.link ||
        (typeof album.image === 'string' ? album.image : null);

      return {
        ...album,
        image,
        songs: (album.songs || []).map(formatSong).filter(Boolean)
      };
    } catch (err) {
      console.error('Album details error:', err);
      return null;
    }
  },

  getPlaylistDetails: async (id) => {
    const paths = [
      `/playlists?id=${encodeURIComponent(id)}&limit=100`,
      `/playlist?id=${encodeURIComponent(id)}&limit=100`,
    ];

    for (const path of paths) {
      try {
        const res = await fetchWithFallback(path);
        const data = await res.json();
        const playlist = data.data;

        if (playlist) {
          const image =
            playlist.image?.find(i => i.quality === '500x500')?.url ||
            playlist.image?.find(i => i.quality === '500x500')?.link ||
            playlist.image?.[playlist.image.length - 1]?.url ||
            playlist.image?.[playlist.image.length - 1]?.link ||
            (typeof playlist.image === 'string' ? playlist.image : null);

          return {
            ...playlist,
            name: decodeHtml(playlist.listname || playlist.name || playlist.title),
            image,
            songs: (playlist.songs || []).map(formatSong).filter(Boolean)
          };
        }
      } catch (err) {
        continue;
      }
    }
    return null;
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
      const res = await fetchWithFallback(`/search/songs?query=${encodeURIComponent(`trending hits ${lang} 2025`)}&limit=10`);
      const data = await res.json();
      return (data.data?.results || []).map(formatSong).filter(Boolean).slice(0, 8);
    } catch (err) {
      return [];
    }
  },

  getLyrics: async (id) => {
    const paths = [
      `/songs/${id}/lyrics`,
      `/songs/lyrics?ids=${id}`,
      `/lyrics?ids=${id}`
    ];

    for (const path of paths) {
      try {
        const res = await fetchWithFallback(path);
        const data = await res.json();
        if (data.data?.lyrics) return data.data.lyrics;
        if (data.data && typeof data.data === 'string') return data.data;
      } catch (e) { continue; }
    }
    return null;
  },

  getSimilarSongs: async (id) => {
    try {
      const song = await saavnApi.getSongDetails(id);
      if (!song) return [];

      const lang = song.language || 'tamil';
      const artist = song.artist?.split(',')[0].trim();

      // Fetch a wide pool from different sources
      const [suggestionsRes, artistSongs, topHits] = await Promise.all([
        // Source 1: Direct API suggestions
        fetchWithFallback(`/songs/${id}/suggestions`).catch(() => null),
        // Source 2: More from the same artist
        artist ? saavnApi.search(artist, lang) : Promise.resolve([]),
        // Source 3: General top hits in the language
        saavnApi.search(`top ${lang} hits`, lang)
      ]);

      const suggestionsData = suggestionsRes ? await suggestionsRes.json() : { data: [] };
      const suggestions = suggestionsData.data || [];

      const formattedSuggestions = (Array.isArray(suggestions) ? suggestions : []).map(formatSong).filter(Boolean);
      const songs = [...formattedSuggestions, ...artistSongs, ...topHits];

      // De-duplicate by ID and filter current song
      const uniquePool = [];
      const seenIds = new Set([id]);
      const seenTitles = new Set([song.title.toLowerCase().split('(')[0].trim()]);

      for (const s of songs) {
        const titleClean = s.title.toLowerCase().split('(')[0].trim();
        if (!seenIds.has(s.id) && !seenTitles.has(titleClean)) {
          uniquePool.push(s);
          seenIds.add(s.id);
          seenTitles.add(titleClean);
        }
      }

      // Shuffle the entire pool for randomness
      for (let i = uniquePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniquePool[i], uniquePool[j]] = [uniquePool[j], uniquePool[i]];
      }

      return uniquePool.slice(0, 15);
    } catch (e) {
      console.error('Queue generation failed:', e);
      return [];
    }
  },
};
