import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const brands = [
  { name: 'Stanford University', logo: 'Stanford Academic' },
  { name: 'Linear Systems', logo: 'Linear Corp' },
  { name: 'Vercel Platform', logo: 'Vercel, Inc.' },
  { name: 'Stripe Checkout', logo: 'Stripe, Inc.' },
  { name: 'Supabase DB', logo: 'Supabase Co' },
  { name: 'Harvard Labs', logo: 'Harvard Medical' },
];

export const TrustedBy: React.FC = () => {
  return (
    <section className="py-12 border-y border-zinc-200/50 bg-zinc-50/50 dark:border-zinc-800/50 dark:bg-zinc-950/20 select-none overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-8 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          TRUSTED BY RESEARCHERS & TECH LEADERS AT
        </p>

        {/* Brand container */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-16 lg:gap-x-24 opacity-60 dark:opacity-40">
          {brands.map((brand, idx) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="flex items-center gap-1.5"
            >
              {/* Clean abstract monochrome vector representation */}
              <div className="w-5 h-5 rounded bg-zinc-400 dark:bg-zinc-600 flex items-center justify-center text-[10px] text-white font-extrabold font-mono">
                {brand.logo.charAt(0)}
              </div>
              <span className="text-sm font-extrabold tracking-tight text-zinc-600 dark:text-zinc-400 font-mono">
                {brand.logo}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default TrustedBy;
