import React from 'react';
import {
  User,
  Shield,
  Eye,
  Sliders,
  Cpu,
  Bell,
  Database,
  History,
  Trash2,
  Info
} from 'lucide-react';

export type SettingsSection =
  | 'profile'
  | 'account'
  | 'appearance'
  | 'notifications'
  | 'ai'
  | 'privacy'
  | 'security'
  | 'storage'
  | 'sessions'
  | 'danger';

interface SidebarItem {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'profile', label: 'My Profile', icon: User, color: 'text-indigo-500' },
  { id: 'account', label: 'Account Summary', icon: Info, color: 'text-sky-500' },
  { id: 'appearance', label: 'Appearance & Theme', icon: Sliders, color: 'text-amber-500' },
  { id: 'notifications', label: 'Notification Settings', icon: Bell, color: 'text-emerald-500' },
  { id: 'ai', label: 'AI Configuration', icon: Cpu, color: 'text-purple-500' },
  { id: 'privacy', label: 'Privacy & Data', icon: Eye, color: 'text-teal-500' },
  { id: 'security', label: 'Security & Password', icon: Shield, color: 'text-rose-500' },
  { id: 'storage', label: 'Storage & Cache', icon: Database, color: 'text-violet-500' },
  { id: 'sessions', label: 'Active Sessions', icon: History, color: 'text-fuchsia-500' },
  { id: 'danger', label: 'Danger Zone', icon: Trash2, color: 'text-red-500' },
];

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  return (
    <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-none border-b md:border-b-0 md:border-r border-zinc-200/50 dark:border-zinc-800/50 pr-0 md:pr-4 shrink-0">
      {SIDEBAR_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all font-semibold text-xs whitespace-nowrap md:w-full select-none ${
              isActive
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 shadow-sm border-l-2 md:border-l-4 border-indigo-600 dark:border-indigo-400 pl-3 md:pl-2'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? item.color : 'text-zinc-400 dark:text-zinc-500'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
