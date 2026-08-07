import React from 'react';
import { ISearchResult } from './types';
import { 
  FileText, 
  ExternalLink, 
  Sparkles, 
  Calendar, 
  Tag, 
  Folder, 
  User, 
  Bookmark, 
  BarChart 
} from 'lucide-react';

interface SearchResultCardProps {
  result: ISearchResult;
  searchQuery: string;
  onOpenPreview: (result: ISearchResult) => void;
  onAskAI: (result: ISearchResult) => void;
  viewMode: 'list' | 'grid';
  userEmail?: string;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  searchQuery,
  onOpenPreview,
  onAskAI,
  viewMode,
  userEmail = 'saadkust5481@gmail.com'
}) => {
  // Simple helper to highlight query matches
  const renderHighlightedText = (text: string, query: string) => {
    if (!query || !query.trim()) return <span>{text}</span>;

    const trimmed = query.trim();
    // Split into individual terms if space-separated, but prioritize exact phrase
    const escaped = trimmed.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, idx) => {
          const isMatch = regex.test(part);
          return isMatch ? (
            <mark
              key={idx}
              className="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 px-1 py-0.5 rounded font-semibold border-b border-amber-300 dark:border-amber-700/80"
            >
              {part}
            </mark>
          ) : (
            <span key={idx}>{part}</span>
          );
        })}
      </>
    );
  };

  // Score formatting (Similarity percentage or matching index)
  const formatScore = (score: number) => {
    return `${Math.round(score * 100)}% match`;
  };

  // File size format
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  // Date format
  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get File Icon based on type
  const getFileIconColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900/40';
      case 'docx': return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/40';
      default: return 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
    }
  };

  const isList = viewMode === 'list';

  return (
    <div
      id={`result-card-${result.chunkId}`}
      className={`group bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-zinc-950/40 transition-all duration-200 flex flex-col justify-between ${
        isList ? 'p-5 md:flex-row md:items-start gap-4 md:gap-6' : 'p-5 gap-4'
      }`}
    >
      <div className={`flex-1 min-w-0 ${isList ? '' : 'space-y-3'}`}>
        
        {/* Top bar: Document Title and Match Badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl border shrink-0 font-extrabold text-[10px] uppercase tracking-wider ${getFileIconColor(result.fileType)}`}>
              {result.fileType}
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                {result.documentName}
              </h4>
              <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">
                <span className="flex items-center gap-0.5"><Folder className="w-2.5 h-2.5" /> {result.category}</span>
                <span className="hidden sm:inline">•</span>
                <span>Page {result.pageNumber}</span>
                <span>•</span>
                <span>{formatFileSize(result.fileSize)}</span>
              </div>
            </div>
          </div>
          
          {/* Similarity / Relevance Badge */}
          <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 text-[10px] font-extrabold text-zinc-600 dark:text-zinc-400 shadow-inner">
            <BarChart className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
            {formatScore(result.score)}
          </div>
        </div>

        {/* Highlighted text preview */}
        <div className="bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 border border-zinc-150/45 dark:border-zinc-800/40 rounded-xl p-3.5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed text-left font-normal select-all transition-colors">
          {renderHighlightedText(result.text, searchQuery)}
        </div>

        {/* Metadata section (Tags, Date, Owner) */}
        <div className="flex flex-wrap items-center gap-2.5 mt-3.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">
          <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-zinc-400" /> {formatDate(result.uploadDate)}</div>
          <div className="flex items-center gap-1 truncate max-w-[140px]"><User className="w-3 h-3 text-zinc-400" /> {userEmail}</div>
          
          {/* Inline tag list */}
          {result.tags && result.tags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto shrink-0 max-w-full">
              {result.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-0.5 bg-zinc-100/70 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-md font-semibold border border-zinc-200/20"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
              {result.tags.length > 3 && (
                <span className="text-[9px] text-zinc-400 font-semibold">+{result.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Side Buttons */}
      <div className={`flex shrink-0 gap-2 items-center ${isList ? 'md:flex-col md:self-stretch md:justify-center' : 'w-full pt-3 border-t border-zinc-100 dark:border-zinc-800'}`}>
        <button
          onClick={() => onOpenPreview(result)}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all shadow-sm ${
            isList ? 'w-full' : ''
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Preview</span>
        </button>

        <button
          onClick={() => onAskAI(result)}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-zinc-900 hover:bg-zinc-850 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all shadow-md hover:shadow-lg ${
            isList ? 'w-full' : ''
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-200 dark:text-zinc-800 fill-zinc-200 dark:fill-zinc-800" />
          <span>Ask AI Helper</span>
        </button>
      </div>
    </div>
  );
};
