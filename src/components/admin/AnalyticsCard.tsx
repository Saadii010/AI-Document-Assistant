import React from 'react';
import { motion } from 'motion/react';

interface AnalyticsCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  colorClass?: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  id,
  title,
  value,
  subtitle,
  trend,
  icon,
  colorClass = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
}) => {
  return (
    <motion.div
      id={id}
      whileHover={{ y: -4, scale: 1.01 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-950 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-start justify-between relative overflow-hidden group"
    >
      <div className="space-y-3">
        <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            {value}
          </h3>
          {trend && (
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.isPositive ? '+' : '-'}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${colorClass} transition-colors duration-300`}>
        {icon}
      </div>

      {/* Decorative subtle ambient backdrop reflection */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-zinc-400/5 dark:bg-zinc-800/5 rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};
