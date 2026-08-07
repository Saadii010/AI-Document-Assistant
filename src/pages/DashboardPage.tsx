import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ApiService } from '../services/api';
import { DashboardCard } from '../components/DashboardCard';
import { ChartCard } from '../components/ChartCard';
import { RecentActivityList } from '../components/RecentActivityList';
import { QuickActions } from '../components/QuickActions';
import { SearchOverlay } from '../components/SearchOverlay';
import {
  FileText,
  MessageSquare,
  Cpu,
  HardDrive,
  Calendar,
  Sparkles,
  ChevronRight,
  Search,
  Star,
  ExternalLink,
  Plus,
  Clock,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OverviewData {
  stats: {
    totalDocuments: number;
    totalChats: number;
    aiRequests: number;
    storageUsed: number;
    storageLimit: number;
    storagePercentage: number;
    documentsTrend: number;
    chatsTrend: number;
    requestsTrend: number;
  };
  recentDocuments: Array<{
    id: string;
    _id?: string;
    name: string;
    size: number;
    mimeType: string;
    category: string;
    favorite: boolean;
    createdAt: string;
  }>;
  recentChats: Array<{
    id: string;
    _id?: string;
    title: string;
    messageCount: number;
    favorite: boolean;
    lastMessage: string;
    updatedAt: string;
  }>;
}

interface ChartsData {
  monthlyActivity: Array<{ month: string; uploads: number; chats: number }>;
  storageUsageTrend: Array<{ month: string; used: number }>;
  documentTypes: Array<{ name: string; value: number }>;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();

  // Component States
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'documents' | 'chats'>('documents');
  const [searchOpen, setSearchOpen] = useState(false);

  // Fetch Dashboard Core Data
  const fetchDashboardData = async () => {
    try {
      const [overviewRes, chartsRes] = await Promise.all([
        ApiService.get<OverviewData>('/dashboard/overview'),
        ApiService.get<ChartsData>('/dashboard/charts'),
      ]);

      if (overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data);
      }
      if (chartsRes.success && chartsRes.data) {
        setCharts(chartsRes.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Setup Cmd+K / Ctrl+K listener for global search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Format File Size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Toggle favorite trigger
  const handleToggleDocFavorite = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await ApiService.patch(`/dashboard/documents/${docId}/favorite`);
      if (response.success && overview) {
        setOverview({
          ...overview,
          recentDocuments: overview.recentDocuments.map((doc) =>
            (doc.id || doc._id) === docId ? { ...doc, favorite: !doc.favorite } : doc
          ),
        });
        toast.success(response.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update favorite status.');
    }
  };

  const handleToggleChatFavorite = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await ApiService.patch(`/dashboard/chats/${chatId}/favorite`);
      if (response.success && overview) {
        setOverview({
          ...overview,
          recentChats: overview.recentChats.map((chat) =>
            (chat.id || chat._id) === chatId ? { ...chat, favorite: !chat.favorite } : chat
          ),
        });
        toast.success(response.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update favorite status.');
    }
  };

  const handleNavigate = (route: string, label: string) => {
    toast.success(`Navigating to ${label}`);
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-16">
      {/* 1. Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex flex-col gap-1">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            <span>KnowledgeAI</span>
            <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
            <span className="text-zinc-800 dark:text-zinc-200 font-extrabold">Dashboard</span>
          </div>
          {/* Title Welcomer */}
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Welcome back, {user?.firstName || 'User'}
            <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500 animate-pulse" />
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-none">
            Your personal vector search workspace is ready.
          </p>
        </div>

        {/* Global Search Hotkey Bar */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 shadow-inner">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>{formattedDate}</span>
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 shadow-sm transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search files...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-850 rounded text-zinc-400">
              Ctrl+K
            </kbd>
          </button>
        </div>
      </div>

      {/* 2. Overview Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard
          title="Total Documents"
          value={loading ? 0 : overview?.stats.totalDocuments || 0}
          subtitle="Registered local source PDFs/TXTs"
          icon={FileText}
          loading={loading}
          trend={{ value: overview?.stats.documentsTrend || 12, isPositive: true }}
        />
        <DashboardCard
          title="Conversations"
          value={loading ? 0 : overview?.stats.totalChats || 0}
          subtitle="Active document chat transcripts"
          icon={MessageSquare}
          loading={loading}
          trend={{ value: overview?.stats.chatsTrend || 8, isPositive: true }}
        />
        <DashboardCard
          title="AI Queries"
          value={loading ? 0 : overview?.stats.aiRequests || 0}
          subtitle="Model responses generated"
          icon={Cpu}
          loading={loading}
          trend={{ value: overview?.stats.requestsTrend || 24, isPositive: true }}
        />
        {/* Storage Card */}
        {loading ? (
          <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm flex flex-col gap-4 animate-pulse select-none">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-9 h-9 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-6 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full" />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                Storage Allocation
              </span>
              <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-600 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-300 shadow-inner group-hover:bg-zinc-900 group-hover:text-zinc-50 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-950 transition-all duration-300">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
                  {overview?.stats.storageUsed.toFixed(1)} MB
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold">
                  of {overview?.stats.storageLimit} MB limit
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(overview?.stats.storagePercentage || 0, 100)}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 3. Quick Actions Header & Bento Container */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
          Quick Actions Launchpad
        </h2>
        <QuickActions onSearchClick={() => setSearchOpen(true)} onNavigate={handleNavigate} />
      </div>

      {/* 4. Analytics Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ChartCard
            title="Monthly Search and Interaction Volume"
            subtitle="Correlating uploaded contexts and completed conversation records"
            loading={loading}
            type="activity"
            data={charts}
            resolvedTheme={resolvedTheme}
          />
        </div>
        <div className="lg:col-span-4">
          <ChartCard
            title="Document Types Distribution"
            subtitle="Categorized format distribution of files in knowledge base"
            loading={loading}
            type="categories"
            data={charts}
            resolvedTheme={resolvedTheme}
          />
        </div>
      </div>

      {/* 5. Bento Row: Activity Feed & Resources Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column A: Activity Logs */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col gap-0.5 pb-2 border-b border-zinc-100 dark:border-zinc-900">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Trace Log Feed</h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Security audits and upload records</p>
          </div>
          <RecentActivityList activities={overview?.recentDocuments ? (overview as any).activities || [] : []} loading={loading} />
        </div>

        {/* Column B: Recent Documents / Chats Switcher */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Active Library</h3>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Recently updated documents and AI dialogs</p>
            </div>

            {/* Selector Tab Pills */}
            <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl self-start sm:self-auto border border-zinc-200/40 dark:border-zinc-800/40">
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'documents'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Documents</span>
              </button>
              <button
                onClick={() => setActiveTab('chats')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'chats'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Conversations</span>
              </button>
            </div>
          </div>

          {/* List display */}
          <div className="flex-1 min-h-[300px]">
            {loading ? (
              <div className="flex flex-col gap-3.5 animate-pulse select-none">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl" />
                ))}
              </div>
            ) : activeTab === 'documents' ? (
              (!overview?.recentDocuments || overview.recentDocuments.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                  <div>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No documents in library</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Your uploaded PDFs and text docs will list here</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {overview.recentDocuments.map((doc, idx) => (
                    <motion.div
                      key={doc.id || doc._id || idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      onClick={() => handleNavigate(`/knowledge-base/${doc.id || doc._id}`, 'Document Reader')}
                      className="p-3 border border-zinc-150 bg-zinc-50/20 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950 dark:hover:border-zinc-800/60 rounded-xl flex items-center justify-between gap-4 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-white border border-zinc-200/50 text-indigo-500 dark:bg-zinc-900 dark:border-zinc-800 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0 leading-tight text-left">
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {doc.name}
                          </p>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                            {formatBytes(doc.size)} • {doc.category || 'General'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleDocFavorite(doc.id || doc._id || '', e)}
                          className={`p-1.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 text-zinc-400 transition-colors ${
                            doc.favorite ? 'text-yellow-500' : 'hover:text-yellow-500'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              (!overview?.recentChats || overview.recentChats.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                  <div>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No chats initiated</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Ask questions and your dialog traces will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {overview.recentChats.map((chat, idx) => (
                    <motion.div
                      key={chat.id || chat._id || idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      onClick={() => handleNavigate(`/ai-chat/${chat.id || chat._id}`, 'AI Chat Room')}
                      className="p-3 border border-zinc-150 bg-zinc-50/20 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950 dark:hover:border-zinc-800/60 rounded-xl flex items-center justify-between gap-4 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-white border border-zinc-200/50 text-emerald-500 dark:bg-zinc-900 dark:border-zinc-800 rounded-lg">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0 leading-tight text-left">
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {chat.title}
                          </p>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-lg font-medium">
                            {chat.lastMessage || 'No messages yet.'} • {chat.messageCount} messages
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleChatFavorite(chat.id || chat._id || '', e)}
                          className={`p-1.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 text-zinc-400 transition-colors ${
                            chat.favorite ? 'text-yellow-500' : 'hover:text-yellow-500'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Global Search Overlay */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectDocument={(id) => toast.success(`Document selected: ${id}`)}
        onSelectChat={(id) => toast.success(`Chat selected: ${id}`)}
      />
    </div>
  );
};
export default DashboardPage;
