import React, { createContext, useContext } from 'react';
import { usePlayer } from '../hooks/usePlayer';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  // Single global instance of the player hook — all components share this
  const player = usePlayer();
  return (
    <PlayerContext.Provider value={player}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayerContext must be used inside PlayerProvider');
  return ctx;
};
