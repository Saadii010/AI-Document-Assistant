import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Database, Server, RefreshCw } from 'lucide-react';
import { ISystemHealthData } from '../../services/adminApi';

interface SystemHealthCardProps {
  id: string;
  health: ISystemHealthData | null;
  loading: boolean;
  onRefresh: () => void;
}

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({
  id,
  health,
  loading,
  onRefresh,
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: 'healthy' | 'unhealthy' | string) => {
    if (status === 'healthy') {
      return (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          HEALTHY
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse">
        UNHEALTHY
      </span>
    );
  };

  const cpuPercent = health ? Math.min(100, health.cpuUsage) : 0;
  const memoryPercent = health
    ? Math.min(100, parseFloat(((health.memoryUsage.used / health.memoryUsage.total) * 100).toFixed(1)))
    : 0;
  const diskPercent = health
    ? Math.min(100, parseFloat(((health.diskUsage.used / health.diskUsage.total) * 100).toFixed(1)))
    : 0;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-950 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 tracking-tight">
            System Operations & Service Health
          </h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            Live health verification of external integrations and VM resources.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Integrations & Microservices */}
        <div className="space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Microservices & SDK Nodes
          </h5>
          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-3">
                <Database className="w-4.5 h-4.5 text-indigo-500" />
                <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                  MongoDB Cluster State
                </span>
              </div>
              {getStatusBadge(health?.services.mongodb || 'healthy')}
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-3">
                <Cpu className="w-4.5 h-4.5 text-sky-500" />
                <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                  FAISS Vector Indexes
                </span>
              </div>
              {getStatusBadge(health?.services.faiss || 'healthy')}
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-3">
                <Server className="w-4.5 h-4.5 text-pink-500" />
                <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                  Google Gemini API Client
                </span>
              </div>
              {getStatusBadge(health?.services.geminiApi || 'healthy')}
            </div>
          </div>
        </div>

        {/* Server Physical Resource Snapshot */}
        <div className="space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Container Infrastructure Resources
          </h5>
          <div className="space-y-4">
            {/* CPU */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black text-zinc-700 dark:text-zinc-300">
                <span>CPU Workload Average</span>
                <span>{cpuPercent}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${cpuPercent}%` }}
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Memory */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black text-zinc-700 dark:text-zinc-300">
                <span>Memory (RAM) Allocation</span>
                <span>{health ? formatBytes(health.memoryUsage.used) : '0 GB'} / {health ? formatBytes(health.memoryUsage.total) : '8 GB'}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${memoryPercent}%` }}
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Disk */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black text-zinc-700 dark:text-zinc-300">
                <span>Persistent Solid Storage</span>
                <span>{health ? formatBytes(health.diskUsage.used) : '0 GB'} / {health ? formatBytes(health.diskUsage.total) : '50 GB'}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${diskPercent}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
