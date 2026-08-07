import React, { useState } from 'react';
import { ShieldCheck, Monitor, Tablet, Trash2, ShieldAlert, Key, Globe, Eye, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export interface Session {
  _id?: string;
  id?: string; // local fallback ID
  browser: string;
  os: string;
  ipAddress: string;
  country: string;
  loginTime: string;
  currentDevice: boolean;
}

export interface SecurityLog {
  _id?: string;
  id?: string;
  action: string;
  ipAddress: string;
  browser: string;
  os: string;
  country: string;
  timestamp: string;
}

interface SessionTableProps {
  sessions: Session[];
  securityLogs: SecurityLog[];
  onRevokeSession: (id: string) => Promise<void>;
  onRevokeAllSessions: () => Promise<void>;
}

export const SessionTable: React.FC<SessionTableProps> = ({
  sessions,
  securityLogs,
  onRevokeSession,
  onRevokeAllSessions,
}) => {
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevokeSingle = async (sessId: string) => {
    if (window.confirm('Are you sure you want to log out and terminate this session?')) {
      setRevokingId(sessId);
      try {
        await onRevokeSession(sessId);
        toast.success('Session terminated successfully!');
      } catch (err: any) {
        toast.error(err.message || 'Failed to revoke session.');
      } finally {
        setRevokingId(null);
      }
    }
  };

  const handleRevokeAll = async () => {
    if (
      window.confirm(
        'Are you sure you want to revoke ALL other active sessions? All other logged-in clients will be force-logged out.'
      )
    ) {
      setIsRevokingAll(true);
      try {
        await onRevokeAllSessions();
        toast.success('All other active sessions have been successfully revoked!');
      } catch (err: any) {
        toast.error(err.message || 'Failed to revoke other sessions.');
      } finally {
        setIsRevokingAll(false);
      }
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      return new Date(timeStr).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return timeStr;
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
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Active Sessions & Audit Trail</h3>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Track and audit all active authenticated login access lines, and review account actions chronologically.
        </p>
      </div>

      {/* Sessions Section */}
      <div className="flex flex-col gap-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-zinc-400 shrink-0" />
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Active Devices & Authenticated Clients</h4>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAll}
              disabled={isRevokingAll}
              className="px-3 py-1.5 border border-red-200 bg-red-50/20 text-red-600 hover:text-red-700 font-bold text-[10px] rounded-lg cursor-pointer transition-all self-start sm:self-center disabled:opacity-50 flex items-center gap-1"
            >
              {isRevokingAll ? (
                <span className="w-2.5 h-2.5 border border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShieldAlert className="w-3 h-3" />
              )}
              <span>Log out other sessions</span>
            </button>
          )}
        </div>

        {/* Sessions List */}
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-[11px] text-zinc-400">No active sessions indexed.</div>
          ) : (
            sessions.map((sess, idx) => {
              const sessId = sess._id || sess.id || '';
              const isCurrent = sess.currentDevice;
              return (
                <div
                  key={sessId || idx}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 ${
                    idx > 0 ? 'border-t border-zinc-100 dark:border-zinc-900/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-500 mt-0.5">
                      {sess.os.toLowerCase().includes('windows') || sess.os.toLowerCase().includes('mac') ? (
                        <Monitor className="w-4 h-4" />
                      ) : (
                        <Tablet className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {sess.browser} on {sess.os}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <UserCheck className="w-2.5 h-2.5" />
                            <span>This Device</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span>{sess.ipAddress} ({sess.country})</span>
                        </span>
                        <span>•</span>
                        <span>Authenticated: {formatTime(sess.loginTime)}</span>
                      </div>
                    </div>
                  </div>

                  {!isCurrent && sessId && (
                    <button
                      onClick={() => handleRevokeSingle(sessId)}
                      disabled={revokingId === sessId}
                      className="p-2 border border-zinc-200 hover:border-red-200 dark:border-zinc-800 dark:hover:border-red-950/40 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-zinc-50 dark:hover:bg-red-950/10 cursor-pointer transition-colors sm:self-center"
                      title="Revoke and force sign out device"
                    >
                      {revokingId === sessId ? (
                        <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin block" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Security Logs Section */}
      <div className="flex flex-col gap-4 text-left mt-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" />
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Recent Security Activities</h4>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden shadow-sm">
          {securityLogs.length === 0 ? (
            <div className="p-8 text-center text-[11px] text-zinc-400">No security logging history indexed.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50/70 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-900 text-zinc-450 uppercase tracking-wider font-bold text-[9px]">
                    <th className="p-3 pl-4">Timestamp</th>
                    <th className="p-3">Action Event</th>
                    <th className="p-3">Client Identifier</th>
                    <th className="p-3 pr-4 text-right">Location IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/40">
                  {securityLogs.slice(0, 8).map((log, idx) => (
                    <tr key={log._id || log.id || idx} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="p-3 pl-4 text-[10px] text-zinc-400 whitespace-nowrap">
                        {formatTime(log.timestamp)}
                      </td>
                      <td className="p-3 font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 whitespace-nowrap">
                        <Key className="w-3 h-3 text-indigo-500" />
                        <span>{log.action}</span>
                      </td>
                      <td className="p-3 text-zinc-400 text-[10px] whitespace-nowrap">
                        {log.browser} / {log.os}
                      </td>
                      <td className="p-3 pr-4 text-right text-zinc-400 text-[10px] whitespace-nowrap">
                        {log.ipAddress} ({log.country})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
