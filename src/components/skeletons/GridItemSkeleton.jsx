import React from 'react';

export const GridItemSkeleton = () => {
  return (
    <div className="group glass rounded-2xl p-4 w-full flex-shrink-0 animate-pulse">
      <div className="relative aspect-square mb-3 rounded-xl overflow-hidden bg-gray-700"></div>
      <div className="h-4 w-3/4 rounded bg-gray-700 mb-2"></div>
      <div className="h-3 w-1/2 rounded bg-gray-700"></div>
    </div>
  );
};
