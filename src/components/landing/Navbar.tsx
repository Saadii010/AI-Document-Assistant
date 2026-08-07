import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => handleSmoothScroll(e, '#home')}
          className="flex items-center gap-2.5 group"
          aria-label="KnowledgeAI Home"
        >
          <div className="p-2 rounded-xl bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 shadow-md group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-indigo-400 dark:text-indigo-600" />
          </div>
          <span className="font-black tracking-tight text-xl bg-gradient-to-r from-zinc-950 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400 bg-clip-text text-transparent">
            KnowledgeAI
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-900/40 p-1.5 rounded-full border border-zinc-200/30 dark:border-zinc-800/30">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="px-4 py-1.5 text-xs font-semibold rounded-full text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Theme Switcher */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-full p-0.5 border border-zinc-200/40 dark:border-zinc-800/40 shadow-inner select-none">
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
                  className={`p-1.5 rounded-full transition-all ${
                    isSel
                      ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                  title={t.title}
                  aria-label={t.title}
                >
                  <CurrentIcon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          <div className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold rounded-full bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm hover:translate-x-0.5 transition-all"
            >
              Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4.5 py-2 text-xs font-bold rounded-full bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Controls (Menu Toggle & Theme Selector) */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 py-6 overflow-hidden shadow-xl"
          >
            <nav className="flex flex-col gap-4 mb-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 mb-6" />

            <div className="flex flex-col gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold rounded-xl bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-bold rounded-xl bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Navbar;
