import React from 'react';
import { Link } from 'react-router-dom';

export const Grid = ({ title, items, type }) => {
  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-1 h-6 bg-neon-rock rounded-full" />
        <h2 className="text-base font-black text-white uppercase tracking-[0.25em]">{title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/${type}/${item.id}`}
            className="group glass rounded-2xl p-4 w-full flex-shrink-0 cursor-pointer hover:bg-white/[0.07] hover:shadow-neon-purple transition-all"
          >
            <div className="relative aspect-square mb-3 rounded-xl overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-semibold text-sm text-white truncate">{item.name}</h3>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{item.subtitle}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};
