import React from 'react';

export const SongCardSkeleton = () => {
  return (
    <div className="group flex flex-col gap-2 animate-pulse">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-700"></div>
      <div className="flex flex-col gap-2">
        <div className="h-4 w-3/4 rounded bg-gray-700"></div>
        <div className="h-3 w-1/2 rounded bg-gray-700"></div>
      </div>
    </div>
  );
};
