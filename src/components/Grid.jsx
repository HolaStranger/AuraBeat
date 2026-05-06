import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Grid = ({ title, items, type }) => {
  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-1 h-6 bg-neon-rock rounded-full" />
        <h2 className="text-base font-black text-white uppercase tracking-[0.25em]">{title}</h2>
      </div>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 md:gap-4 -mx-5 px-5 sm:mx-0 sm:px-0 pb-4 sm:pb-0"
      >
        {items.map((item) => (
          <motion.div key={item.id} variants={itemVariants} className="flex-shrink-0 w-32 sm:w-auto">
            <Link
              to={`/${type}/${item.id}`}
              className="group glass rounded-2xl p-3 w-full block cursor-pointer hover:bg-white/[0.07] hover:shadow-neon-purple/20 border border-transparent hover:border-white/10 transition-all duration-300"
            >
              <div className="relative aspect-square mb-3 rounded-xl overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="font-semibold text-sm text-white truncate">{item.name}</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{item.subtitle}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
