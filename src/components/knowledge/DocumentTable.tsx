import React, { useState } from 'react';
import {
  File,
  FileText,
  Star,
  Archive,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  Edit2,
  Copy,
  ChevronDown,
  ArrowRightLeft,
  Sparkles,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentResponse } from '../../services/documentApi';
import toast from 'react-hot-toast';

interface DocumentTableProps {
  documents: DocumentResponse[];
  onPreview: (doc: DocumentResponse) => void;
  onToggleFavorite: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (doc: DocumentResponse) => void;
  onMoveCategory: (id: string, currentCategory: string) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onPreview,
  onToggleFavorite,
  onArchive,
  onRestore,
  onRename,
  onDelete,
  onDuplicate,
  onMoveCategory,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type === 'pdf') {
      return <FileText className="w-4 h-4 text-red-500 shrink-0" />;
    }
    if (type === 'docx') {
      return <File className="w-4 h-4 text-blue-500 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-amber-500 shrink-0" />;
  };

  const triggerDownload = (doc: DocumentResponse) => {
    const link = window.document.createElement('a');
    link.href = doc.filePath;
    link.setAttribute('download', doc.originalFilename);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    toast.success(`Downloading ${doc.originalFilename}...`);
    setActiveMenuId(null);
  };

  const copyMetadata = (doc: DocumentResponse) => {
    const metaString = `Title: ${doc.title}
File Name: ${doc.originalFilename}
Type: ${doc.fileType.toUpperCase()}
Size: ${formatSize(doc.fileSize)}
Pages: ${doc.totalPages}
Category: ${doc.category}
Tags: ${doc.tags.join(', ') || 'None'}
Upload Date: ${new Date(doc.uploadDate).toLocaleString()}`;
    
    navigator.clipboard.writeText(metaString);
    toast.success('Document metadata copied to clipboard!');
    setActiveMenuId(null);
  };

  return (
    <div className="w-full overflow-x-auto border border-zinc-150 dark:border-zinc-900 rounded-2xl bg-white dark:bg-zinc-950/40 shadow-sm select-none">
      <table className="w-full min-w-[700px] border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/80 text-[10px] uppercase font-black tracking-wider text-zinc-400 dark:text-zinc-500">
            <th className="py-4 px-5 w-8"></th>
            <th className="py-4 px-4">Title / Original File</th>
            <th className="py-4 px-4 w-28">Category</th>
            <th className="py-4 px-4 w-24 text-center">Format</th>
            <th className="py-4 px-4 w-24 text-right">Size</th>
            <th className="py-4 px-4 w-20 text-center">Pages</th>
            <th className="py-4 px-4 w-36">Upload Date</th>
            <th className="py-4 px-5 w-12 text-center"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900/50">
          <AnimatePresence initial={false}>
            {documents.map((doc) => (
              <motion.tr
                key={doc.id}
                layoutId={`row-${doc.id}`}
                className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition-colors group"
              >
                {/* Favorite Toggle shortcut */}
                <td className="py-3.5 px-5 text-center">
                  <button
                    onClick={() => onToggleFavorite(doc.id)}
                    className="text-zinc-300 hover:text-amber-400 dark:text-zinc-800 dark:hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                    />
                  </button>
                </td>

                {/* Title & original name */}
                <td className="py-3.5 px-4 min-w-[200px]">
                  <div className="flex items-center gap-2.5">
                    {getFileIcon(doc.fileType)}
                    <div className="flex flex-col min-w-0">
                      <span
                        onClick={() => onPreview(doc)}
                        className="text-xs font-extrabold text-zinc-900 dark:text-zinc-200 cursor-pointer hover:underline truncate max-w-[250px]"
                      >
                        {doc.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[250px] mt-0.5">
                        {doc.originalFilename}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Category Badge */}
                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-2.5 py-1 rounded-lg">
                    {doc.category}
                  </span>
                </td>

                {/* File extension type */}
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    .{doc.fileType}
                  </span>
                </td>

                {/* Size */}
                <td className="py-3.5 px-4 text-right text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  {formatSize(doc.fileSize)}
                </td>

                {/* Page Count */}
                <td className="py-3.5 px-4 text-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  {doc.totalPages || 1}
                </td>

                {/* Upload date */}
                <td className="py-3.5 px-4 text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(doc.uploadDate).toLocaleDateString()}
                </td>

                {/* Trigger Menu */}
                <td className="py-3.5 px-5 text-center relative">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === doc.id ? null : doc.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {activeMenuId === doc.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                          className="absolute right-6 mt-1 w-44 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-xl z-50 overflow-hidden py-1"
                        >
                          <button
                            onClick={() => {
                              onPreview(doc);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>

                          <button
                            onClick={() => triggerDownload(doc)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>

                          <button
                            onClick={() => {
                              onRename(doc.id, doc.title);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Rename
                          </button>

                          <button
                            onClick={() => {
                              onMoveCategory(doc.id, doc.category);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" /> Move
                          </button>

                          <button
                            onClick={() => {
                              onDuplicate(doc);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Duplicate
                          </button>

                          <button
                            onClick={() => copyMetadata(doc)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy Metadata
                          </button>

                          <div className="h-[1px] bg-zinc-100 dark:bg-zinc-900 my-1" />

                          <button
                            onClick={() => {
                              if (doc.isArchived) {
                                onRestore(doc.id);
                              } else {
                                onArchive(doc.id);
                              }
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900/50"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            {doc.isArchived ? 'Restore' : 'Archive'}
                          </button>

                          <div className="h-[1px] bg-zinc-100 dark:bg-zinc-900 my-1" />

                          <button
                            onClick={() => {
                              onDelete(doc.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50/20 dark:hover:bg-red-950/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Permanent Delete
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};
export default DocumentTable;
