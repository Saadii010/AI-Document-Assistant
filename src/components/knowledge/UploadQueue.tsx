import React from 'react';
import { File, FileText, Check, X, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface QueuedFile {
  id: string;
  file: File;
  progress: number; // 0 to 100
  status: 'idle' | 'uploading' | 'success' | 'failed';
  error?: string;
}

interface UploadQueueProps {
  queue: QueuedFile[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}

export const UploadQueue: React.FC<UploadQueueProps> = ({ queue, onRemove, onRetry, onCancel }) => {
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return (
        <div className="p-2.5 rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <FileText className="w-5 h-5" />
        </div>
      );
    }
    if (ext === 'docx') {
      return (
        <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          <File className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
        <FileText className="w-5 h-5" />
      </div>
    );
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (queue.length === 0) return null;

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2 select-none">
        <span className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Upload Queue ({queue.length} {queue.length === 1 ? 'file' : 'files'})
        </span>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {queue.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-3.5 rounded-2xl border border-zinc-150 bg-white dark:border-zinc-900 dark:bg-zinc-950/30 flex flex-col gap-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(item.file.name)}
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px] sm:max-w-[320px]">
                      {item.file.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {formatSize(item.file.size)}
                    </span>
                  </div>
                </div>

                {/* State-specific Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.status === 'uploading' && (
                    <button
                      onClick={() => onCancel(item.id)}
                      className="p-1.5 rounded-lg border border-zinc-150 hover:bg-zinc-50 dark:border-zinc-850 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all text-[10px] font-bold"
                      title="Cancel Upload"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {item.status === 'failed' && (
                    <>
                      <button
                        onClick={() => onRetry(item.id)}
                        className="p-1.5 rounded-lg border border-zinc-150 hover:bg-zinc-50 dark:border-zinc-850 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 transition-all"
                        title="Retry Upload"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="p-1.5 rounded-lg border border-red-200/30 hover:border-red-500 hover:bg-red-50/10 text-red-500 transition-all"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {item.status === 'success' && (
                    <span className="p-1 rounded-full bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400">
                      <Check className="w-4 h-4" />
                    </span>
                  )}

                  {item.status === 'idle' && (
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-1.5 rounded-lg border border-zinc-150 hover:bg-zinc-50 dark:border-zinc-850 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress and status message bar */}
              {item.status === 'uploading' && (
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 0.15 }}
                      className="h-full bg-zinc-900 dark:bg-zinc-50 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500">
                    <span>Uploading...</span>
                    <span className="font-bold">{item.progress}%</span>
                  </div>
                </div>
              )}

              {item.status === 'failed' && (
                <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-bold bg-red-50/30 dark:bg-red-950/10 p-2 rounded-lg border border-red-150/10">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.error || 'Upload failed.'}</span>
                </div>
              )}

              {item.status === 'success' && (
                <div className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-50/20 dark:bg-green-950/10 p-2 rounded-lg border border-green-150/10">
                  Document successfully processed and saved.
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
