import React from 'react';
import clsx from 'clsx';
import { usePlayerStore } from '../../store/playerStore';

export const Reels = () => {
  const { isPlaying } = usePlayerStore();

  return (
    <div className="flex gap-16 md:gap-24 items-center justify-center pointer-events-none">
      {/* Left Reel */}
      <div className={clsx("tape-spool", isPlaying && "animate-spin-slow")}>
        <div className="w-10 h-10 rounded-full border border-retro-text/30 flex items-center justify-center">
            {/* Spokes */}
            <div className="absolute w-1 h-10 bg-retro-bg shadow-[0_0_2px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute w-1 h-10 bg-retro-bg rotate-60 shadow-[0_0_2px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute w-1 h-10 bg-retro-bg -rotate-60 shadow-[0_0_2px_rgba(0,0,0,0.5)]"></div>
            <div className="tape-hole relative z-10 w-4 h-4 shadow-inner"></div>
        </div>
      </div>

      {/* Right Reel */}
      <div className={clsx("tape-spool", isPlaying && "animate-spin-slow")}>
        <div className="w-10 h-10 rounded-full border border-retro-text/30 flex items-center justify-center">
            <div className="absolute w-1 h-10 bg-retro-bg shadow-[0_0_2px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute w-1 h-10 bg-retro-bg rotate-60 shadow-[0_0_2px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute w-1 h-10 bg-retro-bg -rotate-60 shadow-[0_0_2px_rgba(0,0,0,0.5)]"></div>
            <div className="tape-hole relative z-10 w-4 h-4 shadow-inner"></div>
        </div>
      </div>
    </div>
  );
};
