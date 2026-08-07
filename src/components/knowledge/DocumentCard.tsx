import React, { useState } from 'react';
import {
  File,
  FileText,
  Star,
  Archive,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Edit2,
  Copy,
  FolderOpen,
  Share2,
  Check,
  Sparkles,
  ArrowRightLeft,
  CopyCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentResponse } from '../../services/documentApi';
import toast from 'react-hot-toast';

interface DocumentCardProps {
  document: DocumentResponse;
  onPreview: (doc: DocumentResponse) => void;
  onToggleFavorite: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (doc: DocumentResponse) => void;
  onMoveCategory: (id: string, currentCategory: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreview,
  onToggleFavorite,
  onArchive,
  onRestore,
  onRename,
  onDelete,
  onDuplicate,
  onMoveCategory,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type === 'pdf') {
      return (
        <div className="p-3 rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 group-hover:scale-105 transition-transform shrink-0">
          <FileText className="w-5 h-5" />
        </div>
      );
    }
    if (type === 'docx') {
      return (
        <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
          <File className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="p-3 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
        <FileText className="w-5 h-5" />
      </div>
    );
  };

  const copyMetadata = () => {
    const metaString = `Title: ${document.title}
File Name: ${document.originalFilename}
Type: ${document.fileType.toUpperCase()}
Size: ${formatSize(document.fileSize)}
Pages: ${document.totalPages}
Category: ${document.category}
Tags: ${document.tags.join(', ') || 'None'}
Upload Date: ${new Date(document.uploadDate).toLocaleString()}`;
    
    navigator.clipboard.writeText(metaString);
    toast.success('Document metadata copied to clipboard!');
    setMenuOpen(false);
  };

  const handleSharePlaceholder = () => {
    toast(`Share link generated (Placeholder): https://knowledgeai.app/shared/${document.id}`, {
      icon: '🔗',
    });
    setMenuOpen(false);
  };

  const triggerDownload = () => {
    // Force a programmatically triggered download of the static uploaded file
    const link = window.document.createElement('a');
    link.href = document.filePath;
    link.setAttribute('download', document.originalFilename);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    toast.success(`Downloading ${document.originalFilename}...`);
    setMenuOpen(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="p-5 rounded-2xl border border-zinc-150 bg-white hover:border-zinc-300 dark:border-zinc-900 dark:bg-zinc-950/40 dark:hover:border-zinc-800 transition-all shadow-sm flex flex-col gap-4 relative group/card text-left"
    >
      {/* Top Header Section */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {getFileIcon(document.fileType)}
          <div className="flex flex-col min-w-0">
            <h3
              onClick={() => onPreview(document)}
              className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50 hover:underline cursor-pointer truncate max-w-[140px] sm:max-w-[170px]"
              title={document.title}
            >
              {document.title}
            </h3>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5 uppercase tracking-wider">
              {document.category}
            </span>
          </div>
        </div>

        {/* Action Toggle Dropdown Menu Button */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg border border-transparent hover:border-zinc-200/60 hover:bg-zinc-50 dark:hover:border-zinc-850 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all shrink-0"
            aria-label="Actions dropdown"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-1.5 w-48 rounded-xl border border-zinc-250 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-xl z-50 overflow-hidden py-1"
                >
                  <button
                    onClick={() => {
                      onPreview(document);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview Document
                  </button>

                  <button
                    onClick={triggerDownload}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <Download className="w-3.5 h-3.5" /> Download File
                  </button>

                  <button
                    onClick={() => {
                      onRename(document.id, document.title);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Rename
                  </button>

                  <button
                    onClick={() => {
                      onMoveCategory(document.id, document.category);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Move Category
                  </button>

                  <button
                    onClick={() => {
                      onDuplicate(document);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Duplicate
                  </button>

                  <button
                    onClick={copyMetadata}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Metadata
                  </button>

                  <button
                    onClick={handleSharePlaceholder}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Document
                  </button>

                  <div className="h-[1px] bg-zinc-100 dark:bg-zinc-900 my-1" />

                  <button
                    onClick={() => {
                      onToggleFavorite(document.id);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <Star className={`w-3.5 h-3.5 ${document.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    {document.isFavorite ? 'Unfavorite' : 'Make Favorite'}
                  </button>

                  <button
                    onClick={() => {
                      if (document.isArchived) {
                        onRestore(document.id);
                      } else {
                        onArchive(document.id);
                      }
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    {document.isArchived ? 'Restore Active' : 'Archive File'}
                  </button>

                  <div className="h-[1px] bg-zinc-150 dark:bg-zinc-900 my-1" />

                  <button
                    onClick={() => {
                      onDelete(document.id);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50/20 dark:hover:bg-red-950/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description text area */}
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 h-8 leading-relaxed font-medium select-none">
        {document.description || 'No custom description provided for this knowledge artifact.'}
      </p>

      {/* Tags section */}
      {document.tags && document.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-1.5 overflow-hidden h-5">
          {document.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[9px] font-bold bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 px-2 py-0.5 rounded-md text-zinc-500 dark:text-zinc-400"
            >
              #{tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="text-[9px] font-bold text-zinc-400">+{document.tags.length - 3} more</span>
          )}
        </div>
      ) : (
        <div className="h-5" /> // spacing keeper
      )}

      {/* Bottom info section */}
      <div className="flex items-center justify-between border-t border-zinc-100/60 dark:border-zinc-900/50 pt-3 mt-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold select-none">
        <span>{formatSize(document.fileSize)}</span>
        <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
      </div>

      {/* Badges Overlay on Card corner */}
      <div className="absolute top-2 right-12 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
        {document.isFavorite && (
          <span className="p-1 bg-amber-500 text-white rounded-lg shadow-md" title="Favorite">
            <Star className="w-3 h-3 fill-current" />
          </span>
        )}
        {document.isArchived && (
          <span className="p-1 bg-zinc-500 text-white rounded-lg shadow-md" title="Archived">
            <Archive className="w-3 h-3" />
          </span>
        )}
      </div>
    </motion.div>
  );
};
export default DocumentCard;
