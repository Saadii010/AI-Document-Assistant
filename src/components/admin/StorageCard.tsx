import React from 'react';
import { motion } from 'motion/react';
import { HardDrive, AlertTriangle, File } from 'lucide-react';

interface StorageCardProps {
  id: string;
  storageData: {
    totalLimit: number;
    totalUsed: number;
    remaining: number;
    documentCount: number;
    largestDocuments: any[];
    storagePerUser: any[];
  } | null;
  loading: boolean;
}

export const StorageCard: React.FC<StorageCardProps> = ({ id, storageData, loading }) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading || !storageData) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-950 dark:border-zinc-800/80 shadow-sm animate-pulse h-64 flex items-center justify-center">
        <span className="text-xs text-zinc-400 font-bold">Retrieving space allocations...</span>
      </div>
    );
  }

  const usePercentage = parseFloat(((storageData.totalUsed / storageData.totalLimit) * 100).toFixed(1));
  const isHighUsage = usePercentage > 85;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Overview Block */}
      <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-950 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-6">
        <div>
          <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 tracking-tight">
            Volume & Storage Limits
          </h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            Disk capacity check across user accounts.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h5 className="text-xl font-black text-zinc-800 dark:text-zinc-100">
              {formatBytes(storageData.totalUsed)}
            </h5>
            <p className="text-xs text-zinc-400 font-bold">
              USED OF {formatBytes(storageData.totalLimit)} ({usePercentage}%)
            </p>
          </div>
        </div>

        {/* Meter */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${usePercentage}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isHighUsage ? 'bg-rose-500' : 'bg-indigo-600'
              }`}
            />
          </div>
          <div className="flex justify-between text-[11px] font-bold text-zinc-400">
            <span>{formatBytes(storageData.totalUsed)} Used</span>
            <span>{formatBytes(storageData.remaining)} Free</span>
          </div>
        </div>

        {isHighUsage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex gap-2.5 items-start">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs font-medium">
              <span className="font-bold block">Storage capacity exceeds 85%!</span>
              Please consider expanding volume quotas or implementing strict TTL retention models.
            </div>
          </div>
        )}
      </div>

      {/* Largest Documents */}
      <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-950 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-4">
        <div>
          <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 tracking-tight">
            Largest Uploaded Files
          </h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            Heaviest document files stored on server disk.
          </p>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {storageData.largestDocuments.length === 0 ? (
            <p className="text-xs text-zinc-400 font-bold text-center py-8">No documents recorded.</p>
          ) : (
            storageData.largestDocuments.map((doc: any, idx: number) => (
              <div
                key={doc._id || idx}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <File className="w-4.5 h-4.5 text-zinc-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 block truncate">
                      {doc.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 block font-bold truncate">
                      BY: {doc.owner?.firstName} {doc.owner?.lastName}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                  {formatBytes(doc.fileSize)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Storage per User */}
      <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-950 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-4">
        <div>
          <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 tracking-tight">
            Consumption by User Accounts
          </h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            Active storage distribution per registered user.
          </p>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {storageData.storagePerUser.length === 0 ? (
            <p className="text-xs text-zinc-400 font-bold text-center py-8">No user storage activity.</p>
          ) : (
            storageData.storagePerUser.map((u: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 block">
                    {u.user}
                  </span>
                  <span className="text-[10px] text-zinc-400 block font-bold">
                    {u.count} DOCUMENT{u.count !== 1 ? 'S' : ''}
                  </span>
                </div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {formatBytes(u.totalSize)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};
