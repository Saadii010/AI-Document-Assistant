import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ApiService } from '../services/api';
import {
  Bell,
  CheckCheck,
  Trash2,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  _id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
  isRead: boolean;
  createdAt: string;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return { icon: CheckCircle, color: 'text-green-500 bg-green-50 dark:bg-green-950/20' };
    case 'warning':
      return { icon: AlertTriangle, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' };
    case 'error':
      return { icon: XCircle, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' };
    case 'ai':
      return { icon: Sparkles, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' };
    default:
      return { icon: Info, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' };
  }
};

export const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await ApiService.get<Notification[]>('/dashboard/notifications');
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for dynamic unread notifications updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (notifId: string) => {
    try {
      const response = await ApiService.patch(`/dashboard/notifications/${notifId}/read`);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => {
            const currentId = n.id || n._id || '';
            return currentId === notifId ? { ...n, isRead: true } : n;
          })
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await ApiService.post('/dashboard/notifications/read-all');
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (notifId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await ApiService.delete(`/dashboard/notifications/${notifId}`);
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => (n.id || n._id) !== notifId));
        toast.success('Notification cleared.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Clear failed.');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 transition-all text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 shadow-sm"
        aria-label="Notifications Panel"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-extrabold text-white flex items-center justify-center animate-pulse border border-white dark:border-zinc-950">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-50 text-[9px] font-bold text-red-600 dark:bg-red-950/20 dark:text-red-400">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[350px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2 select-none">
                  <div className="p-2.5 rounded-xl bg-zinc-50 text-zinc-300 dark:bg-zinc-900/60 dark:text-zinc-700">
                    <Bell className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">All caught up!</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 max-w-[200px]">
                    No unread system alerts or updates at this time.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const notifId = notif.id || notif._id || '';
                  const { icon: Icon, color: iconColor } = getNotificationIcon(notif.type);
                  return (
                    <div
                      key={notifId}
                      onClick={() => !notif.isRead && handleMarkAsRead(notifId)}
                      className={`p-4 flex gap-3.5 text-left transition-colors cursor-pointer relative group ${
                        notif.isRead
                          ? 'bg-white hover:bg-zinc-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-900/10'
                          : 'bg-zinc-50/60 hover:bg-zinc-50 dark:bg-zinc-900/20 dark:hover:bg-zinc-900/35'
                      }`}
                    >
                      {/* Read/Unread Indicator bar */}
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500" />
                      )}

                      <div className={`p-2 rounded-xl ${iconColor} shrink-0 self-start shadow-sm`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 flex flex-col gap-0.5 min-w-0 pr-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs leading-snug truncate ${notif.isRead ? 'font-semibold text-zinc-700 dark:text-zinc-300' : 'font-extrabold text-zinc-900 dark:text-zinc-50'}`}>
                            {notif.title}
                          </p>
                        </div>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal break-words">
                          {notif.message}
                        </p>
                        <span className="text-[9px] font-mono font-medium text-zinc-400 dark:text-zinc-600 mt-1 leading-none">
                          {new Date(notif.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleDelete(notifId, e)}
                        className="opacity-0 group-hover:opacity-100 absolute right-3.5 top-4 p-1 rounded-md text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all shrink-0"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default NotificationsDropdown;
