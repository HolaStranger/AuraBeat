import { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';

export const useKeyboardControls = (togglePlayPause, playNext, playPrevious) => {
  const { volume, setVolume, likedSongs, toggleLike, currentSong } = usePlayerStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if the user is typing in an input field (like Search)
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          playNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          playPrevious();
          break;
        case 'KeyM':
          e.preventDefault();
          setVolume(volume === 0 ? 0.7 : 0);
          break;
        case 'KeyL':
          const song = currentSong();
          if (song) toggleLike(song);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, playNext, playPrevious, volume, setVolume, toggleLike, currentSong]);
};
