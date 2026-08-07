import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { 
  Search, 
  Sparkles, 
  History, 
  Tag, 
  Folder, 
  Calendar, 
  Bookmark, 
  Trash2, 
  Mic, 
  X, 
  Grid, 
  List, 
  BookmarkPlus, 
  Activity, 
  Loader2,
  ChevronRight,
  Info,
  Clock,
  ArrowRight,
  Sparkle
} from 'lucide-react';

import { SearchApiClient } from '../components/search/searchApi';
import { SearchFilters } from '../components/search/SearchFilters';
import { SearchResultCard } from '../components/search/SearchResultCard';
import { SearchAnalyticsCard } from '../components/search/SearchAnalyticsCard';
import { DocumentApiService } from '../services/documentApi';
import { 
  ISearchFilters, 
  ISearchResult, 
  ISearchStats, 
  ISavedSearch, 
  ISearchContext 
} from '../components/search/types';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();

  // Search Core States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchType, setSearchType] = useState<'semantic' | 'keyword' | 'hybrid'>('hybrid');
  const [filters, setFilters] = useState<ISearchFilters>({
    fileTypes: [],
    tags: [],
    isFavorite: undefined,
    isArchived: undefined,
  });

  // UI / Layout States
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeTab, setActiveTab] = useState<'results' | 'analytics'>('results');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activePreview, setActivePreview] = useState<ISearchResult | null>(null);
  
  // Data States
  const [results, setResults] = useState<ISearchResult[]>([]);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [initialContext, setInitialContext] = useState<ISearchContext | null>(null);
  const [analytics, setAnalytics] = useState<ISearchStats | null>(null);
  const [savedSearches, setSavedSearches] = useState<ISavedSearch[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Ref pointers
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search query to fetch suggestions on typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load context, saved searches, analytics, and available meta filters on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length > 1) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  // Global Keyboard Shortcut: Ctrl + K (or Meta + K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside clicks to close autocomplete
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target as Node) &&
        searchInputRef.current !== e.target
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const loadInitialData = async () => {
    try {
      const [contextData, savedData, analyticsData, docsRes] = await Promise.all([
        SearchApiClient.getPopularContext().catch(() => null),
        SearchApiClient.getSavedSearches().catch(() => []),
        SearchApiClient.getAnalytics().catch(() => null),
        DocumentApiService.getDocuments({ limit: 100 }).catch(() => null)
      ]);

      if (contextData) setInitialContext(contextData);
      if (savedData) setSavedSearches(savedData);
      if (analyticsData) setAnalytics(analyticsData);

      // Aggregate tags and categories dynamically from real document corpus
      if (docsRes?.success && docsRes.data?.documents) {
        const tagsSet = new Set<string>();
        const catsSet = new Set<string>();
        docsRes.data.documents.forEach((d: any) => {
          if (d.tags && Array.isArray(d.tags)) {
            d.tags.forEach((t) => t.trim() && tagsSet.add(t.trim()));
          }
          if (d.category) {
            catsSet.add(d.category);
          }
        });
        setAvailableTags(Array.from(tagsSet));
        setAvailableCategories(Array.from(catsSet));
      }
    } catch (err) {
      console.error('Error loading initial search context:', err);
    }
  };

  const fetchSuggestions = async (q: string) => {
    try {
      const data = await SearchApiClient.getSuggestions(q);
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const executeSearch = async (queryToSearch = searchQuery, overrideFilters = filters) => {
    const targetQuery = queryToSearch.trim();
    if (!targetQuery) {
      toast.error('Please enter a query or select a suggestion.');
      return;
    }

    setShowSuggestions(false);
    setIsSearching(true);
    try {
      const response = await SearchApiClient.search(targetQuery, overrideFilters, 20, searchType);
      setResults(response.results);
      setSearchTime(response.stats.responseTimeMs);
      
      // Reload history and analytics to keep UI in perfect sync
      const [historyData, analyticsData] = await Promise.all([
        SearchApiClient.getHistory().catch(() => []),
        SearchApiClient.getAnalytics().catch(() => null)
      ]);

      if (initialContext) {
        setInitialContext((prev) => prev ? {
          ...prev,
          recentSearches: historyData.map((h: any) => ({ query: h.query, lastSearchedAt: h.lastSearchedAt }))
        } : null);
      }
      if (analyticsData) setAnalytics(analyticsData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete search query.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (queryText: string) => {
    setSearchQuery(queryText);
    executeSearch(queryText);
  };

  const handleResetFilters = () => {
    setFilters({
      fileTypes: [],
      tags: [],
      isFavorite: undefined,
      isArchived: undefined,
    });
    toast.success('Search filters reset successfully.');
  };

  const handleSaveSearch = async () => {
    if (!searchQuery.trim()) return;
    const name = prompt('Enter a friendly name for this saved search:', `Search: ${searchQuery}`);
    if (!name) return;

    try {
      const saved = await SearchApiClient.saveSearch(name, searchQuery, filters);
      setSavedSearches((prev) => [saved, ...prev]);
      toast.success(`Search saved as "${name}"`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save search query.');
    }
  };

  const handleDeleteSavedSearch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await SearchApiClient.deleteSavedSearch(id);
      setSavedSearches((prev) => prev.filter((s) => s._id !== id));
      toast.success('Saved search removed.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete saved search.');
    }
  };

  const handleClearHistory = async () => {
    try {
      await SearchApiClient.clearHistory();
      if (initialContext) {
        setInitialContext({
          ...initialContext,
          recentSearches: [],
        });
      }
      toast.success('Search history cleared.');
    } catch (err) {
      toast.error('Failed to clear search history.');
    }
  };

  const handleRemoveHistoryItem = async (queryToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await SearchApiClient.clearHistory(queryToDelete);
      if (initialContext) {
        setInitialContext({
          ...initialContext,
          recentSearches: initialContext.recentSearches.filter((h) => h.query !== queryToDelete),
        });
      }
      toast.success('Item removed from history.');
    } catch (err) {
      toast.error('Failed to remove history item.');
    }
  };

  const handleAskAIHelper = (result: ISearchResult) => {
    // Navigates directly to AI Chat Room, pre-setting question and document context
    navigate('/ai-chat', {
      state: {
        prefilledQuery: `I found this excerpt in "${result.documentName}" (Page ${result.pageNumber}):\n\n"${result.text}"\n\nCan you explain this paragraph in detail and list the main takeaways?`,
        documentId: result.documentId
      }
    });
    toast.success('Preloading chunk context into AI Chat Assistant...');
  };

  const triggerVoicePlaceholder = () => {
    toast('Voice search is initialized as placeholder. Complete device permissions in browser to speak.', {
      icon: '🎙️',
      style: {
        borderRadius: '12px',
        background: '#18181b',
        color: '#fff',
      },
    });
  };

  const isQueryActive = searchQuery.trim().length > 0;

  return (
    <div id="search-page-wrapper" className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 pb-20">
      
      {/* A. Dynamic App Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/60 pb-5">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-zinc-900 dark:text-zinc-50 fill-zinc-900 dark:fill-zinc-50 animate-pulse" />
            <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Enterprise Semantic Explorer</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Search intelligently across your knowledge base using semantic vectors, keyword filters, and hybrid relevance scoring.
          </p>
        </div>

        {/* Top level Section Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl self-start md:self-center border border-zinc-200/40 dark:border-zinc-800/40">
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'results'
                ? 'bg-white text-zinc-950 dark:bg-zinc-850 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Search Workspace
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-zinc-950 dark:bg-zinc-850 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Performance Analytics
          </button>
        </div>
      </div>

      {activeTab === 'results' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* B. Filter Panel Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <SearchFilters 
              filters={filters}
              setFilters={setFilters}
              onReset={handleResetFilters}
              availableTags={availableTags}
              availableCategories={availableCategories}
            />

            {/* Saved Searches list panel */}
            {savedSearches.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-150 dark:border-zinc-800">
                  <Bookmark className="w-4 h-4 text-zinc-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Saved Queries</h4>
                </div>
                <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {savedSearches.map((saved) => (
                    <div
                      key={saved._id}
                      onClick={() => {
                        setSearchQuery(saved.query);
                        setFilters(saved.filters || {});
                        executeSearch(saved.query, saved.filters);
                      }}
                      className="group/saved flex items-center justify-between p-2 rounded-xl text-left hover:bg-zinc-50 dark:hover:bg-zinc-950 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800/60 cursor-pointer transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200 truncate">{saved.name}</p>
                        <p className="text-[10px] text-zinc-450 truncate mt-0.5 font-semibold">"{saved.query}"</p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSavedSearch(saved._id, e)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-red-500 opacity-0 group-hover/saved:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all shrink-0 ml-1"
                        title="Remove saved search"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* C. Central Search Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Unified Search Input block */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') executeSearch();
                    }}
                    placeholder="Search query... (e.g. key milestones or explain quantum theories) [Ctrl+K]"
                    className="w-full pl-12 pr-11 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-xs font-semibold text-zinc-850 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 shadow-sm placeholder:text-zinc-400 select-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setResults([]);
                        setSearchTime(null);
                      }}
                      className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={triggerVoicePlaceholder}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    title="Voice search (Placeholder)"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => executeSearch()}
                  disabled={isSearching}
                  className="px-6 rounded-2xl bg-zinc-950 hover:bg-zinc-850 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-extrabold text-xs tracking-wide shadow-md hover:shadow-lg transition-all shrink-0 flex items-center gap-2 border border-transparent"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Execute</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* D. Autocomplete & suggestions panel */}
              <AnimatePresence>
                {showSuggestions && (suggestions.length > 0 || (initialContext && initialContext.recentSearches.length > 0)) && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-30 left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl overflow-hidden max-h-96 overflow-y-auto text-left"
                  >
                    {/* Autocomplete dynamic items */}
                    {suggestions.length > 0 && (
                      <div className="p-2 border-b border-zinc-150 dark:border-zinc-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block px-3 py-1.5">Suggestions</span>
                        {suggestions.map((sug, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSuggestionClick(sug)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950 cursor-pointer transition-all"
                          >
                            <Sparkle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{sug}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recent search terms */}
                    {initialContext && initialContext.recentSearches.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Recent Searches</span>
                          <button
                            onClick={handleClearHistory}
                            className="text-[10px] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold transition-colors"
                          >
                            Clear All
                          </button>
                        </div>
                        {initialContext.recentSearches.map((hist, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSuggestionClick(hist.query)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950 cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <History className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate">{hist.query}</span>
                            </div>
                            <button
                              onClick={(e) => handleRemoveHistoryItem(hist.query, e)}
                              className="p-1 text-zinc-400 hover:text-red-500 rounded hover:bg-zinc-100 dark:hover:bg-zinc-850/60 transition-colors"
                              title="Delete from history"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* E. Search Type Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5">
                {['hybrid', 'semantic', 'keyword'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSearchType(type as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                      searchType === type
                        ? 'bg-zinc-900 border-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 shadow-sm'
                        : 'bg-zinc-50 border-transparent text-zinc-500 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    {type} Search
                  </button>
                ))}
              </div>

              {/* Results layout view mode switch */}
              <div className="flex items-center gap-1.5 border-l border-zinc-200/60 dark:border-zinc-800/60 pl-3">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl border transition-all ${
                    viewMode === 'list'
                      ? 'bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800'
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl border transition-all ${
                    viewMode === 'grid'
                      ? 'bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800'
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* F. Results Display and Stats Header */}
            {isSearching ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/65 rounded-2xl p-5 space-y-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                      <div className="w-48 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="w-full h-16 rounded bg-zinc-100 dark:bg-zinc-950" />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                
                {/* Statistics panel */}
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1 font-semibold">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-zinc-400" />
                    <span>
                      Found {results.length} results ({searchTime || 0} ms) using {searchType} search
                    </span>
                  </div>
                  <button
                    onClick={handleSaveSearch}
                    className="flex items-center gap-1.5 text-[11px] text-zinc-900 dark:text-zinc-100 hover:underline font-extrabold"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    Save Search Query
                  </button>
                </div>

                {/* Results list/grid layout */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-col gap-4'}>
                  {results.map((result) => (
                    <SearchResultCard
                      key={result.chunkId}
                      result={result}
                      searchQuery={searchQuery}
                      onOpenPreview={setActivePreview}
                      onAskAI={handleAskAIHelper}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </div>
            ) : isQueryActive ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-10 flex flex-col items-center text-center space-y-4 shadow-sm">
                <div className="p-4 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/30 dark:border-zinc-800 text-zinc-400 shrink-0">
                  <Search className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No matching excerpts found</h3>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto">
                    We couldn't find matches for "{searchQuery}" in your uploaded documents. Consider expanding filters, checking typos, or querying another phrase.
                  </p>
                </div>
                
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
                  >
                    Clear Active Filters
                  </button>
                  <button
                    onClick={() => {
                      navigate('/ai-chat', { state: { prefilledQuery: `Explain topics related to: ${searchQuery}` } });
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-zinc-850 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-250 transition-colors shadow flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-zinc-500 text-zinc-500" />
                    <span>Ask AI Conversational Assistant Instead</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                
                {/* Suggested Queries */}
                {initialContext && initialContext.suggestedQueries.length > 0 && (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Suggested Exploration Queries</h4>
                    <div className="flex flex-col gap-2">
                      {initialContext.suggestedQueries.map((queryText, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(queryText)}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50/60 hover:bg-zinc-50 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/80 border border-zinc-200/20 text-xs font-bold text-zinc-800 dark:text-zinc-200 text-left transition-colors"
                        >
                          <span className="truncate">{queryText}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular categories and tags summary */}
                <div className="space-y-6">
                  {initialContext && initialContext.popularCategories.length > 0 && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Popular Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {initialContext.popularCategories.map((cat, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setFilters((prev) => ({ ...prev, category: cat }));
                              executeSearch(searchQuery || 'Summarize', { ...filters, category: cat });
                            }}
                            className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/80 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-zinc-350"
                          >
                            <Folder className="w-3.5 h-3.5 text-zinc-400" />
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {initialContext && initialContext.popularTags.length > 0 && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Trending Tags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {initialContext.popularTags.map((tag, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setFilters((prev) => ({ ...prev, tags: [tag] }));
                              executeSearch(searchQuery || 'Analyze', { ...filters, tags: [tag] });
                            }}
                            className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/80 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-100"
                          >
                            <Tag className="w-3 h-3 text-zinc-400" />
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Popular and recently indexed documents */}
                {initialContext && initialContext.recentDocuments.length > 0 && (
                  <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Recently Indexed Files</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {initialContext.recentDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, documentIds: [doc.id] }));
                            executeSearch('Explain', { ...filters, documentIds: [doc.id] });
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/50 hover:bg-zinc-50 dark:bg-zinc-950/30 dark:hover:bg-zinc-950/60 border border-zinc-200/10 hover:border-zinc-200/40 cursor-pointer transition-all text-left"
                        >
                          <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 font-black text-[10px] uppercase text-zinc-500">
                            {doc.fileType}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{doc.title}</p>
                            <p className="text-[10px] text-zinc-450 mt-0.5 font-bold flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              Indexed {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        
        // G. Search Performance Analytics Tab
        <div className="max-w-4xl mx-auto">
          {analytics ? (
            <SearchAnalyticsCard stats={analytics} />
          ) : (
            <div className="py-20 flex flex-col items-center text-center">
              <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
              <p className="text-xs text-zinc-500 mt-2 font-semibold">Loading search performance logs...</p>
            </div>
          )}
        </div>
      )}

      {/* H. Sliding Side-Drawer Document Preview panel */}
      <AnimatePresence>
        {activePreview && (
          <>
            {/* Dark blur background shadow overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePreview(null)}
              className="fixed inset-0 bg-zinc-950 z-40 backdrop-blur-sm"
            />
            
            {/* Floating Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full sm:max-w-xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-850 shadow-2xl p-6 z-50 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6 text-left">
                {/* Header controls */}
                <div className="flex items-center justify-between border-b border-zinc-250/30 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 uppercase text-[10px] tracking-wider font-extrabold border border-transparent">
                      {activePreview.fileType}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Document Preview</h3>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                        Page {activePreview.pageNumber} • Paragraph {activePreview.paragraphNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePreview(null)}
                    className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800"
                  >
                    <X className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Document Title</h4>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{activePreview.documentName}</p>
                </div>

                {/* Excerpt passage text rendering */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Passage Content</h4>
                  <div className="bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-50 dark:hover:bg-zinc-950 border border-zinc-200/30 dark:border-zinc-800/80 rounded-2xl p-5 text-xs text-zinc-800 dark:text-zinc-200 font-normal leading-relaxed overflow-y-auto max-h-96 select-all transition-colors shadow-inner">
                    {/* Render with keywords highlighted */}
                    {activePreview.text}
                  </div>
                </div>

                {/* Detailed Metadata fields */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Metadata Parameters</h4>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200/10 p-3 rounded-xl">
                      <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                        <Folder className="w-3.5 h-3.5" /> Category
                      </span>
                      <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200 mt-1">{activePreview.category}</p>
                    </div>
                    
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200/10 p-3 rounded-xl">
                      <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Indexed On
                      </span>
                      <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200 mt-1">
                        {new Date(activePreview.uploadDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200/10 p-3 rounded-xl">
                      <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5" /> File Size
                      </span>
                      <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200 mt-1">
                        {activePreview.fileSize ? `${(activePreview.fileSize / (1024 * 1024)).toFixed(2)} MB` : '0 KB'}
                      </p>
                    </div>

                    <div className="bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200/10 p-3 rounded-xl">
                      <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Search Confidence
                      </span>
                      <p className="text-xs font-bold text-zinc-850 dark:text-zinc-200 mt-1">
                        {Math.round(activePreview.score * 100)}% Match
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags inside preview */}
                {activePreview.tags && activePreview.tags.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Document Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activePreview.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-zinc-100 dark:bg-zinc-850 text-zinc-650 dark:text-zinc-350 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-zinc-200/40 dark:border-zinc-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ask AI helper bottom CTA */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-850 flex gap-3.5 mt-6">
                <button
                  onClick={() => setActivePreview(null)}
                  className="flex-1 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => handleAskAIHelper(activePreview)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-zinc-950 text-zinc-50 hover:bg-zinc-850 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-extrabold transition-all shadow"
                >
                  <Sparkles className="w-4 h-4 text-zinc-300 dark:text-zinc-900 fill-zinc-300 dark:fill-zinc-900" />
                  Ask AI About This
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
export default SearchPage;
