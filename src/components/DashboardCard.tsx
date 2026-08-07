import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  loading = false,
  trend,
}) => {
  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm flex flex-col gap-4 animate-pulse select-none">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          <div className="w-9 h-9 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-600 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-300 shadow-inner group-hover:bg-zinc-900 group-hover:text-zinc-50 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-950 transition-all duration-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
            {value}
          </span>
          {trend && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              trend.isPositive
                ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                : 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-none">
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
};
export default DashboardCard;
