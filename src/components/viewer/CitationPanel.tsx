import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  ArrowRight, 
  Bookmark, 
  BookOpen, 
  ThumbsUp, 
  Info 
} from 'lucide-react';
import { ICitationInfo } from '../../services/viewerApi';

interface CitationPanelProps {
  citation: ICitationInfo | null;
  onClose: () => void;
  onAskChat: (text: string) => void;
  onAddBookmark: (page: number, textSnippet: string) => void;
}

export const CitationPanel: React.FC<CitationPanelProps> = ({
  citation,
  onClose,
  onAskChat,
  onAddBookmark,
}) => {
  if (!citation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="w-80 h-full flex flex-col bg-slate-900/60 backdrop-blur-md border-l border-slate-800 text-slate-200 select-none"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <h3 className="text-xs font-bold tracking-wider uppercase text-indigo-400">
            Citation Insights
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
        {/* Document Quick Metadata Card */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-indigo-500/10 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            Source Document
          </div>
          <h4 className="text-sm font-bold text-slate-100 line-clamp-2">
            {citation.documentName}
          </h4>
          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
            <span>PAGE {citation.pageNumber}</span>
            <span>PARAGRAPH {citation.paragraphNumber}</span>
          </div>
        </div>

        {/* Confidence Score Bar */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              RAG Similarity Rank
            </span>
            <span className="font-bold text-emerald-400">High Match</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '94%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
            />
          </div>
        </div>

        {/* Verbatim Quote Snippet */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            Verbatim Passage
          </label>
          <div className="flex-1 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[250px] custom-scrollbar">
            "{citation.text}"
          </div>
        </div>

        {/* Context Quick Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => onAskChat(citation.text)}
            className="w-full flex items-center justify-between gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2.5 px-4 rounded-lg shadow-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 shrink-0" />
              Discuss in AI Chat
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onAddBookmark(citation.pageNumber, `Passage on Pg ${citation.pageNumber}`)}
            className="w-full flex items-center justify-center gap-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-300 font-medium text-xs py-2.5 px-4 rounded-lg transition-colors"
          >
            <Bookmark className="w-4 h-4 shrink-0 text-slate-400" />
            Bookmark Passage
          </button>
        </div>
      </div>

      {/* Micro Info Note */}
      <div className="p-3 border-t border-slate-800/50 text-[10px] text-slate-500 flex items-center gap-1.5">
        <ThumbsUp className="w-3 h-3 text-emerald-500/80 shrink-0" />
        Auto-highlighted via semantic citation link.
      </div>
    </motion.div>
  );
};
