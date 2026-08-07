import React from 'react';
import { HardDrive, File, Database, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { StorageStatsResponse } from '../../services/documentApi';

interface StorageCardProps {
  stats: StorageStatsResponse | null;
  loading: boolean;
}

export const StorageCard: React.FC<StorageCardProps> = ({ stats, loading }) => {
  const formatSize = (bytes: number) => {
    if (bytes === 0 || !bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getPercentUsed = () => {
    if (!stats) return 0;
    return Math.min(100, Math.round((stats.totalStorageUsed / stats.maxStorage) * 100));
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-950/40 animate-pulse flex flex-col gap-4">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-900 rounded" />
        <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-900 rounded" />
        <div className="h-2 w-full bg-zinc-150 dark:bg-zinc-900 rounded-full" />
      </div>
    );
  }

  const percentUsed = getPercentUsed();
  const totalUsedStr = formatSize(stats?.totalStorageUsed || 0);
  const maxStorageStr = formatSize(stats?.maxStorage || 1024 * 1024 * 1024);
  const remainingStr = formatSize(stats?.remainingStorage || 1024 * 1024 * 1024);
  const avgSizeStr = formatSize(stats?.averageFileSize || 0);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Visual Analytics Card */}
      <div className="p-6 rounded-2xl border border-zinc-150 bg-white dark:border-zinc-900 dark:bg-zinc-950/30 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Storage Usage
            </span>
          </div>
          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-bold">
            Free Tier Plan
          </span>
        </div>

        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            {totalUsedStr}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            used of {maxStorageStr} (1 GB)
          </span>
        </div>

        {/* Custom Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentUsed}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                percentUsed > 85
                  ? 'bg-red-500'
                  : percentUsed > 50
                  ? 'bg-amber-500'
                  : 'bg-zinc-950 dark:bg-zinc-50'
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
            <span>{percentUsed}% Used</span>
            <span>{remainingStr} Available</span>
          </div>
        </div>

        {/* Analytical Grid metrics */}
        <div className="grid grid-cols-2 gap-3 mt-1.5 border-t border-zinc-100 dark:border-zinc-900/50 pt-4 select-none">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Total Files
            </span>
            <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
              {stats?.documentsCount || 0} docs
            </span>
          </div>

          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Average Size
            </span>
            <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
              {avgSizeStr}
            </span>
          </div>
        </div>
      </div>

      {/* Largest File Highlight Subcard if exists */}
      {stats?.largestFile && (
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-900/60 flex items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
              <Database className="w-3 h-3" /> Largest Saved Document
            </div>
            <p className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 truncate mt-1 max-w-[190px]">
              {stats.largestFile.title}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-black bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 px-2.5 py-1 rounded-lg text-zinc-700 dark:text-zinc-300 shadow-sm inline-flex items-center gap-0.5">
              {formatSize(stats.largestFile.fileSize)}
              <ArrowUpRight className="w-3 h-3 text-zinc-400" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
export default StorageCard;
