import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  Bookmark, 
  FileText, 
  History, 
  Plus, 
  Trash2, 
  BookOpen, 
  Clock,
  Search,
  CheckCircle,
  FileDown
} from 'lucide-react';
import { IBookmark, IAnnotation, IReadingHistory } from '../../services/viewerApi';

interface DocumentSidebarProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  bookmarks: IBookmark[];
  annotations: IAnnotation[];
  readingHistory: IReadingHistory[];
  onAddBookmark: () => void;
  onDeleteBookmark: (id: string) => void;
  onAnnotationClick: (annotation: IAnnotation) => void;
  onDeleteAnnotation: (id: string) => void;
  onSwitchDocument: (docId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  bookmarks,
  annotations,
  readingHistory,
  onAddBookmark,
  onDeleteBookmark,
  onAnnotationClick,
  onDeleteAnnotation,
  onSwitchDocument,
  activeTab,
  setActiveTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
  const filteredPages = pagesArray.filter(p => `Page ${p}`.toLowerCase().includes(searchQuery.toLowerCase()));

  const tabs = [
    { id: 'pages', label: 'Pages', icon: Layers },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="w-80 h-full flex flex-col bg-slate-900/40 backdrop-blur-md border-r border-slate-800 text-slate-200 select-none">
      {/* Search & Header */}
      <div className="p-4 border-b border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wider text-indigo-400 uppercase flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Document Index
          </h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
            Pg {currentPage} / {totalPages}
          </span>
        </div>

        {activeTab === 'pages' && (
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex bg-slate-950/30 border-b border-slate-800 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-medium rounded-md transition-all ${
                isActive 
                  ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500 rounded-b-none' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="h-full flex flex-col"
          >
            {/* Pages Tab */}
            {activeTab === 'pages' && (
              <div className="grid grid-cols-2 gap-2 pb-6">
                {filteredPages.length > 0 ? (
                  filteredPages.map((page) => {
                    const isCurrent = page === currentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`group relative aspect-[3/4] flex flex-col justify-between p-3 rounded-lg border text-left transition-all ${
                          isCurrent
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/20'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors">
                          PAGE
                        </span>
                        <div className="text-xl font-bold text-center flex-1 flex items-center justify-center">
                          {page}
                        </div>
                        {isCurrent && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center text-slate-500 py-8 text-xs">
                    No matching pages found
                  </div>
                )}
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <div className="flex flex-col gap-3 pb-6">
                <button
                  onClick={onAddBookmark}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 px-4 rounded-lg shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Bookmark Current Page
                </button>

                <div className="flex flex-col gap-2 mt-2">
                  {bookmarks.length > 0 ? (
                    bookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id || bookmark._id}
                        className="group flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                        onClick={() => onPageChange(bookmark.page)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Bookmark className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                              {bookmark.title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Page {bookmark.page}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (bookmark.id || bookmark._id) {
                              onDeleteBookmark((bookmark.id || bookmark._id)!);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-rose-400 transition-all"
                          title="Delete Bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 py-8 text-xs">
                      No bookmarks saved for this document.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes & Highlights Tab */}
            {activeTab === 'notes' && (
              <div className="flex flex-col gap-2 pb-6">
                {annotations.length > 0 ? (
                  annotations.map((note) => {
                    const colorClasses: Record<string, string> = {
                      yellow: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
                      blue: 'bg-sky-500/20 border-sky-500/50 text-sky-300',
                      green: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
                      pink: 'bg-pink-500/20 border-pink-500/50 text-pink-300',
                      amber: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
                    };

                    const highlightClass = colorClasses[note.highlightColor || 'yellow'] || colorClasses.yellow;

                    return (
                      <div
                        key={note.id || note._id}
                        onClick={() => onAnnotationClick(note)}
                        className="group p-3 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-500">
                            PAGE {note.page}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (note.id || note._id) {
                                onDeleteAnnotation((note.id || note._id)!);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-rose-400 transition-all"
                            title="Delete Annotation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {note.textSelection && (
                          <div className={`text-[11px] px-2 py-1 rounded border leading-relaxed truncate ${highlightClass}`}>
                            "{note.textSelection}"
                          </div>
                        )}

                        {note.comment && (
                          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/20 p-2 rounded border border-slate-800/50">
                            {note.comment}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-slate-500 py-8 text-xs">
                    Select text in the document viewer to add highlights or personal annotations.
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="flex flex-col gap-2 pb-6">
                {readingHistory.length > 0 ? (
                  readingHistory.map((hist) => {
                    const docInfo = hist.documentId;
                    if (!docInfo) return null;
                    const docId = docInfo.id || docInfo._id;

                    return (
                      <div
                        key={hist.id || hist._id}
                        onClick={() => docId && onSwitchDocument(docId)}
                        className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/30 transition-all cursor-pointer flex flex-col gap-1"
                      >
                        <span className="text-xs font-semibold text-slate-200 truncate hover:text-indigo-400 transition-colors">
                          {docInfo.title}
                        </span>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                            {hist.progress}% progress
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                            {hist.currentPage} / {docInfo.totalPages || 1}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-slate-500 py-8 text-xs">
                    No reading history found.
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
