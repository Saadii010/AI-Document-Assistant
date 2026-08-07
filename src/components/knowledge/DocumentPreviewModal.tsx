import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Star,
  Archive,
  Download,
  Copy,
  Check,
  Search,
  BookOpen,
  Edit2,
  Tag,
  Folder,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  Cpu,
  Terminal,
  AlertCircle,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentResponse, DocumentApiService, RagStatusResponse, RagLogsResponse, RagChunkItem } from '../../services/documentApi';
import toast from 'react-hot-toast';

interface DocumentPreviewModalProps {
  document: DocumentResponse;
  onClose: () => void;
  onUpdate: (doc: DocumentResponse) => void;
  onToggleFavorite: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  onUpdate,
  onToggleFavorite,
  onArchive,
  onRestore,
}) => {
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState<string>('');

  // RAG Pipeline States
  const [activeTab, setActiveTab] = useState<'details' | 'rag'>('details');
  const [ragStatus, setRagStatus] = useState<RagStatusResponse | null>(null);
  const [ragLogs, setRagLogs] = useState<RagLogsResponse | null>(null);
  const [ragChunks, setRagChunks] = useState<RagChunkItem[]>([]);
  const [loadingRag, setLoadingRag] = useState<boolean>(false);
  const [isReprocessing, setIsReprocessing] = useState<boolean>(false);

  // Fetch RAG Details
  const fetchRagDetails = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingRag(true);
      const [statusRes, logsRes, chunksRes] = await Promise.all([
        DocumentApiService.getRagStatus(document.id),
        DocumentApiService.getRagLogs(document.id),
        DocumentApiService.getRagChunks(document.id)
      ]);
      if (statusRes.success && statusRes.data) {
        setRagStatus(statusRes.data);
      }
      if (logsRes.success && logsRes.data) {
        setRagLogs(logsRes.data);
      }
      if (chunksRes.success && chunksRes.data) {
        setRagChunks(chunksRes.data);
      }
    } catch (err) {
      console.error('Error fetching RAG pipeline details:', err);
    } finally {
      if (showLoading) setLoadingRag(false);
    }
  };

  // Setup periodic polling for active pipeline processing
  useEffect(() => {
    let interval: any;
    if (activeTab === 'rag') {
      fetchRagDetails(true);
      interval = setInterval(() => {
        fetchRagDetails(false);
      }, 2500);
    } else {
      // Fetch status silently on details view too
      DocumentApiService.getRagStatus(document.id).then((res) => {
        if (res.success && res.data) setRagStatus(res.data);
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, document.id]);

  const handleReprocess = async () => {
    try {
      setIsReprocessing(true);
      const res = await DocumentApiService.reprocessDocument(document.id);
      if (res.success) {
        toast.success('RAG reprocessing initiated in background.');
        setActiveTab('rag');
        fetchRagDetails(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to trigger reprocessing.');
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleDeleteEmbeddings = async () => {
    if (!window.confirm('Are you sure you want to delete all chunks and vector embeddings for this document? This resets the document back to "uploaded" status.')) {
      return;
    }
    try {
      const res = await DocumentApiService.deleteRagEmbeddings(document.id);
      if (res.success) {
        toast.success('Document vector indexes deleted successfully.');
        fetchRagDetails(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete vector indexes.');
    }
  };

  // Editable fields
  const [title, setTitle] = useState(document.title);
  const [description, setDescription] = useState(document.description);
  const [category, setCategory] = useState(document.category);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>(document.tags);

  const categoriesList = ['Research', 'University', 'Work', 'Personal', 'Invoices', 'Books', 'Notes'];

  // Load raw file contents on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const res = await DocumentApiService.getDocumentPreview(document.id);
        if (res.success && res.data?.content !== undefined) {
          setContent(res.data.content);
        } else {
          setContent('Unable to load file content preview.');
        }
      } catch (err: any) {
        setContent(`Error loading file preview: ${err.message || 'Something went wrong.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [document.id]);

  // Sync edits if the parent doc updates
  useEffect(() => {
    setTitle(document.title);
    setDescription(document.description);
    setCategory(document.category);
    setTags(document.tags);
  }, [document]);

  const copyToClipboard = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Document content copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdits = async () => {
    try {
      const res = await DocumentApiService.updateDocument(document.id, {
        title,
        description,
        category,
        tags,
      });

      if (res.success && res.data) {
        onUpdate(res.data);
        setIsEditing(false);
        toast.success('Document updated successfully.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update document details.');
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tagClean = newTag.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    if (tagClean && !tags.includes(tagClean)) {
      setTags([...tags, tagClean]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const triggerDownload = () => {
    const link = window.document.createElement('a');
    link.href = document.filePath;
    link.setAttribute('download', document.originalFilename);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    toast.success(`Downloading ${document.originalFilename}...`);
  };

  // Content Highlighter for search queries inside preview
  const getHighlightedContent = () => {
    if (!localSearch.trim()) return content;
    const searchTerms = localSearch.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${searchTerms})`, 'gi');
    
    // Simple HTML escape and highlight wrapper
    const escapedContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escapedContent.replace(
      regex,
      '<mark class="bg-amber-200 text-zinc-950 font-extrabold rounded-sm px-0.5">$1</mark>'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Dark overlay background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl w-full max-w-6xl h-[90vh] sm:h-[80vh] flex flex-col md:flex-row shadow-2xl relative overflow-hidden z-50"
      >
        {/* Left Side: Document Preview Content (2/3 width) */}
        <div className="flex-1 flex flex-col border-r border-zinc-150 dark:border-zinc-900 h-1/2 md:h-full min-w-0">
          {/* Preview Header */}
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-900/50 flex items-center justify-between gap-4 select-none shrink-0 bg-zinc-50/50 dark:bg-zinc-950/80">
            <div className="flex items-center gap-3 min-w-0 text-left">
              <div className="p-2.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 rounded-xl shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50 truncate max-w-[200px] sm:max-w-[350px]">
                  {document.title}
                </h2>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5 uppercase tracking-wide">
                  {document.originalFilename} • {document.fileType.toUpperCase()}
                </p>
              </div>
            </div>

            {/* In-preview Local Search */}
            {!loading && content && (
              <div className="relative max-w-[180px] sm:max-w-[240px] shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Find in document..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-white focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-100 text-xs text-zinc-800 dark:text-zinc-200"
                />
              </div>
            )}
          </div>

          {/* Render Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/40 dark:bg-zinc-950/10 relative text-left">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                <span className="text-xs text-zinc-400 font-extrabold select-none">Extracting preview stream...</span>
              </div>
            ) : content ? (
              <div className="max-w-3xl mx-auto h-full">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Extracted Text Preview
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 rounded-lg border border-zinc-150 hover:bg-zinc-100 dark:border-zinc-850 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-all text-xs font-bold flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-[10px] text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copy Content</span>
                      </>
                    )}
                  </button>
                </div>
                {/* Scrollable document wrapper */}
                <pre className="font-mono text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap select-text break-words pb-12">
                  <code dangerouslySetInnerHTML={{ __html: getHighlightedContent() }} />
                </pre>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-zinc-400 font-extrabold select-none">No preview available for this document.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Metadata / Configuration Editor (1/3 width) */}
        <div className="w-full md:w-80 flex flex-col h-1/2 md:h-full bg-white dark:bg-zinc-950">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-900/50 flex items-center justify-between shrink-0">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {activeTab === 'details' ? 'Details & Metadata' : 'AI Processing'}
            </span>
            <div className="flex items-center gap-1.5">
              {activeTab === 'details' && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isEditing
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950'
                      : 'border-zinc-150 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-850 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {isEditing ? 'Cancel' : 'Edit Info'}
                </button>
              )}
              {/* Close entire modal */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-zinc-150 hover:bg-zinc-50 dark:border-zinc-850 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs Selector */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950/20 px-2 shrink-0 select-none">
            <button
              onClick={() => {
                setActiveTab('details');
                setIsEditing(false);
              }}
              className={`flex-1 py-2.5 text-center text-xs font-black border-b-2 transition-all ${
                activeTab === 'details'
                  ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:text-zinc-500'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => {
                setActiveTab('rag');
                setIsEditing(false);
              }}
              className={`flex-1 py-2.5 text-center text-xs font-black border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'rag'
                  ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:text-zinc-500'
              }`}
            >
              AI Pipeline
              {ragStatus?.status === 'processing' && (
                <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 text-left">
            <AnimatePresence mode="wait">
              {activeTab === 'details' ? (
                isEditing ? (
                  /* Editing layout */
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Title edit */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Document Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-zinc-900 bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-100 text-xs text-zinc-850 dark:text-zinc-150 font-semibold"
                      />
                    </div>

                    {/* Category edit */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Category Workspace
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-zinc-900 bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-100 text-xs text-zinc-850 dark:text-zinc-150 font-semibold cursor-pointer"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description edit */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Description & Notes
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add an abstract or quick description..."
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-zinc-900 bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-100 text-xs text-zinc-850 dark:text-zinc-150 font-semibold leading-relaxed resize-none"
                      />
                    </div>

                    {/* Tag additions */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Metadata Tags
                      </label>
                      <form onSubmit={handleAddTag} className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="new-tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 focus:border-zinc-900 bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-100 text-xs text-zinc-850 dark:text-zinc-150"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold"
                        >
                          Add
                        </button>
                      </form>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-md text-zinc-500 dark:text-zinc-400 flex items-center gap-1"
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleSaveEdits}
                      className="w-full mt-4 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-extrabold text-xs shadow-lg flex items-center justify-center gap-1.5 hover:opacity-90"
                    >
                      Save Changes
                    </button>
                  </motion.div>
                ) : (
                  /* Static view layout */
                  <motion.div
                    key="static"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-5 select-none"
                  >
                    {/* Category */}
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <Folder className="w-3 h-3" /> Category
                      </span>
                      <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 mt-1">
                        {document.category}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Abstract Description
                      </span>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium mt-1">
                        {document.description || 'No custom description provided.'}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Assigned Tags
                      </span>
                      {document.tags && document.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {document.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 px-2 py-0.5 rounded-md text-zinc-500 dark:text-zinc-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 mt-1 font-medium">None</span>
                      )}
                    </div>

                    {/* Standard Static parameters */}
                    <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 dark:text-zinc-500 font-bold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Uploaded
                        </span>
                        <span className="font-extrabold text-zinc-700 dark:text-zinc-300">
                          {new Date(document.uploadDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 dark:text-zinc-500 font-bold flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" /> File Size
                        </span>
                        <span className="font-extrabold text-zinc-700 dark:text-zinc-300">
                          {document.fileSize > 1024 * 1024
                            ? `${(document.fileSize / (1024 * 1024)).toFixed(1)} MB`
                            : `${Math.round(document.fileSize / 1024)} KB`}
                        </span>
                      </div>

                      {document.lastOpened && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-400 dark:text-zinc-500 font-bold flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" /> Last Opened
                          </span>
                          <span className="font-extrabold text-zinc-700 dark:text-zinc-300">
                            {new Date(document.lastOpened).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              ) : (
                /* RAG Pipeline view layout */
                <motion.div
                  key="rag"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4 text-left"
                >
                  {/* Pipeline status banner */}
                  <div className={`p-4 rounded-2xl border flex flex-col gap-1.5 select-none ${
                    ragStatus?.status === 'processed' || ragStatus?.status === 'completed'
                      ? 'border-green-100 bg-green-50/30 dark:border-green-950/20 dark:bg-green-950/10 text-green-700 dark:text-green-400'
                      : ragStatus?.status === 'failed'
                      ? 'border-red-100 bg-red-50/30 dark:border-red-950/20 dark:bg-red-950/10 text-red-700 dark:text-red-400'
                      : 'border-blue-100 bg-blue-50/30 dark:border-blue-950/20 dark:bg-blue-950/10 text-blue-700 dark:text-blue-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      {ragStatus?.status === 'processed' || ragStatus?.status === 'completed' ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                      ) : ragStatus?.status === 'failed' ? (
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
                      )}
                      <span className="text-xs font-black uppercase tracking-wider">
                        {ragStatus?.status === 'processed' || ragStatus?.status === 'completed'
                          ? 'Ready for Search & AI'
                          : ragStatus?.status === 'failed'
                          ? 'Pipeline Failed'
                          : 'RAG Processing Active...'}
                      </span>
                    </div>
                    <p className="text-[10px] opacity-80 leading-relaxed font-semibold">
                      {ragStatus?.status === 'processed' || ragStatus?.status === 'completed'
                        ? 'This source is vectorized and active in your personal database. Ready for retrieval query pipelines.'
                        : ragStatus?.status === 'failed'
                        ? 'An error occurred during raw text extraction or embedding vector generation. Try reprocessing.'
                        : 'Currently validating, parsing pages, and extracting Gemini vectors. Do not close this panel.'}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="flex flex-col gap-1 select-none">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      <span>Pipeline Progress</span>
                      <span>
                        {ragStatus?.status === 'processed' || ragStatus?.status === 'completed'
                          ? '10 / 10 Steps'
                          : ragStatus?.status === 'failed'
                          ? 'Failed'
                          : `${Math.min(10, Math.max(1, ragLogs?.logs ? ragLogs.logs.filter(l => l.includes('[Step')).length : 1))} / 10 Steps`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          ragStatus?.status === 'failed'
                            ? 'bg-red-500'
                            : ragStatus?.status === 'processed' || ragStatus?.status === 'completed'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${
                            ragStatus?.status === 'processed' || ragStatus?.status === 'completed'
                              ? 100
                              : ragStatus?.status === 'failed'
                              ? 100
                              : Math.min(100, Math.max(10, (ragLogs?.logs ? ragLogs.logs.filter(l => l.includes('[Step')).length : 1) * 10))
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Pipeline metrics */}
                  <div className="grid grid-cols-2 gap-2 border-y border-zinc-100 dark:border-zinc-900 py-3 select-none">
                    <div className="p-2 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Generated Chunks</span>
                      <span className="text-xs font-black text-zinc-850 dark:text-zinc-150">
                        {ragLogs?.chunkCount || 0}
                      </span>
                    </div>
                    <div className="p-2 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Gemini Vectors</span>
                      <span className="text-xs font-black text-zinc-850 dark:text-zinc-150">
                        {ragLogs?.embeddingCount || 0}
                      </span>
                    </div>
                    <div className="p-2 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Duration</span>
                      <span className="text-xs font-black text-zinc-850 dark:text-zinc-150">
                        {ragLogs?.duration ? `${(ragLogs.duration / 1000).toFixed(1)}s` : 'N/A'}
                      </span>
                    </div>
                    <div className="p-2 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Retries</span>
                      <span className="text-xs font-black text-zinc-850 dark:text-zinc-150">
                        {ragLogs?.retries || 0} / 3
                      </span>
                    </div>
                  </div>

                  {/* Terminal Logs */}
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1 select-none">
                      <Terminal className="w-3.5 h-3.5 text-zinc-400" /> Pipeline Logs
                    </span>
                    <div className="bg-zinc-900 dark:bg-black rounded-xl p-2.5 border border-zinc-800 font-mono text-[9px] text-zinc-300 leading-relaxed max-h-[130px] overflow-y-auto flex flex-col gap-1 scrollbar-thin">
                      {ragLogs?.logs && ragLogs.logs.length > 0 ? (
                        ragLogs.logs.map((log, lIdx) => (
                          <div
                            key={lIdx}
                            className={`border-l pl-2 py-0.5 ${
                              log.includes('ERROR')
                                ? 'border-red-500 text-red-400 font-bold bg-red-950/20'
                                : lIdx === ragLogs.logs.length - 1 && ragStatus?.status === 'processing'
                                ? 'border-blue-500 text-blue-300 font-extrabold animate-pulse'
                                : 'border-zinc-700'
                            }`}
                          >
                            {log}
                          </div>
                        ))
                      ) : (
                        <div className="text-zinc-500 italic">No logs emitted. Enqueueing task...</div>
                      )}
                    </div>
                  </div>

                  {/* Chunks Preview */}
                  {ragChunks.length > 0 && (
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1 select-none">
                        <Cpu className="w-3.5 h-3.5 text-zinc-400" /> Vector Segments ({ragChunks.length})
                      </span>
                      <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto">
                        {ragChunks.slice(0, 3).map((chunk) => (
                          <div key={chunk.chunkId} className="border border-zinc-100 dark:border-zinc-900 rounded-xl p-2 bg-zinc-50/20 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all">
                            <div className="flex justify-between text-[7px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
                              <span>Seg {chunk.index + 1} • Page {chunk.pageNumber}</span>
                              <span>{chunk.charCount} chars</span>
                            </div>
                            <p className="text-[9px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-semibold">
                              {chunk.text}
                            </p>
                          </div>
                        ))}
                        {ragChunks.length > 3 && (
                          <div className="text-center text-[8px] text-zinc-400 font-extrabold select-none">
                            + {ragChunks.length - 3} more segments vectorized
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Actions Drawer (Always visible on bottom right) */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/80 flex flex-col gap-2 shrink-0">
            {activeTab === 'rag' ? (
              <div className="flex flex-col gap-2">
                <button
                  disabled={isReprocessing || ragStatus?.status === 'processing'}
                  onClick={handleReprocess}
                  className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isReprocessing || ragStatus?.status === 'processing' ? 'animate-spin' : ''}`} />
                  {ragStatus?.status === 'processing' ? 'Processing RAG Pipeline...' : 'Reprocess RAG Database'}
                </button>

                {ragChunks.length > 0 && (
                  <button
                    onClick={handleDeleteEmbeddings}
                    className="w-full py-2 rounded-xl border border-red-200 bg-red-50/10 text-red-500 hover:bg-red-50/30 dark:border-red-950/20 dark:bg-red-950/10 dark:hover:bg-red-950/25 text-xs font-black flex items-center justify-center gap-2 transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Wipe Vector Embeddings
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate(`/viewer/${document.id}`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all mb-2"
                >
                  <BookOpen className="w-4 h-4 text-white" />
                  Open in Document Reader
                </button>

                <button
                  onClick={triggerDownload}
                  className="w-full py-2 rounded-xl border border-zinc-200 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4 text-zinc-500" />
                  Download Original File
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onToggleFavorite(document.id)}
                    className={`py-2 rounded-xl border text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all ${
                      document.isFavorite
                        ? 'border-amber-200 bg-amber-50/20 text-amber-500 dark:border-amber-950/20 dark:bg-amber-950/15'
                        : 'border-zinc-200 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${document.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    {document.isFavorite ? 'Starred' : 'Star'}
                  </button>

                  <button
                    onClick={() => {
                      if (document.isArchived) {
                        onRestore(document.id);
                      } else {
                        onArchive(document.id);
                      }
                    }}
                    className="py-2 rounded-xl border border-zinc-200 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Archive className="w-4 h-4 text-zinc-500" />
                    {document.isArchived ? 'Restore' : 'Archive'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default DocumentPreviewModal;
