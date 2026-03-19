import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import clsx from 'clsx';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Library } from './pages/Library';
import { Artist } from './pages/Artist';
import { Album } from './pages/Album';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { CassettePlayer } from './components/Player/CassettePlayer';
import { PlayerDetailPanel } from './components/Player/PlayerDetailPanel';
import { PlayerProvider } from './context/PlayerContext';
import { usePlayerStore } from './store/playerStore';

function App() {
  const { isPlayerOpen } = usePlayerStore();
  const [leftWidth, setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth] = useState(380);

  const startResizingLeft = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;
    const onMouseMove = (moveEvent) => setLeftWidth(Math.max(200, Math.min(400, startWidth + moveEvent.clientX - startX)));
    const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [leftWidth]);

  const startResizingRight = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;
    const onMouseMove = (moveEvent) => setRightWidth(Math.max(300, Math.min(600, startWidth - (moveEvent.clientX - startX))));
    const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [rightWidth]);

  return (
    <BrowserRouter>
      <PlayerProvider>
      <div className="h-screen flex flex-col bg-black overflow-hidden font-sans text-white selection:bg-neon-rock/30 selection:text-white">
        
        {/* Main Workspace: Navigation | Content | Detail Panel */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Left Sidebar (Navigation) */}
          <div 
            className="h-full flex-shrink-0 relative group border-r border-white-[0.02]"
            style={{ width: leftWidth }}
          >
            {/* Grab handle */}
            <div 
              className="absolute top-0 right-[-2px] bottom-0 w-[4px] cursor-col-resize hover:bg-neon-rock/50 active:bg-neon-rock z-50 transition-colors"
              onMouseDown={startResizingLeft}
            />
            <div className="w-full h-full overflow-hidden">
              <Sidebar />
            </div>
          </div>

          {/* Center: Scrollable Content */}
          <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-black">
            <div className="max-w-[1400px] mx-auto pb-12">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/artist/:id" element={<Artist />} />
                <Route path="/album/:id" element={<Album />} />
                <Route path="/playlist/:id" element={<PlaylistDetail />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>

          {/* Right: Immersive Detail Panel (Toggleable & Resizable) */}
          <aside 
            className={clsx(
              "h-full relative flex-shrink-0 z-40 bg-black group",
              isPlayerOpen ? "opacity-100 border-l border-white/5" : "opacity-0 border-l-0 overflow-hidden"
            )}
            style={{ 
              width: isPlayerOpen ? rightWidth : 0,
              transition: 'opacity 0.3s ease-out'
            }}
          >
            {isPlayerOpen && (
              <div 
                className="absolute top-0 left-[-2px] bottom-0 w-[4px] cursor-col-resize hover:bg-neon-rock/50 active:bg-neon-rock z-50 transition-colors"
                onMouseDown={startResizingRight}
              />
            )}
            <div className="w-full h-full overflow-hidden">
              <PlayerDetailPanel />
            </div>
          </aside>

        </div>

        {/* Bottom: Classic Rectangle Player bar (Hidden when Detail Panel is open) */}
        <div className={clsx(
          "relative z-50 transition-all duration-500 ease-in-out overflow-hidden flex-shrink-0",
          isPlayerOpen ? "h-0 opacity-0" : "h-[88px] opacity-100 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
        )}>
          <CassettePlayer />
        </div>

      </div>
      </PlayerProvider>
    </BrowserRouter>
  );
}

export default App;
