import React from 'react';
import { motion } from 'motion/react';
import {
  UploadCloud,
  MessageSquarePlus,
  Search,
  UserCog,
  Settings,
} from 'lucide-react';

interface QuickActionsProps {
  onSearchClick: () => void;
  onNavigate: (route: string, label: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSearchClick,
  onNavigate,
}) => {
  const actions = [
    {
      title: 'Upload Document',
      description: 'Upload PDFs or text files to knowledge base',
      icon: UploadCloud,
      color: 'text-green-500 bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-950/40',
      onClick: () => onNavigate('/knowledge-base', 'Knowledge Base'),
    },
    {
      title: 'Start New Chat',
      description: 'Initiate a secure session with the AI assistant',
      icon: MessageSquarePlus,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-950/40',
      onClick: () => onNavigate('/ai-chat', 'AI Chat'),
    },
    {
      title: 'Search Files',
      description: 'Find instantly by text or document context',
      icon: Search,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-950/40',
      onClick: onSearchClick,
    },
    {
      title: 'Manage Profile',
      description: 'Configure details and security passwords',
      icon: UserCog,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-950/40',
      onClick: () => onNavigate('/profile', 'Account Profile'),
    },
    {
      title: 'View Settings',
      description: 'Tune default AI preferences and preferences',
      icon: Settings,
      color: 'text-zinc-500 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-100 dark:border-zinc-800',
      onClick: () => onNavigate('/settings', 'App Settings'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {actions.map((act, idx) => {
        const Icon = act.icon;
        return (
          <motion.button
            key={idx}
            onClick={act.onClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="p-5 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700/80 shadow-sm flex flex-col gap-4 text-left group transition-all"
          >
            <div className={`p-2.5 rounded-xl border ${act.color} self-start shrink-0 group-hover:scale-105 transition-transform shadow-inner`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {act.title}
              </h4>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium leading-normal">
                {act.description}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
export default QuickActions;
