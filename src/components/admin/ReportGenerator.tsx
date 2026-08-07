import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, FileSpreadsheet, Download, Loader, CheckCircle2 } from 'lucide-react';
import { AdminApiService } from '../../services/adminApi';

interface ReportGeneratorProps {
  id: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ id }) => {
  const [reportType, setReportType] = useState<'users' | 'documents' | 'ai_usage' | 'storage' | 'system'>('system');
  const [reportFormat, setReportFormat] = useState<'csv' | 'excel' | 'pdf'>('pdf');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const triggerExport = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const response = await AdminApiService.getReports(reportType, reportFormat);
      if (response.success) {
        setSuccessMsg(response.message || 'Report generated successfully.');
        
        // Dynamic simulated client side download trigger
        const mockData = `AI Personal Knowledge Assistant - REPORT LOG
Generated: ${new Date().toLocaleString()}
Report Category: ${reportType.toUpperCase()}
Report Format: ${reportFormat.toUpperCase()}

STATS KEY-VALUE EXPORTS:
${JSON.stringify(response.data?.summaryData || {}, null, 2)}
`;
        const blob = new Blob([mockData], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `system_report_${reportType}_${Date.now()}.${reportFormat === 'pdf' ? 'txt' : reportFormat}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      console.error(err);
      setSuccessMsg('Compilation failed. Please verify MongoDB connections.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-950 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-6"
    >
      <div>
        <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          Enterprise Report compiler
        </h4>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          Generate, filter, and export administrative statistics into spreadsheets and vectors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Type Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Report Focus Module</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => setReportType('users')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                reportType === 'users'
                  ? 'border-indigo-500 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400'
                  : 'border-zinc-150 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <span className="text-xs font-black block">Registered Users</span>
              <span className="text-[10px] opacity-80 block font-medium mt-0.5">Demographics & login history.</span>
            </button>

            <button
              onClick={() => setReportType('documents')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                reportType === 'documents'
                  ? 'border-indigo-500 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400'
                  : 'border-zinc-150 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <span className="text-xs font-black block">Document Assets</span>
              <span className="text-[10px] opacity-80 block font-medium mt-0.5">Page segments & status checks.</span>
            </button>

            <button
              onClick={() => setReportType('ai_usage')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                reportType === 'ai_usage'
                  ? 'border-indigo-500 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400'
                  : 'border-zinc-150 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <span className="text-xs font-black block">Gemini API Requests</span>
              <span className="text-[10px] opacity-80 block font-medium mt-0.5">Token usage & response times.</span>
            </button>

            <button
              onClick={() => setReportType('storage')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                reportType === 'storage'
                  ? 'border-indigo-500 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400'
                  : 'border-zinc-150 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <span className="text-xs font-black block">Storage Quotas</span>
              <span className="text-[10px] opacity-80 block font-medium mt-0.5">Quota growth & limits.</span>
            </button>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Format Specifications</label>
            <div className="flex gap-2">
              {['pdf', 'csv', 'excel'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setReportFormat(fmt as any)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-black transition-all uppercase cursor-pointer ${
                    reportFormat === fmt
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                      : 'border-zinc-150 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={triggerExport}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-50 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  COMPILING SEGMENTS...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  GENERATE & EXPORT FILE
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 text-xs font-bold"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
