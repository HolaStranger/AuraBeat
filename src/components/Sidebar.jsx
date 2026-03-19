import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, Disc, Music2, History, Plus, ListMusic, MoreVertical } from 'lucide-react';
import clsx from 'clsx';
import { usePlayerStore } from '../store/playerStore';

const NAV = [
  { name: 'Discover', path: '/', icon: Home },
  { name: 'Search', path: '/search', icon: Search },
  { name: 'History', path: '/history', icon: History },
];

export const Sidebar = () => {
  const { likedSongs, playlists, createPlaylist } = usePlayerStore();
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      createPlaylist(newName.trim());
      setNewName('');
      setShowNewInput(false);
    }
  };

  return (
    <aside className="w-full h-full hidden md:flex flex-col flex-shrink-0 bg-[#020205]">
      {/* Logo */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center shadow-neon-purple">
            <Music2 size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-base text-white leading-none">AuraBeat</p>
            <p className="text-[10px] text-white/30 mt-0.5 font-medium tracking-wider uppercase">Music</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5">
        {NAV.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-white/[0.04] text-white neon-border'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className={isActive ? 'text-neon-rock' : ''}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mx-4 my-5 h-px bg-white/5" />

      {/* Playlists section */}
      <div className="px-3 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between px-3 mb-3">
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Your Collection</p>
          <button 
            onClick={() => setShowNewInput(true)}
            className="p-1 hover:bg-white/5 rounded-md text-white/30 hover:text-white"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Liked Songs */}
        <NavLink
          to="/library"
          className={({ isActive }) => clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1",
            isActive ? "bg-white/10 text-white neon-border" : "text-white/40 hover:text-white/80 hover:bg-white/5"
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-neon-purple">
            <Heart size={14} className="text-white" fill="white" />
          </div>
          <div className="min-w-0">
            <p className={clsx("text-sm font-semibold truncate", likedSongs.length > 0 ? "text-white" : "text-white/40")}>Liked Songs</p>
            <p className="text-white/20 text-[10px]">{likedSongs.length} tracks</p>
          </div>
        </NavLink>

        {/* Create Input */}
        {showNewInput && (
          <form onSubmit={handleCreate} className="px-3 mb-2 animate-in fade-in slide-in-from-top-1">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onBlur={() => !newName && setShowNewInput(false)}
              placeholder="New Playlist..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-neon-purple/50"
            />
          </form>
        )}

        {/* Playlist List */}
        <div className="space-y-1">
          {playlists.map((pl) => (
            <NavLink
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive ? "bg-white/[0.04] text-white neon-border" : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
              )}
            >
              <div className="w-9 h-9 rounded-lg glass flex items-center justify-center flex-shrink-0">
                <ListMusic size={16} className="text-white/40" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-white/80">{pl.name}</p>
                <p className="text-white/20 text-[10px]">{pl.songs.length} tracks</p>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-4">
        <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Disc size={14} className="text-neon-purple animate-spin-slow flex-shrink-0" />
          <p className="text-[10px] text-white/30 truncate uppercase tracking-tighter">
            Personal Use V2.0
          </p>
        </div>
      </div>
    </aside>
  );
};
