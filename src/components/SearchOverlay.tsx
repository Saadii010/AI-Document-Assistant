import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ApiService } from '../services/api';
import {
  Search,
  FileText,
  MessageSquare,
  Star,
  CornerDownLeft,
  X,
  FileSpreadsheet,
  FileCode,
  Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SearchResult {
  documents: Array<{
    id: string;
    name: string;
    size: number;
    mimeType: string;
    favorite: boolean;
    category: string;
  }>;
  chats: Array<{
    id: string;
    title: string;
    messageCount: number;
    favorite: boolean;
    lastMessage: string;
  }>;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument?: (id: string) => void;
  onSelectChat?: (id: string) => void;
}

const getFileIcon = (mimeType: string) => {
  const type = mimeType?.toLowerCase() || '';
  if (type.includes('pdf')) return { icon: FileText, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' };
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) {
    return { icon: FileSpreadsheet, color: 'text-green-500 bg-green-50 dark:bg-green-950/20' };
  }
  if (type.includes('javascript') || type.includes('json') || type.includes('typescript')) {
    return { icon: FileCode, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' };
  }
  return { icon: FileText, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' };
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onSelectDocument,
  onSelectChat,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ documents: [], chats: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults({ documents: [], chats: [] });
    }
  }, [isOpen]);

  // Handle Search Input Autocomplete
  useEffect(() => {
    if (!query.trim()) {
      setResults({ documents: [], chats: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await ApiService.get<SearchResult>(`/dashboard/search?q=${encodeURIComponent(query)}`);
        if (response.success && response.data) {
          setResults(response.data);
        }
      } catch (err) {
        console.error('Autocomplete search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Handle Escape Key Close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleToggleDocFavorite = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await ApiService.patch(`/dashboard/documents/${docId}/favorite`);
      if (response.success) {
        setResults((prev) => ({
          ...prev,
          documents: prev.documents.map((doc) =>
            doc.id === docId ? { ...doc, favorite: !doc.favorite } : doc
          ),
        }));
        toast.success(response.message || 'Status updated.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Favorite modification failed.');
    }
  };

  const handleToggleChatFavorite = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await ApiService.patch(`/dashboard/chats/${chatId}/favorite`);
      if (response.success) {
        setResults((prev) => ({
          ...prev,
          chats: prev.chats.map((chat) =>
            chat.id === chatId ? { ...chat, favorite: !chat.favorite } : chat
          ),
        }));
        toast.success(response.message || 'Status updated.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Favorite modification failed.');
    }
  };

  const handleDocClick = (id: string) => {
    if (onSelectDocument) {
      onSelectDocument(id);
    } else {
      toast(`Document selected: ID ${id}`);
    }
    onClose();
  };

  const handleChatClick = (id: string) => {
    if (onSelectChat) {
      onSelectChat(id);
    } else {
      toast(`Chat selected: ID ${id}`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/50 backdrop-blur-md"
          />

          {/* Search container */}
          <div className="flex min-h-full items-start justify-center p-4 sm:p-12">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.97 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative w-full max-w-2xl transform rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden mt-8 sm:mt-16"
            >
              {/* Search input header */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100 dark:border-zinc-900">
                {loading ? (
                  <Loader className="w-5 h-5 text-indigo-500 animate-spin shrink-0" />
                ) : (
                  <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search across documents and conversation transcripts..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-100 text-sm placeholder-zinc-400 font-medium"
                />
                <button
                  onClick={onClose}
                  className="p-1 rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search body */}
              <div className="max-h-[400px] overflow-y-auto p-4 flex flex-col gap-5">
                {!query.trim() ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-2 select-none">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Global Search</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-md">
                      Type name, folder, category, or transcripts text. Results are indexed instantly.
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-600 border border-zinc-150 dark:border-zinc-900 rounded-md px-1.5 py-0.5 mt-2 bg-zinc-50/50 dark:bg-zinc-950/20">
                      <span>Press</span>
                      <kbd className="font-sans font-extrabold text-[9px] px-0.5 py-0 border border-zinc-300 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900">ESC</kbd>
                      <span>to exit</span>
                    </div>
                  </div>
                ) : results.documents.length === 0 && results.chats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-2 select-none">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">No matches found</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      No files or chats matched "{query}". Try different terms.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Documents List */}
                    {results.documents.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-extrabold tracking-wider text-zinc-400 uppercase select-none pb-1 border-b border-zinc-100 dark:border-zinc-900">
                          Matched Documents ({results.documents.length})
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {results.documents.map((doc) => {
                            const { icon: DocIcon, color: iconColor } = getFileIcon(doc.mimeType);
                            return (
                              <div
                                key={doc.id}
                                onClick={() => handleDocClick(doc.id)}
                                className="p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/40 flex items-center justify-between gap-4 cursor-pointer group transition-all"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`p-2 rounded-lg shrink-0 ${iconColor} border border-transparent dark:border-zinc-800/40`}>
                                    <DocIcon className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col min-w-0 leading-tight">
                                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                      {doc.name}
                                    </p>
                                    <span className="text-[10px] font-medium font-mono text-zinc-400 dark:text-zinc-500">
                                      {formatSize(doc.size)} • {doc.category || 'General'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => handleToggleDocFavorite(doc.id, e)}
                                    className={`p-1.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 text-zinc-400 transition-colors ${
                                      doc.favorite ? 'text-yellow-500' : 'hover:text-yellow-500'
                                    }`}
                                  >
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                  <span className="opacity-0 group-hover:opacity-100 p-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] text-zinc-400 rounded transition-opacity">
                                    <CornerDownLeft className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Chats List */}
                    {results.chats.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-extrabold tracking-wider text-zinc-400 uppercase select-none pb-1 border-b border-zinc-100 dark:border-zinc-900">
                          Matched Chats ({results.chats.length})
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {results.chats.map((chat) => (
                            <div
                              key={chat.id}
                              onClick={() => handleChatClick(chat.id)}
                              className="p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/40 flex items-center justify-between gap-4 cursor-pointer group transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-100 dark:bg-zinc-900/60 dark:border-zinc-800 text-zinc-500 shrink-0">
                                  <MessageSquare className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col min-w-0 leading-tight">
                                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                    {chat.title}
                                  </p>
                                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-sm font-medium">
                                    {chat.lastMessage || 'No messages yet.'} • {chat.messageCount} msg
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => handleToggleChatFavorite(chat.id, e)}
                                  className={`p-1.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 text-zinc-400 transition-colors ${
                                    chat.favorite ? 'text-yellow-500' : 'hover:text-yellow-500'
                                  }`}
                                >
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                </button>
                                <span className="opacity-0 group-hover:opacity-100 p-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] text-zinc-400 rounded transition-opacity">
                                  <CornerDownLeft className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default SearchOverlay;
