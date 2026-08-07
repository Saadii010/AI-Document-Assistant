import React from 'react';
import { motion } from 'motion/react';
import {
  LogIn,
  Upload,
  MessageSquareCode,
  UserCheck,
  ShieldCheck,
  Star,
  Activity,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  action: 'login' | 'upload' | 'chat_start' | 'profile_update' | 'password_change' | 'favorite_add' | 'favorite_remove';
  details: string;
  createdAt: string;
}

interface RecentActivityListProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const getActionStyles = (action: ActivityItem['action']) => {
  switch (action) {
    case 'login':
      return { icon: LogIn, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' };
    case 'upload':
      return { icon: Upload, color: 'text-green-500 bg-green-50 dark:bg-green-950/20' };
    case 'chat_start':
      return { icon: MessageSquareCode, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' };
    case 'profile_update':
      return { icon: UserCheck, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' };
    case 'password_change':
      return { icon: ShieldCheck, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' };
    case 'favorite_add':
    case 'favorite_remove':
      return { icon: Star, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' };
    default:
      return { icon: Activity, color: 'text-zinc-500 bg-zinc-50 dark:bg-zinc-950/20' };
  }
};

const formatRelativeTime = (isoString: string) => {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'N/A';
  }
};

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  activities,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 select-none animate-pulse">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950/50">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4" />
              <div className="h-3 bg-zinc-100 dark:bg-zinc-900 rounded-md w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center gap-3 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
        <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900/60 dark:text-zinc-600">
          <Activity className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">No recent activities</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Your interaction trace will show up here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {activities.map((item, idx) => {
        const { icon: ActionIcon, color: actionColor } = getActionStyles(item.action);
        return (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            className="flex items-start gap-3.5 p-3.5 rounded-xl border border-zinc-200/60 bg-white hover:bg-zinc-50/50 hover:border-zinc-300 dark:border-zinc-800/60 dark:bg-zinc-950 dark:hover:bg-zinc-900/20 dark:hover:border-zinc-700/60 transition-all group"
          >
            <div className={`p-2 rounded-xl ${actionColor} shrink-0 shadow-sm border border-transparent dark:border-zinc-800/30 group-hover:scale-105 transition-transform`}>
              <ActionIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-tight break-words">
                {item.details}
              </p>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium font-mono leading-none">
                {formatRelativeTime(item.createdAt)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
export default RecentActivityList;
