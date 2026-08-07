import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Sparkles,
  MessageSquare,
  Search,
  HardDrive,
  Activity,
  BarChart3,
  Settings,
  Heart,
  LogOut,
  ChevronRight,
  User,
  Bell,
  Sun,
  Moon,
  ShieldAlert,
  HelpCircle,
  Loader,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdminApiService, IAdminDashboardData, ISystemHealthData, IAppSettingValues } from '../services/adminApi';
import { AnalyticsCard } from '../components/admin/AnalyticsCard';
import { ChartCard } from '../components/admin/ChartCard';
import { SystemHealthCard } from '../components/admin/SystemHealthCard';
import { StorageCard } from '../components/admin/StorageCard';
import { UserTable } from '../components/admin/UserTable';
import { DocumentTable } from '../components/admin/DocumentTable';
import { RequestTable } from '../components/admin/RequestTable';
import { ActivityLogTable } from '../components/admin/ActivityLogTable';
import { ReportGenerator } from '../components/admin/ReportGenerator';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Sidebar navigation selection
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'users' | 'documents' | 'ai-requests' | 'search-analytics' | 'storage' | 'activity-logs' | 'reports' | 'settings' | 'system-health'
  >('dashboard');

  // Loading indicator states
  const [loading, setLoading] = useState(true);

  // Administrative telemetry structures
  const [dashboardData, setDashboardData] = useState<IAdminDashboardData | null>(null);
  const [systemHealth, setSystemHealth] = useState<ISystemHealthData | null>(null);
  const [storageStats, setStorageStats] = useState<any | null>(null);
  const [appSettings, setAppSettings] = useState<IAppSettingValues>({
    appName: 'AI Knowledge Assistant',
    storageLimitBytes: 10 * 1024 * 1024 * 1024,
    allowedFileTypes: ['.pdf', '.docx', '.txt'],
    maxUploadSizeBytes: 50 * 1024 * 1024,
    maintenanceMode: false,
    aiModelName: 'gemini-3.5-flash',
    tokenLimitPerUserDay: 200000,
  });

  // Table items state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const [docsList, setDocsList] = useState<any[]>([]);
  const [docsPagination, setDocsPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const [aiRequests, setAiRequests] = useState<any[]>([]);
  const [searchAnalytics, setSearchAnalytics] = useState<any | null>(null);

  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 30, total: 0, pages: 1 });

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([
    { id: 'n1', text: 'System operations check completed successfully', type: 'info', time: 'Just now' },
    { id: 'n2', text: 'New user registration: saadkust5481@gmail.com', type: 'user', time: '10m ago' },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Dark/Light theme state
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
  };

  // Fetch Core dashboard analytics
  const fetchDashboardMetrics = async () => {
    try {
      const res = await AdminApiService.getDashboard();
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error loading analytics telemetry');
    }
  };

  // Fetch Users
  const fetchUsers = async (params?: any) => {
    try {
      const res = await AdminApiService.getUsers(params);
      if (res.success) {
        setUsersList(res.data);
        if (res.pagination) setUsersPagination(res.pagination);
      }
    } catch (err: any) {
      toast.error('Error fetching system users');
    }
  };

  // Fetch Documents
  const fetchDocuments = async (params?: any) => {
    try {
      const res = await AdminApiService.getDocuments(params);
      if (res.success) {
        setDocsList(res.data);
        if (res.pagination) setDocsPagination(res.pagination);
      }
    } catch (err: any) {
      toast.error('Error fetching knowledge documents');
    }
  };

  // Fetch Document details logs
  const fetchDocDetails = async (id: string) => {
    try {
      const res = await AdminApiService.getDocumentById(id);
      return res.success ? res.data : null;
    } catch (err) {
      return null;
    }
  };

  // Reprocess document pipeline
  const handleReprocessDoc = async (id: string): Promise<boolean> => {
    const loadToast = toast.loading('Reindexing document chunks...');
    try {
      const res = await AdminApiService.reprocessDocument(id);
      if (res.success) {
        toast.success(res.message || 'Reprocessing pipeline fired off successfully!', { id: loadToast });
        return true;
      }
      toast.error('Failed to trigger RAG pipeline.', { id: loadToast });
      return false;
    } catch (err: any) {
      toast.error(err.message || 'Pipeline error.', { id: loadToast });
      return false;
    }
  };

  // Delete document
  const handleDeleteDoc = async (id: string): Promise<boolean> => {
    try {
      const res = await AdminApiService.deleteDocument(id);
      if (res.success) {
        toast.success('Document assets purged successfully!');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || 'Error purging document.');
      return false;
    }
  };

  // Update user
  const handleUpdateUser = async (id: string, body: any): Promise<boolean> => {
    try {
      const res = await AdminApiService.updateUser(id, body);
      if (res.success) {
        toast.success(res.message || 'User specifications updated successfully.');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || 'Error updating user specs.');
      return false;
    }
  };

  // Delete user
  const handleDeleteUser = async (id: string): Promise<boolean> => {
    try {
      const res = await AdminApiService.deleteUser(id);
      if (res.success) {
        toast.success('User and associated data purged successfully!');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || 'Error deleting user.');
      return false;
    }
  };

  // Fetch AI Request & Search stats
  const fetchAnalyticsData = async () => {
    try {
      const res = await AdminApiService.getAnalytics();
      if (res.success && res.data) {
        setAiRequests(res.data.aiRequestLogs);
        setSearchAnalytics(res.data.searchAnalytics);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Storage distribution
  const fetchStorageStats = async () => {
    try {
      const res = await AdminApiService.getStorage();
      if (res.success && res.data) {
        setStorageStats(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch live system health metrics
  const fetchSystemHealth = async () => {
    try {
      const res = await AdminApiService.getSystemHealth();
      if (res.success && res.data) {
        setSystemHealth(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch system audit streams
  const fetchActivityLogs = async (params?: any) => {
    try {
      const res = await AdminApiService.getActivityLogs(params);
      if (res.success) {
        setActivityLogs(res.data);
        if (res.pagination) setLogsPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch global config
  const fetchGlobalSettings = async () => {
    try {
      const res = await AdminApiService.getSettings();
      if (res.success && res.data) {
        setAppSettings(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update global configuration settings
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadToast = toast.loading('Syncing configuration params...');
    try {
      const res = await AdminApiService.updateSettings(appSettings);
      if (res.success) {
        toast.success('Global settings updated and loaded successfully!', { id: loadToast });
      } else {
        toast.error('Could not sync global parameters.', { id: loadToast });
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error updating settings.', { id: loadToast });
    }
  };

  // Initialize and load default states
  useEffect(() => {
    const initTelemetry = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardMetrics(),
        fetchUsers({ page: 1, limit: 10 }),
        fetchDocuments({ page: 1, limit: 10 }),
        fetchGlobalSettings(),
      ]);
      setLoading(false);
    };
    initTelemetry();
  }, []);

  // Sync sub-tabs on demand
  useEffect(() => {
    if (currentTab === 'ai-requests' || currentTab === 'search-analytics') {
      fetchAnalyticsData();
    } else if (currentTab === 'storage') {
      fetchStorageStats();
    } else if (currentTab === 'system-health') {
      fetchSystemHealth();
    } else if (currentTab === 'activity-logs') {
      fetchActivityLogs({ page: 1, limit: 30 });
    } else if (currentTab === 'dashboard') {
      fetchDashboardMetrics();
    }
  }, [currentTab]);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  // Chart mocks / aggregates
  const registrationChart = [
    { name: 'Aug 2', users: 2 },
    { name: 'Aug 3', users: 5 },
    { name: 'Aug 4', users: 3 },
    { name: 'Aug 5', users: 8 },
    { name: 'Aug 6', users: 4 },
    { name: 'Aug 7', users: 10 },
    { name: 'Aug 8', users: 15 },
  ];

  const documentUploadChart = [
    { name: 'Aug 2', files: 4 },
    { name: 'Aug 3', files: 9 },
    { name: 'Aug 4', files: 12 },
    { name: 'Aug 5', files: 8 },
    { name: 'Aug 6', files: 15 },
    { name: 'Aug 7', files: 21 },
    { name: 'Aug 8', files: 14 },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 font-sans antialiased transition-colors duration-250">
      <Toaster position="top-right" />

      {/* ADMIN SIDEBAR */}
      <aside className="w-64 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-6">
          {/* Logo Heading */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-900 pb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-500/20">
              KB
            </div>
            <div>
              <span className="font-black text-xs block tracking-tight">ADMIN PORTAL</span>
              <span className="text-[9px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Enterprise console</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'users', label: 'User Accounts', icon: Users },
              { id: 'documents', label: 'Documents Index', icon: FileText },
              { id: 'ai-requests', label: 'Gemini Requests', icon: Sparkles },
              { id: 'search-analytics', label: 'Search Analytics', icon: Search },
              { id: 'storage', label: 'Storage & Volume', icon: HardDrive },
              { id: 'system-health', label: 'System Health', icon: Heart },
              { id: 'activity-logs', label: 'Activity Logs', icon: Activity },
              { id: 'reports', label: 'Report Compiler', icon: BarChart3 },
              { id: 'settings', label: 'System Settings', icon: Settings },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                      : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/30'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info footer and log out */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
              {user?.firstName ? `${user.firstName[0]}${user.lastName[0]}` : <User className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-black block truncate text-zinc-800 dark:text-zinc-200">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold block truncate">
                {user?.email}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 dark:border-zinc-800 dark:hover:bg-rose-950/20 text-xs font-black text-zinc-500 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            License Sign-Out
          </button>
        </div>
      </aside>

      {/* ADMIN WORKSPACE CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER / TOPBAR */}
        <header className="h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex items-center justify-between px-6 flex-shrink-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-700 dark:text-zinc-200 capitalize font-black">
              {currentTab.replace('-', ' ')}
            </span>
          </div>

          {/* Quick Actions / Theme / Notification */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications panel dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 overflow-hidden z-50 space-y-3"
                    >
                      <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-100 dark:border-zinc-900">
                        Notification Center
                      </h4>
                      <div className="space-y-3">
                        {notifications.map((n) => (
                          <div key={n.id} className="text-xs font-medium text-zinc-600 dark:text-zinc-400 space-y-1">
                            <p className="leading-relaxed text-zinc-850 dark:text-zinc-200">{n.text}</p>
                            <span className="text-[10px] text-zinc-400 font-bold block">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Accessing standard personal dashboard */}
            <button
              onClick={() => navigate('/dashboard')}
              className="ml-2 px-3.5 py-1.5 rounded-xl bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-[11px] font-black transition-colors"
            >
              Personal Dashboard
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <div className="flex-1 p-6 space-y-6">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2.5 py-32">
              <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="text-xs text-zinc-400 font-black uppercase tracking-wider">Syncing System Configurations...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {currentTab === 'dashboard' && dashboardData && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Summary metric cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AnalyticsCard
                      id="users-stat-card"
                      title="Total User Base"
                      value={dashboardData.stats.totalUsers}
                      subtitle={`${dashboardData.stats.activeUsers} active, ${dashboardData.stats.blockedUsers} suspended`}
                      icon={<Users className="w-5 h-5" />}
                      colorClass="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    />

                    <AnalyticsCard
                      id="docs-stat-card"
                      title="Stored Documents"
                      value={dashboardData.stats.totalDocuments}
                      subtitle={`${dashboardData.stats.documentsProcessed} processed successfully`}
                      icon={<FileText className="w-5 h-5" />}
                      colorClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    />

                    <AnalyticsCard
                      id="ai-stat-card"
                      title="AI Requests Today"
                      value={dashboardData.stats.aiRequestsToday}
                      subtitle={`Total tokens: ${dashboardData.stats.totalTokensUsed.toLocaleString()}`}
                      icon={<Sparkles className="w-5 h-5" />}
                      colorClass="bg-pink-500/10 text-pink-600 dark:text-pink-400"
                    />

                    <AnalyticsCard
                      id="storage-stat-card"
                      title="Quotas & Space Used"
                      value={(dashboardData.stats.storageUsed / (1024 * 1024)).toFixed(1) + ' MB'}
                      subtitle={`Average latency: ${dashboardData.stats.averageResponseTime}s`}
                      icon={<HardDrive className="w-5 h-5" />}
                      colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                  </div>

                  {/* Operational graphs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard
                      id="users-flow-chart"
                      title="New User Onboardings"
                      description="Account registrations created over the last 7 operating cycles"
                      type="area"
                      data={registrationChart}
                      keys={['users']}
                      colors={['#0ea5e9']}
                    />

                    <ChartCard
                      id="doc-uploads-flow-chart"
                      title="Knowledge Documents Uplink"
                      description="Knowledge files uploaded and indexed into semantic indexes"
                      type="bar"
                      data={documentUploadChart}
                      keys={['files']}
                      colors={['#6366f1']}
                    />
                  </div>

                  {/* Recent system logs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User activities */}
                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-4">
                      <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 tracking-tight">
                        User Operations Stream
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {dashboardData.recentActivities.length === 0 ? (
                          <p className="text-xs text-zinc-400 font-bold text-center py-12">No recent user actions logged.</p>
                        ) : (
                          dashboardData.recentActivities.map((act) => (
                            <div key={act._id} className="flex gap-3 items-start text-xs text-zinc-600 dark:text-zinc-400 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                              <Activity className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                  {act.action.toUpperCase()} - {act.details}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-bold block">
                                  {act.userId ? `${act.userId.firstName} ${act.userId.lastName}` : 'Anonymous'} | {new Date(act.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Admin actions */}
                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-4">
                      <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 tracking-tight">
                        Administrative Audit Stream
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {dashboardData.recentAdminLogs.length === 0 ? (
                          <p className="text-xs text-zinc-400 font-bold text-center py-12">No admin audits logged.</p>
                        ) : (
                          dashboardData.recentAdminLogs.map((log) => (
                            <div key={log._id} className="flex gap-3 items-start text-xs text-zinc-600 dark:text-zinc-400 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                              <ShieldAlert className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                                  {log.action}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-bold block">
                                  ADMIN: {log.adminId ? `${log.adminId.firstName} ${log.adminId.lastName}` : 'Root'} | {new Date(log.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* USER REGISTRY */}
              {currentTab === 'users' && (
                <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <UserTable
                    id="user-registry-table"
                    users={usersList}
                    pagination={usersPagination}
                    onFetchUsers={fetchUsers}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                  />
                </motion.div>
              )}

              {/* DOCUMENT REGISTRY */}
              {currentTab === 'documents' && (
                <motion.div key="documents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DocumentTable
                    id="doc-registry-table"
                    documents={docsList}
                    pagination={docsPagination}
                    onFetchDocuments={fetchDocuments}
                    onDeleteDocument={handleDeleteDoc}
                    onReprocessDocument={handleReprocessDoc}
                    onViewDocumentDetails={fetchDocDetails}
                  />
                </motion.div>
              )}

              {/* AI QUERY TELEMETRY */}
              {currentTab === 'ai-requests' && (
                <motion.div key="ai-requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <RequestTable id="ai-requests-table" requests={aiRequests} loading={false} />
                </motion.div>
              )}

              {/* SEARCH ANALYTICS */}
              {currentTab === 'search-analytics' && (
                <motion.div key="search-analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Average Search Latency</span>
                      <h4 className="text-2xl font-black text-zinc-800 dark:text-zinc-100">{searchAnalytics?.averageSearchTime || 120} ms</h4>
                      <p className="text-[10px] text-zinc-400 font-bold">Calculated on semantic indexes.</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Retrieval Success Rate</span>
                      <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{searchAnalytics?.searchSuccessRate || 96.5}%</h4>
                      <p className="text-[10px] text-emerald-500 font-bold">Successful hybrid searches.</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Zero Result Searches</span>
                      <h4 className="text-2xl font-black text-zinc-800 dark:text-zinc-100">{searchAnalytics?.noResultSearches?.length || 0} alerts</h4>
                      <p className="text-[10px] text-rose-500 font-bold">Queries returning empty vectors.</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-4">
                    <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 tracking-tight">
                      Most Searched Topics & Terms
                    </h4>
                    <div className="space-y-2.5">
                      {searchAnalytics?.mostSearchedTopics?.length === 0 ? (
                        <p className="text-xs text-zinc-400 font-bold text-center py-12">No search history recorded.</p>
                      ) : (
                        searchAnalytics?.mostSearchedTopics?.map((topic: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono">"{topic.topic}"</span>
                            <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 px-2.5 py-0.5 rounded-md">{topic.count} searches</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STORAGE ALLOCATIONS */}
              {currentTab === 'storage' && (
                <motion.div key="storage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <StorageCard id="storage-metrics-dashboard" storageData={storageStats} loading={false} />
                </motion.div>
              )}

              {/* SYSTEM HEALTH */}
              {currentTab === 'system-health' && (
                <motion.div key="system-health" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SystemHealthCard
                    id="live-system-health"
                    health={systemHealth}
                    loading={false}
                    onRefresh={fetchSystemHealth}
                  />
                </motion.div>
              )}

              {/* ACTIVITY & AUDIT LOGS */}
              {currentTab === 'activity-logs' && (
                <motion.div key="activity-logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ActivityLogTable
                    id="system-operations-activity-table"
                    logs={activityLogs}
                    pagination={logsPagination}
                    onFetchLogs={fetchActivityLogs}
                    loading={false}
                  />
                </motion.div>
              )}

              {/* REPORTS COMPILER */}
              {currentTab === 'reports' && (
                <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ReportGenerator id="system-reports-generator" />
                </motion.div>
              )}

              {/* SYSTEM SETTINGS */}
              {currentTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <form onSubmit={handleUpdateSettings} className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] space-y-6">
                    <div>
                      <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 tracking-tight">
                        Global Operational Parameters
                      </h4>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                        Configure general limits, maintenance modes, and models across the application.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Application Display Title</label>
                          <input
                            type="text"
                            value={appSettings.appName}
                            onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Storage Limit Quota per account (Bytes)</label>
                          <input
                            type="number"
                            value={appSettings.storageLimitBytes}
                            onChange={(e) => setAppSettings({ ...appSettings, storageLimitBytes: parseInt(e.target.value) })}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Maximum Single File Upload Size (Bytes)</label>
                          <input
                            type="number"
                            value={appSettings.maxUploadSizeBytes}
                            onChange={(e) => setAppSettings({ ...appSettings, maxUploadSizeBytes: parseInt(e.target.value) })}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Gemini API LLM Endpoint</label>
                          <select
                            value={appSettings.aiModelName}
                            onChange={(e) => setAppSettings({ ...appSettings, aiModelName: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                          >
                            <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                            <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Daily Token Allocation Quota</label>
                          <input
                            type="number"
                            value={appSettings.tokenLimitPerUserDay}
                            onChange={(e) => setAppSettings({ ...appSettings, tokenLimitPerUserDay: parseInt(e.target.value) })}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="space-y-2 pt-1.5">
                          <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                            <div>
                              <span className="text-xs font-black block text-zinc-700 dark:text-zinc-300">Application Maintenance Mode</span>
                              <span className="text-[10px] text-zinc-400 font-medium block">Puts application offline for normal accounts.</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={appSettings.maintenanceMode}
                              onChange={(e) => setAppSettings({ ...appSettings, maintenanceMode: e.target.checked })}
                              className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md cursor-pointer transition-colors"
                    >
                      Sync All Parameters
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
