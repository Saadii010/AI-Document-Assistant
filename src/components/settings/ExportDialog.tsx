import React, { useState, useRef } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet, Save, Info, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface ExportDialogProps {
  onExport: (format: 'json' | 'csv') => Promise<any>;
  onImport: (backupData: any) => Promise<void>;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  onExport,
  onImport,
}) => {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading(`Preparing and compiling ${exportFormat.toUpperCase()} backup archives...`);
    try {
      const result = await onExport(exportFormat);
      
      if (exportFormat === 'json') {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `personal_assistant_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success('JSON Backup file downloaded successfully!', { id: toastId });
      } else {
        // CSV format is returned as a Blob/String directly from API and downloaded by browser or converted
        const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(result);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `personal_assistant_data_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success('CSV spreadsheet compiled and downloaded successfully!', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to trigger data export.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast.error('Restoration only supports standard .json backup formats!');
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading('Reading backup file configurations...');
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const rawText = event.target?.result as string;
          const parsed = JSON.parse(rawText);
          
          if (!parsed.settings && !parsed.preferences) {
            throw new Error('Invalid backup schema. Missing configurations payload.');
          }

          await onImport(parsed);
          toast.success('Settings and preferences restored successfully! Reloading configuration state...', { id: toastId });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (innerErr: any) {
          toast.error(innerErr.message || 'Corrupt or invalid backup file format.', { id: toastId });
          setIsImporting(false);
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load backup file.', { id: toastId });
      setIsImporting(false);
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
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Backup Export & Restoration</h3>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Download offsite copies of your personal knowledge indexes or restore your setting configurations from previous back-ups.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Export Card */}
        <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-900">
              <Download className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Export Offsite Backup</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal mt-2">
              Compile full conversational logs, document list indexes, account metadata, and interface preferences.
            </p>
          </div>

          {/* Formats picker */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            {[
              { id: 'json', label: 'JSON Backup', desc: 'Best for configuration restoration', icon: FileJson },
              { id: 'csv', label: 'CSV Spreadsheet', desc: 'Best for analytics & reading logs', icon: FileSpreadsheet },
            ].map((f) => {
              const Icon = f.icon;
              const isSelected = exportFormat === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setExportFormat(f.id as 'json' | 'csv')}
                  className={`p-3 border rounded-xl flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/10 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 font-extrabold shadow-inner'
                      : 'border-zinc-200 bg-white dark:border-zinc-850 dark:bg-zinc-900/45 text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px]">{f.label}</span>
                    <span className="text-[8px] text-zinc-400 font-normal leading-tight">{f.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            {isExporting ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export Backup File</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl flex flex-col justify-between gap-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-900">
              <Upload className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Restore Backup Settings</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal mt-2">
              Import settings, notification switches, appearance themes, and model configurations from an exported JSON file.
            </p>
          </div>

          {/* Info notification */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-255/10 flex items-start gap-2 text-[9px] text-zinc-400 leading-normal">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>Note: Document index restoration is currently restricted for file safety. Only UI configurations are imported.</span>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full px-4 py-2 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {isImporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Choose Backup File (.json)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </motion.div>
  );
};
