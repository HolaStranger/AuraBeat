import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Library } from './pages/Library';
import { Artist } from './pages/Artist';
import { Album } from './pages/Album';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { PlaylistView } from './pages/PlaylistView';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { CassettePlayer } from './components/Player/CassettePlayer';
import { PlayerDetailPanel } from './components/Player/PlayerDetailPanel';
import { PlayerProvider } from './context/PlayerContext';
import { usePlayerStore } from './store/playerStore';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

function App() {
  const { isPlayerOpen } = usePlayerStore();
  const location = useLocation();
  const [leftWidth, setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth] = useState(380);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 1024 && window.innerWidth < 1280);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsTablet(window.innerWidth >= 1024 && window.innerWidth < 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <PlayerProvider>
      <div className="h-screen flex flex-col bg-black overflow-hidden font-sans text-white selection:bg-neon-rock/30 selection:text-white">
        
        {/* Main Workspace */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Left Sidebar (Desktop & Mobile Overlay) */}
          <aside 
            className={clsx(
              "h-full fixed xl:relative z-[120] xl:z-40 bg-[#020205] border-r border-white/[0.02] transition-transform duration-300 ease-in-out",
              (isMobile || isTablet) ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
            )}
            style={{ width: (isMobile || isTablet) ? 280 : leftWidth }}
          >
            {isMobile && isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-6 right-[-50px] p-2 bg-black/50 backdrop-blur-md rounded-full text-white/50"
              >
                <X size={24} />
              </button>
            )}
            <div 
              className="absolute top-0 right-[-2px] bottom-0 w-[4px] cursor-col-resize hover:bg-neon-rock/50 active:bg-neon-rock z-50 transition-colors hidden xl:block"
              onMouseDown={startResizingLeft}
            />
            <div className="w-full h-full overflow-hidden">
              <Sidebar onNavigate={() => isMobile && setIsSidebarOpen(false)} />
            </div>
          </aside>

          {/* Backdrop for mobile sidebar */}
          {isMobile && isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105]"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Center: Scrollable Content */}
          <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-black flex flex-col">
            {/* Header with Hamburger */}
            <header className="h-16 flex items-center px-5 md:px-8 border-b border-white/[0.02] bg-black/50 backdrop-blur-xl sticky top-0 z-50 flex-shrink-0">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="xl:hidden p-2 -ml-2 text-white/50 hover:text-white transition-colors"
              >
                <Menu size={24} />
              </button>
              <div className="ml-auto flex items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hidden sm:block">AuraBeat Personal V2.0</p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
              <div className="max-w-[1400px] mx-auto pb-48 xl:pb-12 px-2">
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/artist/:id" element={<Artist />} />
                  <Route path="/album/:id" element={<Album />} />
                  <Route path="/playlist/:id" element={<PlaylistDetail />} />
                  <Route path="/view/playlist/:id" element={<PlaylistView />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </AnimatePresence>
            </div>
          </div>
        </main>

          {/* Right Panel (Responsive) */}
          <aside 
            className={clsx(
              "fixed xl:relative inset-0 xl:inset-auto h-full z-[100] xl:z-40 bg-black group transition-all duration-300 ease-in-out",
              isPlayerOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full xl:translate-y-0 xl:w-0 overflow-hidden"
            )}
            style={{ 
              width: (isMobile || isTablet) ? (isPlayerOpen ? '100%' : '0') : (isPlayerOpen ? rightWidth : '0'),
              position: (isMobile || isTablet) ? 'fixed' : 'relative',
              left: (isMobile || isTablet) ? 0 : 'auto',
              top: (isMobile || isTablet) ? 0 : 'auto',
            }}
          >
            {(!isMobile && !isTablet) && isPlayerOpen && (
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

        {/* Bottom UI Container (Sticky at bottom) */}
        <div className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col pointer-events-none">
          {/* Bottom Player bar */}
          <div className={clsx(
            "transition-all duration-500 ease-in-out overflow-hidden pointer-events-auto",
            isPlayerOpen ? "h-0 opacity-0" : "h-[80px] md:h-[88px] opacity-100 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
          )}>
            <CassettePlayer />
          </div>

          {/* Bottom Navigation (Mobile Only) */}
          <div className={clsx(
            "pointer-events-auto transition-transform duration-500",
            isPlayerOpen ? "translate-y-full" : "translate-y-0"
          )}>
            <BottomNav />
          </div>
        </div>

      </div>
      </PlayerProvider>
  );
}

export default App;
