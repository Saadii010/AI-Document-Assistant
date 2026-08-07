import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Play, Eye, Trash2, Download, FileText, CheckCircle2, AlertCircle, Loader, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentTableProps {
  id: string;
  documents: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onFetchDocuments: (params: any) => void;
  onDeleteDocument: (id: string) => Promise<boolean>;
  onReprocessDocument: (id: string) => Promise<boolean>;
  onViewDocumentDetails?: (id: string) => Promise<any>; // Fetch details of chunks/logs
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  id,
  documents,
  pagination,
  onFetchDocuments,
  onDeleteDocument,
  onReprocessDocument,
  onViewDocumentDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'view' | 'delete' | 'reprocess' | null>(null);
  const [docDetails, setDocDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFetchDocuments({
      page: 1,
      search: searchTerm,
      fileType: fileTypeFilter,
      status: statusFilter,
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFileTypeFilter('');
    setStatusFilter('');
    onFetchDocuments({ page: 1, search: '', fileType: '', status: '' });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    onFetchDocuments({
      page: newPage,
      search: searchTerm,
      fileType: fileTypeFilter,
      status: statusFilter,
    });
  };

  const openModal = async (doc: any, type: 'view' | 'delete' | 'reprocess') => {
    setSelectedDoc(doc);
    setModalType(type);
    if (type === 'view' && onViewDocumentDetails) {
      setLoadingDetails(true);
      try {
        const details = await onViewDocumentDetails(doc._id || doc.id);
        setDocDetails(details);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const closeModal = () => {
    setSelectedDoc(null);
    setModalType(null);
    setDocDetails(null);
  };

  const handleReprocessConfirm = async () => {
    if (!selectedDoc) return;
    const success = await onReprocessDocument(selectedDoc._id || selectedDoc.id);
    if (success) {
      closeModal();
      onFetchDocuments({
        page: pagination.page,
        search: searchTerm,
        fileType: fileTypeFilter,
        status: statusFilter,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDoc) return;
    const success = await onDeleteDocument(selectedDoc._id || selectedDoc.id);
    if (success) {
      closeModal();
      onFetchDocuments({
        page: 1,
        search: searchTerm,
        fileType: fileTypeFilter,
        status: statusFilter,
      });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase">
            <CheckCircle2 className="w-3 h-3" /> PROCESSED
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1 text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase">
            <Loader className="w-3 h-3 animate-spin" /> INDEXING
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md uppercase animate-pulse">
            <AlertCircle className="w-3 h-3" /> FAILED
          </span>
        );
    }
  };

  return (
    <div id={id} className="space-y-4">
      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search document title, tags or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-black rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            <option value="">All Formats</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-black rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            <option value="">All Statuses</option>
            <option value="processed">Processed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md transition-colors"
          >
            Filter
          </button>

          {(searchTerm || fileTypeFilter || statusFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-black rounded-xl border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                <th className="py-4 px-6">Document Title</th>
                <th className="py-4 px-4">Owner</th>
                <th className="py-4 px-4">Size</th>
                <th className="py-4 px-4">Pages</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 dark:text-zinc-600 font-bold">
                    No matching document entries logged.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id || doc.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 overflow-hidden max-w-sm">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-zinc-800 dark:text-zinc-100 block truncate" title={doc.title}>
                            {doc.title}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">
                            {doc.fileType}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-zinc-700 dark:text-zinc-300 font-medium">
                      {doc.owner ? (
                        <div>
                          <span className="font-bold block">{doc.owner.firstName} {doc.owner.lastName}</span>
                          <span className="text-[10px] text-zinc-400">{doc.owner.email}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 font-bold italic">Unknown</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 font-bold">
                      {formatBytes(doc.fileSize)}
                    </td>

                    <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 font-bold">
                      {doc.totalPages || 1}
                    </td>

                    <td className="py-4 px-4">
                      {getStatusIcon(doc.status)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openModal(doc, 'view')}
                          title="Inspect Metadata & Logs"
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openModal(doc, 'reprocess')}
                          title="Trigger Reprocess"
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={doc.filePath || `/uploads/${doc.storedFilename}`}
                          download={doc.originalFilename}
                          title="Download Raw File"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => openModal(doc, 'delete')}
                          title="Delete File"
                          className="p-1.5 rounded-lg border border-zinc-200 hover:border-rose-500/30 hover:bg-rose-500/5 text-zinc-400 hover:text-rose-600 dark:border-zinc-800 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total records)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalType && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 overflow-hidden z-10 space-y-5"
            >
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-900">
                <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  {modalType === 'view' && 'RAG Specs & System Logs'}
                  {modalType === 'reprocess' && 'Rebuild Vector Index'}
                  {modalType === 'delete' && 'Purge Knowledge Base Item'}
                </h4>
                <button onClick={closeModal} className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* VIEW LOGS & METADATA */}
              {modalType === 'view' && (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {loadingDetails ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
                      <span className="text-xs text-zinc-400 font-bold">Scanning segments...</span>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2">
                        <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 block truncate">
                          {selectedDoc.title}
                        </span>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-bold text-zinc-400">
                          <div>FORMAT: <span className="text-zinc-700 dark:text-zinc-300">{selectedDoc.fileType.toUpperCase()}</span></div>
                          <div>SIZE: <span className="text-zinc-700 dark:text-zinc-300">{formatBytes(selectedDoc.fileSize)}</span></div>
                          <div>TOTAL CHUNKS: <span className="text-zinc-700 dark:text-zinc-300">{docDetails?.stats?.chunkCount || 0} segments</span></div>
                          <div>EMBEDDINGS: <span className="text-zinc-700 dark:text-zinc-300">{docDetails?.stats?.embeddingCount || 0} vectors</span></div>
                        </div>
                      </div>

                      {/* Exec logs */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Processing Logs (Audit trail)</span>
                        <div className="p-3 bg-zinc-950 text-zinc-400 rounded-xl font-mono text-[10px] space-y-1 border border-zinc-900 max-h-48 overflow-y-auto leading-relaxed">
                          {docDetails?.processingLogs?.logs && docDetails.processingLogs.logs.length > 0 ? (
                            docDetails.processingLogs.logs.map((logStr: string, idx: number) => (
                              <div key={idx} className="border-l-2 border-indigo-500 pl-2 py-0.5">{logStr}</div>
                            ))
                          ) : (
                            <div className="text-zinc-600 italic">No detailed indexing logs logged for this item.</div>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] text-zinc-400 space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                        <div>OWNER ID: {selectedDoc.owner?._id || selectedDoc.owner?.id || 'System'}</div>
                        <div>UPLOADED AT: {new Date(selectedDoc.uploadDate || selectedDoc.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* REPROCESS CONFIRM */}
              {modalType === 'reprocess' && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    Are you sure you want to trigger a complete reprocess pipeline for{' '}
                    <span className="font-bold text-zinc-800 dark:text-zinc-100">"{selectedDoc.title}"</span>?
                  </p>
                  <p className="text-xs text-zinc-400 font-medium">
                    This will purge all active chunks and vectors, reload the physical parser service, and queue a background worker to rebuild the index.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 text-xs font-black transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReprocessConfirm}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition-colors cursor-pointer"
                    >
                      Reprocess Now
                    </button>
                  </div>
                </div>
              )}

              {/* DELETE CONFIRM */}
              {modalType === 'delete' && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    Are you absolutely sure you want to completely delete the document{' '}
                    <span className="font-bold text-rose-600 dark:text-rose-400">"{selectedDoc.title}"</span>?
                  </p>
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-[11px] font-medium leading-relaxed">
                    <span className="font-bold block">WARNING! This action cannot be undone.</span>
                    This cleanses the local MongoDB record, disk upload, text segments, FAISS indexes, and embedding models.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 text-xs font-black transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md transition-colors cursor-pointer"
                    >
                      Purge File
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
