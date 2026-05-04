import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, History } from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Search', path: '/search', icon: Search },
  { name: 'Library', path: '/library', icon: Library },
  { name: 'History', path: '/history', icon: History },
];

export const BottomNav = () => {
  return (
    <nav className="flex xl:hidden items-center justify-around h-20 bg-black/80 backdrop-blur-xl border-t border-white/5 px-4 pb-safe">
      {NAV.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 transition-all duration-200',
              isActive ? 'text-neon-rock' : 'text-white/40'
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
