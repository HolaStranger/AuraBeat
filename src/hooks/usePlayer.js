import { useEffect, useRef, useState, useCallback } from 'react';
import { Howl } from 'howler';
import { usePlayerStore } from '../store/playerStore';
import { saavnApi } from '../api/jiosaavn';

export const usePlayer = () => {
  const {
    queue,
    currentIndex,
    isPlaying,
    volume,
    repeatMode,
    shuffleMode,
    playbackSpeed,
    setIsPlaying,
    setCurrentIndex,
    currentSong,
  } = usePlayerStore();

  const howlRef = useRef(null);
  const analyserRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const rafRef = useRef(null);

  const song = currentSong();

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    let nextIndex = currentIndex;
    if (shuffleMode) {
      if (queue.length > 1) {
        do { nextIndex = Math.floor(Math.random() * queue.length); } while (nextIndex === currentIndex);
      }
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') nextIndex = 0;
        else { setIsPlaying(false); return; }
      }
    }
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
  }, [currentIndex, queue.length, repeatMode, shuffleMode, setCurrentIndex, setIsPlaying]);

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;
    if (howlRef.current && howlRef.current.seek() > 3) {
      howlRef.current.seek(0);
      return;
    }
    const prevIndex = currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setIsPlaying(true);
  }, [currentIndex, queue.length, setCurrentIndex, setIsPlaying]);

  const updateProgress = useCallback(() => {
    if (howlRef.current && howlRef.current.playing()) {
      const currentPos = howlRef.current.seek();
      setProgress(currentPos);
      
      // Update duration if it's missing (sometimes duration() is 0 right at start)
      const d = howlRef.current.duration();
      if (d > 0) setDuration(d);
      
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  // Load new song when song.id changes
  useEffect(() => {
    if (!song) {
      if (howlRef.current) { howlRef.current.unload(); howlRef.current = null; }
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const initAudio = async () => {
      if (howlRef.current) howlRef.current.unload();
      cancelAnimationFrame(rafRef.current);
      setProgress(0);

      // Use the stream URL already stored in the song object.
      // Only call getSongDetails as a fallback if URL is somehow missing.
      let url = song.url;
      if (!url) {
        const freshSong = await saavnApi.getSongDetails(song.id);
        url = freshSong?.url;
      }
      if (!url) { playNext(); return; }

      howlRef.current = new Howl({
        src: [url],
        html5: true, // html5 mode lets us access the audio element for pitch preservation
        format: ['mp3', 'aac', 'mp4'],
        volume: volume,
        rate: playbackSpeed,
        onplay: () => {
          setIsPlaying(true);
          setDuration(howlRef.current.duration());
          rafRef.current = requestAnimationFrame(updateProgress);

          // Preserve pitch when changing playback rate (so voice doesn't chipmunk)
          try {
            const audioEl = howlRef.current?._sounds?.[0]?._node;
            if (audioEl) {
              audioEl.preservesPitch = true;
              audioEl.mozPreservesPitch = true; // Firefox fallback
              audioEl.webkitPreservesPitch = true; // Safari fallback
              audioEl.playbackRate = playbackSpeed;
            }
          } catch (e) { /* not critical */ }

          // Connect to Analyser for visualizer (best-effort for html5 mode)
          try {
            if (Howler.ctx && !analyserRef.current) {
              analyserRef.current = Howler.ctx.createAnalyser();
              analyserRef.current.fftSize = 256;
            }
            if (Howler.masterGain && analyserRef.current) {
              Howler.masterGain.connect(analyserRef.current);
            }
          } catch (e) { /* visualizer optional */ }
        },
        onend: async () => {
          cancelAnimationFrame(rafRef.current);
          if (repeatMode === 'one') {
            howlRef.current.play();
          } else if (currentIndex < queue.length - 1) {
            playNext();
          } else {
            // Radio Mode: If queue ends, fetch similar songs and keep playing
            try {
              const similarSongs = await saavnApi.getSimilarSongs(song.id);
              if (similarSongs.length > 0) {
                const { setQueue, setCurrentIndex } = usePlayerStore.getState();
                setQueue([...queue, ...similarSongs]);
                setCurrentIndex(currentIndex + 1);
                setIsPlaying(true);
              } else {
                setIsPlaying(false);
              }
            } catch (e) {
              setIsPlaying(false);
            }
          }
        },
        onloaderror: () => { setIsPlaying(false); },
        onplayerror: (id, error) => {
          console.error("Play error:", error);
          howlRef.current.once('unlock', () => howlRef.current.play());
        }
      });

      if (isPlaying) howlRef.current.play();
    };

    initAudio();

    return () => {
      if (howlRef.current) howlRef.current.unload();
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id]);

  // Sync volume
  useEffect(() => {
    if (howlRef.current) howlRef.current.volume(volume);
  }, [volume]);

  // Sync play/pause
  useEffect(() => {
    if (!howlRef.current) return;
    if (isPlaying && !howlRef.current.playing()) {
      howlRef.current.play();
      rafRef.current = requestAnimationFrame(updateProgress);
    } else if (!isPlaying && howlRef.current.playing()) {
      howlRef.current.pause();
      cancelAnimationFrame(rafRef.current);
    }
  }, [isPlaying, updateProgress]);

  // Sync playback speed — preserve pitch so voice doesn't change
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.rate(playbackSpeed);
      // Also set preservesPitch directly on the HTML5 audio element
      try {
        const audioEl = howlRef.current?._sounds?.[0]?._node;
        if (audioEl) {
          audioEl.preservesPitch = true;
          audioEl.mozPreservesPitch = true;
          audioEl.webkitPreservesPitch = true;
          audioEl.playbackRate = playbackSpeed;
        }
      } catch (e) { /* not critical */ }
    }
  }, [playbackSpeed]);

  // Sleep Timer Check
  const { sleepTimer, setSleepTimer } = usePlayerStore();
  useEffect(() => {
    if (!sleepTimer.active || !sleepTimer.endAt) return;

    const timer = setInterval(() => {
      if (Date.now() >= sleepTimer.endAt) {
        setIsPlaying(false);
        setSleepTimer(0); // Deactivate
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimer.active, sleepTimer.endAt, setIsPlaying, setSleepTimer]);

  const seek = useCallback((seconds) => {
    if (howlRef.current) {
      howlRef.current.seek(seconds);
      setProgress(seconds);
    }
  }, []);

  // Media Session API for native controls
  useEffect(() => {
    if (!song || !('mediaSession' in navigator)) return;

    // The song object from the store uses 'title' and 'artist'
    const metadata = {
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork: [
        // It's good practice to provide multiple sizes
        { src: song.image, sizes: '96x96', type: 'image/jpeg' },
        { src: song.image, sizes: '128x128', type: 'image/jpeg' },
        { src: song.image, sizes: '192x192', type: 'image/jpeg' },
        { src: song.image, sizes: '256x256', type: 'image/jpeg' },
        { src: song.image, sizes: '384x384', type: 'image/jpeg' },
        { src: song.image, sizes: '512x512', type: 'image/jpeg' },
      ]
    };

    navigator.mediaSession.metadata = new MediaMetadata(metadata);
    
    // Set playback state for the OS
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    const actionHandlers = [
      ['play', () => setIsPlaying(true)],
      ['pause', () => setIsPlaying(false)],
      ['previoustrack', playPrevious],
      ['nexttrack', playNext],
      ['seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        if(howlRef.current) seek(howlRef.current.seek() - skipTime);
      }],
      ['seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        if(howlRef.current) seek(howlRef.current.seek() + skipTime);
      }]
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.warn(`The media session action '${action}' is not supported.`);
      }
    }
  // We need to re-run this effect when the song or play state changes.
  // The functions from the hook are memoized with useCallback, so they are safe dependencies.
  }, [song, isPlaying, playNext, playPrevious, seek, setIsPlaying]);

  const togglePlayPause = () => setIsPlaying(!isPlaying);

  return { 
    progress, 
    duration, 
    seek, 
    togglePlayPause, 
    playNext, 
    playPrevious,
    analyser: analyserRef.current 
  };
};
