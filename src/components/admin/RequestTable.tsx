import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface RequestTableProps {
  id: string;
  requests: any[];
  loading: boolean;
}

export const RequestTable: React.FC<RequestTableProps> = ({ id, requests, loading }) => {
  return (
    <div id={id} className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
        <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Real-time Gemini API Stream
        </h4>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          Detailed metrics of queries processed by model endpoints.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              <th className="py-4 px-6">Prompt Context</th>
              <th className="py-4 px-4">User</th>
              <th className="py-4 px-4">Model</th>
              <th className="py-4 px-4">Latency</th>
              <th className="py-4 px-4">Tokens</th>
              <th className="py-4 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-400 font-bold">
                  Parsing request telemetry...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-400 font-bold">
                  No active queries captured today.
                </td>
              </tr>
            ) : (
              requests.map((r, idx) => (
                <tr key={r.id || idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                  <td className="py-4 px-6 max-w-sm">
                    <span className="font-bold text-zinc-800 dark:text-zinc-100 block truncate" title={r.question}>
                      {r.question}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">
                      {new Date(r.timestamp).toLocaleString()}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-zinc-700 dark:text-zinc-300">
                    <span className="font-bold block">{r.user}</span>
                    <span className="text-[10px] text-zinc-400 font-medium">{r.userEmail}</span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md uppercase">
                      {r.model}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-bold text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {r.responseTime}s
                    </span>
                  </td>

                  <td className="py-4 px-4 font-bold text-zinc-500 dark:text-zinc-400">
                    {r.tokenUsage}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase">
                      <CheckCircle2 className="w-3 h-3" /> SUCCESS
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
