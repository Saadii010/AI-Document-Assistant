import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Activity, ShieldCheck, AlertCircle } from 'lucide-react';

interface ActivityLogTableProps {
  id: string;
  logs: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onFetchLogs: (params: any) => void;
  loading: boolean;
}

export const ActivityLogTable: React.FC<ActivityLogTableProps> = ({
  id,
  logs,
  pagination,
  onFetchLogs,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFetchLogs({ page: 1, search: searchTerm, category: categoryFilter });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    onFetchLogs({ page: newPage, search: searchTerm, category: categoryFilter });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    onFetchLogs({ page: 1, search: '', category: '' });
  };

  const getCategoryBadge = (category: string) => {
    const isUser = category === 'USER_ACTION';
    return (
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
        isUser
          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10'
      }`}>
        {category.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div id={id} className="space-y-4">
      {/* Search filters */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search activity description, email or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-black rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            <option value="">All Streams</option>
            <option value="USER_ACTION">User Actions</option>
            <option value="USER_MANAGEMENT">User Management (Admin)</option>
            <option value="DOCUMENT_MANAGEMENT">Document Audits (Admin)</option>
            <option value="SYSTEM_SETTING">System Configurations</option>
            <option value="SECURITY">Security alerts</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md transition-colors"
          >
            Filter
          </button>

          {(searchTerm || categoryFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-black rounded-xl border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-4">Operator</th>
                <th className="py-4 px-4">Action Context</th>
                <th className="py-4 px-4">Stream Channel</th>
                <th className="py-4 px-4">Description</th>
                <th className="py-4 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 font-bold">
                    Assembling audit timelines...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 font-bold">
                    No matching activity logs recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <td className="py-4 px-6 text-zinc-400 dark:text-zinc-500 font-bold whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 block">{log.user}</span>
                      <span className="text-[10px] text-zinc-400">{log.email}</span>
                    </td>

                    <td className="py-4 px-4 font-black text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                      {log.action}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {getCategoryBadge(log.category)}
                    </td>

                    <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 max-w-sm">
                      <p className="line-clamp-2 leading-relaxed font-medium" title={log.details}>
                        {log.details}
                      </p>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        log.status === 'success'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total records)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
