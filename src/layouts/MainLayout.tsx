import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationsDropdown } from '../components/NotificationsDropdown';
import {
  Sun,
  Moon,
  Laptop,
  LogOut,
  User,
  Sparkles,
  Menu,
  X,
  FileText,
  Shield,
  LayoutDashboard,
  MessageSquare,
  Library,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCog,
  HardDrive,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Layout states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Persistence for desktop sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close drawer on path change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Successfully logged out.');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const getInitials = () => {
    if (!user) return 'AI';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'AI';
  };

  const sidebarItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Semantic Search',
      path: '/search',
      icon: Search,
      disabled: false,
    },
    {
      label: 'Knowledge Base',
      path: '/knowledge-base',
      icon: Library,
      disabled: false,
    },
    {
      label: 'AI Chat Room',
      path: '/ai-chat',
      icon: MessageSquare,
      disabled: false,
    },
    {
      label: 'Account Profile',
      path: '/profile',
      icon: UserCog,
    },
    {
      label: 'App Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  const dynamicSidebarItems = [...sidebarItems];
  if (user?.role === 'admin') {
    dynamicSidebarItems.push({
      label: 'Admin Console',
      path: '/admin',
      icon: Shield,
    });
  }

  // Bypass main layout completely for landing page
  if (location.pathname === '/') {
    return <>{children}</>;
  }

  // Render Dashboard Layout for Logged-In Users
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-200">
        
        {/* A. MOBILE SIDEBAR DRAWER BACKGROUND SHADOW */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="md:hidden fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40"
            />
          )}
        </AnimatePresence>

        {/* B. MOBILE SIDEBAR DRAWER */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-6 z-50 shadow-2xl"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold tracking-tight text-lg">KnowledgeAI</span>
                </Link>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-150 dark:border-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer User Widget */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/45 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-700 dark:text-zinc-300">
                  {getInitials()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold leading-tight truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Navigation list in drawer */}
              <nav className="flex-1 flex flex-col gap-1.5">
                {dynamicSidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                        isCurrent
                          ? 'bg-zinc-900 border-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-950 shadow-md'
                          : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/40'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer footer actions */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200/40 hover:border-red-500 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50/20 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* C. DESKTOP PERMANENT / COLLAPSIBLE SIDEBAR */}
        <aside
          className={`hidden md:flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shrink-0 sticky top-0 h-screen transition-all duration-300 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Sidebar Top Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-100 dark:border-zinc-900 select-none">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              {!sidebarCollapsed && (
                <span className="font-extrabold tracking-tight text-base animate-fade-in text-zinc-900 dark:text-zinc-50">
                  KnowledgeAI
                </span>
              )}
            </Link>
          </div>

          {/* Sidebar user state widget if expanded */}
          {!sidebarCollapsed && (
            <div className="p-4 mx-4 my-3.5 rounded-2xl bg-zinc-50 border border-zinc-150 dark:bg-zinc-900/40 dark:border-zinc-900/50 flex items-center gap-3 animate-fade-in select-none">
              <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300 shadow-sm">
                {getInitials()}
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <p className="text-[11px] font-black leading-tight text-zinc-800 dark:text-zinc-200 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-none truncate mt-0.5">
                  {user.role === 'admin' ? 'SYSTEM ADMIN' : 'FREE ACCOUNT'}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Links List */}
          <nav className="flex-1 flex flex-col gap-1.5 px-3.5 py-4">
            {dynamicSidebarItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-xs font-bold transition-all border relative group ${
                    isCurrent
                      ? 'bg-zinc-950 border-zinc-950 text-zinc-50 dark:bg-zinc-150 dark:border-zinc-150 dark:text-zinc-950 shadow-md'
                      : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/30'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 group-hover:scale-105 transition-transform" />
                  {!sidebarCollapsed && (
                    <span className="animate-fade-in tracking-tight">{item.label}</span>
                  )}

                  {/* Tiny floating hover hint if collapsed */}
                  {sidebarCollapsed && (
                    <span className="opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 absolute left-20 ml-2 py-1 px-2.5 rounded-lg bg-zinc-950 text-white text-[10px] font-bold shadow-xl border border-zinc-800 z-50 pointer-events-none whitespace-nowrap transition-all duration-150">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar bottom control (sign out + collapse trigger) */}
          <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-900 flex flex-col gap-2">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50/20 border border-transparent transition-all group relative`}
              title={sidebarCollapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
              {!sidebarCollapsed && <span className="tracking-tight">Sign Out</span>}
              {sidebarCollapsed && (
                <span className="opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 absolute left-20 ml-2 py-1 px-2.5 rounded-lg bg-red-600 text-white text-[10px] font-bold shadow-xl z-50 pointer-events-none whitespace-nowrap transition-all duration-150">
                  Sign Out
                </span>
              )}
            </button>

            {/* Collapse Trigger desktop button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex items-center justify-center p-2 rounded-xl border border-zinc-150 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-800 dark:border-zinc-850 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 shadow-sm transition-all mt-1"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* D. RIGHT PANEL CONTENT AREA (CONTAINING TOP NAV BAR + MAIN PAGE FRAME) */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          
          {/* Desktop & Mobile Navbar */}
          <header className="h-16 border-b border-zinc-200 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/80 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-8">
            <div className="flex items-center gap-3">
              {/* Hamburger to trigger drawer on mobile */}
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="md:hidden p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 transition-all text-zinc-500 shadow-sm"
                aria-label="Toggle Side Drawer"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Breadcrumb section on Navbar */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                <span>KnowledgeAI</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-zinc-600 dark:text-zinc-300 font-extrabold truncate max-w-[120px]">
                  {isActive('/dashboard') ? 'Dashboard' : isActive('/settings') ? 'Settings' : isActive('/profile') ? 'Profile' : 'Workspace'}
                </span>
              </div>
            </div>

            {/* Right side navigation utilities */}
            <div className="flex items-center gap-3.5">
              
              {/* Dynamic Notification Bell Dropdown component */}
              <NotificationsDropdown />

              {/* Theme Settings Toggle (Light, Dark, System cycling) */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl p-0.5 border border-zinc-200/40 dark:border-zinc-800/40 shadow-inner select-none">
                {[
                  { key: 'light', icon: Sun, title: 'Light Theme' },
                  { key: 'dark', icon: Moon, title: 'Dark Theme' },
                  { key: 'system', icon: Laptop, title: 'System Theme' },
                ].map((t) => {
                  const CurrentIcon = t.icon;
                  const isSel = theme === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => {
                        setTheme(t.key as any);
                        toast.success(`${t.title} enabled.`);
                      }}
                      className={`p-1.5 rounded-lg transition-all ${
                        isSel
                          ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                          : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                      title={t.title}
                    >
                      <CurrentIcon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>

              {/* Profile Shortcut Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="w-8.5 h-8.5 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-zinc-200 hover:border-indigo-500 dark:border-zinc-800 dark:hover:border-indigo-400 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300 shadow-sm transition-all"
                  aria-label="User Dropdown"
                >
                  {getInitials()}
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-xl z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b border-zinc-100 dark:border-zinc-900 text-left">
                          <p className="text-xs font-bold leading-tight">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>
                        <div className="p-1.5 flex flex-col gap-1">
                          <Link
                            to="/profile"
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/40 rounded-xl transition-all text-left"
                          >
                            <User className="w-3.5 h-3.5" /> View Profile
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/40 rounded-xl transition-all text-left"
                          >
                            <Settings className="w-3.5 h-3.5" /> App Settings
                          </Link>
                        </div>
                        <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50/40 dark:hover:bg-red-950/10 rounded-xl transition-all text-left"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </header>

          {/* Actual protected workspace viewport page content */}
          <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 md:px-8">
            {children}
          </main>
        </div>

      </div>
    );
  }

  // E. DEFAULT PUBLIC LAYOUT FRAME (FOR LANDING, LOGIN, SIGNUP, PASSWORDS)
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-200">
      
      {/* Simple Public Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/60 bg-zinc-50/80 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold tracking-tight text-base">KnowledgeAI</span>
          </Link>

          {/* Desktop public buttons */}
          <div className="flex items-center gap-4">
            
            {/* Theme settings cycler */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl p-0.5 border border-zinc-200/40 dark:border-zinc-800/40 shadow-inner select-none">
              {[
                { key: 'light', icon: Sun, title: 'Light Mode' },
                { key: 'dark', icon: Moon, title: 'Dark Mode' },
                { key: 'system', icon: Laptop, title: 'System Mode' },
              ].map((t) => {
                const CurrentIcon = t.icon;
                const isSel = theme === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      setTheme(t.key as any);
                      toast.success(`${t.title} enabled.`);
                    }}
                    className={`p-1.5 rounded-lg transition-all ${
                      isSel
                        ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                        : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                    title={t.title}
                  >
                    <CurrentIcon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>

            <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold rounded-xl text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-xs font-black rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Public Page Centered Container */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      {/* Simple Public Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 transition-colors py-8 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold">
              KnowledgeAI © {new Date().getFullYear()} — All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};
export default MainLayout;
