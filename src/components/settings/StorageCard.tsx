import React, { useState } from 'react';
import { Database, Save, Trash2, ShieldAlert, Sparkles, RefreshCw, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface StorageStats {
  documentsUploaded: number;
  storageUsed: number; // in bytes
  aiRequests: number;
}

interface StorageCardProps {
  stats: StorageStats;
  onClearChats: () => Promise<void>;
  onClearDocuments: () => Promise<void>;
}

export const StorageCard: React.FC<StorageCardProps> = ({
  stats,
  onClearChats,
  onClearDocuments,
}) => {
  const [clearingChats, setClearingChats] = useState(false);
  const [clearingDocs, setClearingDocs] = useState(false);

  const STORAGE_LIMIT_BYTES = 100 * 1024 * 1024; // 100 MB Free Tier Limit
  const usedMB = stats.storageUsed / (1024 * 1024);
  const limitMB = STORAGE_LIMIT_BYTES / (1024 * 1024);
  const percentUsed = Math.min(100, Math.round((stats.storageUsed / STORAGE_LIMIT_BYTES) * 100));

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0.00 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClearChats = async () => {
    if (
      window.confirm(
        'WARNING: Are you sure you want to delete ALL chat conversations? This will permanently wipe your dialogues, conversation logs, and saved chats. This operation is irreversible.'
      )
    ) {
      setClearingChats(true);
      const toastId = toast.loading('Wiping conversational history...');
      try {
        await onClearChats();
        toast.success('Conversational history successfully wiped!', { id: toastId });
      } catch (err: any) {
        toast.error(err.message || 'Failed to clear chats.', { id: toastId });
      } finally {
        setClearingChats(false);
      }
    }
  };

  const handleClearDocs = async () => {
    if (
      window.confirm(
        'WARNING: Are you sure you want to delete ALL index assets? This will permanently delete your documents, text chunks, and indexed vector embeddings from the system. This operation is irreversible.'
      )
    ) {
      setClearingDocs(true);
      const toastId = toast.loading('Wiping document vector database index...');
      try {
        await onClearDocuments();
        toast.success('Document vectors index wiped successfully!', { id: toastId });
      } catch (err: any) {
        toast.error(err.message || 'Failed to clear documents.', { id: toastId });
      } finally {
        setClearingDocs(false);
      }
    }
  };

  const handleClearBrowserCache = () => {
    if (
      window.confirm(
        'This will reset your local client state, clear theme overrides stored in this browser, and refresh your viewport config.'
      )
    ) {
      localStorage.clear();
      toast.success('Local browser storage cleared! Reloading interface...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Title */}
      <div className="flex flex-col gap-1 pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Storage & Vector Index Quotas</h3>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Monitor your workspace storage, inspect your document vector volume, and run database cache sweep controls.
        </p>
      </div>

      {/* Usage Indicator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Drive Storage Gauge */}
        <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl md:col-span-2 text-left flex flex-col gap-3.5 shadow-sm">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Personal Storage Quota</span>
            </div>
            <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Free Tier (100MB)</span>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden shadow-inner flex border border-zinc-250/20 dark:border-zinc-850">
              <div
                className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>{formatSize(stats.storageUsed)} of {formatSize(STORAGE_LIMIT_BYTES)} utilized</span>
              <span className="font-extrabold text-zinc-700 dark:text-zinc-300">{percentUsed}%</span>
            </div>
          </div>
        </div>

        {/* Counter Widget Card */}
        <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl text-left flex flex-col justify-between gap-1 shadow-sm">
          <span className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider">Libraries Volume</span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-3xl font-extrabold text-zinc-850 dark:text-zinc-100">
              {stats.documentsUploaded}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold">files uploaded</span>
          </div>
          <p className="text-[9px] text-zinc-400 leading-normal mt-1 border-t border-zinc-100 dark:border-zinc-900 pt-1">
            We support indexing PDF, TXT, DOCX, and Markdown documents.
          </p>
        </div>
      </div>

      {/* Storage Clear Controls */}
      <div className="flex flex-col gap-4 text-left">
        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-900 pb-2">
          <Database className="w-4 h-4 text-zinc-400" />
          <span>Workspace Cleanup Options</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Delete All Chats Card */}
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Wipe Chat Conversations</span>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Completely erase all dialog trees, saved messages, and historical AI prompts stored under this profile.
              </p>
            </div>
            <button
              onClick={handleClearChats}
              disabled={clearingChats}
              className="w-full px-3 py-1.5 border border-red-200 hover:border-red-300 bg-red-55/10 hover:bg-red-50/20 text-red-600 font-bold text-[10px] rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {clearingChats ? (
                <span className="w-2.5 h-2.5 border border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              <span>Wipe Conversations</span>
            </button>
          </div>

          {/* Wipe Documents Index Card */}
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Clear Document Index</span>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Permanently purge all PDF/text uploads, parsed chunks, and compiled vector embeddings from your database storage.
              </p>
            </div>
            <button
              onClick={handleClearDocs}
              disabled={clearingDocs}
              className="w-full px-3 py-1.5 border border-red-200 hover:border-red-300 bg-red-55/10 hover:bg-red-50/20 text-red-600 font-bold text-[10px] rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {clearingDocs ? (
                <span className="w-2.5 h-2.5 border border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              <span>Wipe Document Index</span>
            </button>
          </div>

          {/* Reset Browser Caches Card */}
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Clear Browser Storage</span>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Reset local cookies, purge viewport caches, clear dark/light mode overrides, and force re-authenticate with the server.
              </p>
            </div>
            <button
              onClick={handleClearBrowserCache}
              className="w-full px-3 py-1.5 border border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 font-bold text-[10px] rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3 animate-spin-slow" />
              <span>Clear Local Cache</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
