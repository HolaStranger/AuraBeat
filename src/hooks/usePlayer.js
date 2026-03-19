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
      setProgress(howlRef.current.seek());
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
        html5: false, // Use Web Audio for visualizer support
        format: ['mp3', 'aac', 'mp4'],
        volume: volume,
        rate: playbackSpeed,
        onplay: () => {
          setIsPlaying(true);
          setDuration(howlRef.current.duration());
          rafRef.current = requestAnimationFrame(updateProgress);

          // Connect to Analyser for visualizer
          if (!analyserRef.current) {
            analyserRef.current = Howler.ctx.createAnalyser();
            analyserRef.current.fftSize = 256;
          }
          // Note: masterGain is already connected to ctx.destination
          Howler.masterGain.connect(analyserRef.current);
        },
        onend: () => {
          cancelAnimationFrame(rafRef.current);
          if (repeatMode === 'one') howlRef.current.play();
          else playNext();
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

  // Sync playback speed
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.rate(playbackSpeed);
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

  const seek = (seconds) => {
    if (howlRef.current) {
      howlRef.current.seek(seconds);
      setProgress(seconds);
    }
  };

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
