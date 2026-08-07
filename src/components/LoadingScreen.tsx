import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="relative flex flex-col items-center">
        {/* Animated concentric rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-900 dark:text-zinc-100">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mt-6 text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          Loading Assistant...
        </motion.p>
      </div>
    </div>
  );
};
export default LoadingScreen;
