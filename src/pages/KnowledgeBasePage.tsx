import React, { useState, useEffect } from 'react';
import {
  Library,
  Star,
  Archive,
  HardDrive,
  UploadCloud,
  Grid,
  List,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  Loader2,
  Folder,
  Tag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  FolderPlus,
  AlertCircle,
  HelpCircle,
  Clock,
  LayoutDashboard,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

// Services
import {
  DocumentApiService,
  DocumentResponse,
  StorageStatsResponse
} from '../services/documentApi';

// Subcomponents
import { UploadZone } from '../components/knowledge/UploadZone';
import { UploadQueue, QueuedFile } from '../components/knowledge/UploadQueue';
import { StorageCard } from '../components/knowledge/StorageCard';
import { DocumentCard } from '../components/knowledge/DocumentCard';
import { DocumentTable } from '../components/knowledge/DocumentTable';
import { DocumentPreviewModal } from '../components/knowledge/DocumentPreviewModal';

type ActiveTab = 'all' | 'favorites' | 'archived' | 'storage' | 'upload';

export const KnowledgeBasePage: React.FC = () => {
  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // empty means All Categories
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>(''); // empty means All types

  // Paginated Document state
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [totalDocs, setTotalDocs] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPagesCount, setTotalPagesCount] = useState<number>(1);
  const [limitPerPage] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(true);

  // Storage Stats State
  const [storageStats, setStorageStats] = useState<StorageStatsResponse | null>(null);
  const [storageLoading, setStorageLoading] = useState<boolean>(true);

  // View Preference
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Preview / Details Modal State
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<DocumentResponse | null>(null);

  // Upload Queue State
  const [uploadQueue, setUploadQueue] = useState<QueuedFile[]>([]);
  const [isCurrentlyUploading, setIsCurrentlyUploading] = useState<boolean>(false);

  // Helper lists
  const categoriesList = ['Research', 'University', 'Work', 'Personal', 'Invoices', 'Books', 'Notes'];
  const [allExtractedTags, setAllExtractedTags] = useState<string[]>([]);

  // Modals for Custom Actions
  const [actionDocId, setActionDocId] = useState<string | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState('');

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveCategory, setMoveCategory] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // 1. Fetch main document list based on currently active states
  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const params: any = {
        page: currentPage,
        limit: limitPerPage,
        sort: sortOption,
        search: searchQuery,
      };

      // Apply workspace category filter
      if (selectedCategory) {
        params.category = selectedCategory;
      }

      // Apply type filter
      if (fileTypeFilter) {
        params.fileType = fileTypeFilter;
      }

      // Apply tag filter
      if (selectedTag) {
        params.tag = selectedTag;
      }

      // Map tabs to logical filters
      if (activeTab === 'favorites') {
        params.isFavorite = true;
        params.isArchived = false;
      } else if (activeTab === 'archived') {
        params.isArchived = true;
      } else {
        // default tabs like all or upload
        params.isArchived = false;
      }

      const res = await DocumentApiService.getDocuments(params);
      if (res.success && res.data) {
        setDocuments(res.data.documents);
        setTotalDocs(res.data.total);
        setTotalPagesCount(res.data.pages);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync documents from server.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Storage Analytics
  const fetchStorageStats = async () => {
    try {
      setStorageLoading(true);
      const res = await DocumentApiService.getStorageStats();
      if (res.success && res.data) {
        setStorageStats(res.data);
      }
    } catch (err: any) {
      console.error('Storage analytics failed: ', err);
    } finally {
      setStorageLoading(false);
    }
  };

  // 3. Extract unique tags from current library of documents
  const fetchTagsList = async () => {
    try {
      // Get all unarchived documents (first 100) to build a dynamic list of tags
      const res = await DocumentApiService.getDocuments({ limit: 100, isArchived: false });
      if (res.success && res.data) {
        const uniqueTags = new Set<string>();
        res.data.documents.forEach((doc) => {
          if (doc.tags) {
            doc.tags.forEach((t) => uniqueTags.add(t));
          }
        });
        setAllExtractedTags(Array.from(uniqueTags).slice(0, 15));
      }
    } catch {}
  };

  // Synchronize on mount and parameter updates
  useEffect(() => {
    fetchDocuments();
  }, [activeTab, selectedCategory, selectedTag, fileTypeFilter, sortOption, currentPage]);

  useEffect(() => {
    fetchStorageStats();
    fetchTagsList();
  }, []);

  // Handle Search Trigger with simple button/enter logic
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDocuments();
  };

  // Reset filters helper
  const handleClearAllFilters = () => {
    setSelectedCategory('');
    setSelectedTag('');
    setFileTypeFilter('');
    setSearchQuery('');
    setCurrentPage(1);
    toast.success('Search and filters cleared.');
  };

  // Triggered on individual drag & drop files selection
  const handleFilesSelected = (files: File[]) => {
    const newQueueItems: QueuedFile[] = files.map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      progress: 0,
      status: 'idle',
    }));

    setUploadQueue((prev) => [...prev, ...newQueueItems]);
    setActiveTab('upload');
  };

  // Process files sequentially from the queue
  const startUploadProcessing = async () => {
    if (isCurrentlyUploading || uploadQueue.length === 0) return;

    // Filter queue to find pending items
    const nextPending = uploadQueue.find((item) => item.status === 'idle' || item.status === 'failed');
    if (!nextPending) return;

    setIsCurrentlyUploading(true);
    
    // Update item to uploading state
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === nextPending.id ? { ...item, status: 'uploading', progress: 5 } : item))
    );

    // Simulate progress ticker while communicating
    let simulatedProgress = 10;
    const progressInterval = setInterval(() => {
      simulatedProgress = Math.min(95, simulatedProgress + Math.floor(Math.random() * 15) + 5);
      setUploadQueue((prev) =>
        prev.map((item) => (item.id === nextPending.id ? { ...item, progress: simulatedProgress } : item))
      );
    }, 200);

    try {
      const res = await DocumentApiService.uploadDocument(nextPending.file, {
        category: selectedCategory || 'Notes',
      });

      clearInterval(progressInterval);

      if (res.success && res.data) {
        setUploadQueue((prev) =>
          prev.map((item) => (item.id === nextPending.id ? { ...item, status: 'success', progress: 100 } : item))
        );
        toast.success(`"${nextPending.file.name}" uploaded and indexed successfully.`);
        
        // Refresh items and storage stats
        fetchDocuments();
        fetchStorageStats();
        fetchTagsList();
      } else {
        throw new Error('Upload response indicated failed completion.');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadQueue((prev) =>
        prev.map((item) => (item.id === nextPending.id ? { ...item, status: 'failed', error: err.message || 'Error occurred.' } : item))
      );
      toast.error(`Failed to upload "${nextPending.file.name}": ${err.message || 'Duplicate file name detected.'}`);
    } finally {
      setIsCurrentlyUploading(false);
    }
  };

  // Trigger uploads on queue changes
  useEffect(() => {
    if (!isCurrentlyUploading) {
      const hasPending = uploadQueue.some((item) => item.status === 'idle');
      if (hasPending) {
        startUploadProcessing();
      }
    }
  }, [uploadQueue, isCurrentlyUploading]);

  // Queue manipulation actions
  const handleRemoveQueueItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRetryQueueItem = (id: string) => {
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'idle', progress: 0, error: undefined } : item))
    );
  };

  const handleCancelQueueItem = (id: string) => {
    // Simply mark failed for cancellation simulation
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'failed', error: 'Upload cancelled by user.' } : item))
    );
  };

  // Individual Document Actions
  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await DocumentApiService.toggleFavorite(id);
      if (res.success && res.data) {
        // Update document state inline
        setDocuments((prev) => prev.map((d) => (d.id === id ? res.data! : d)));
        if (selectedPreviewDoc && selectedPreviewDoc.id === id) {
          setSelectedPreviewDoc(res.data);
        }
        toast.success(res.data.isFavorite ? 'Saved to Favorites.' : 'Removed from Favorites.');
      }
    } catch (err: any) {
      toast.error('Failed to change favorite status.');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await DocumentApiService.archiveDocument(id);
      if (res.success && res.data) {
        // Remove document from the current active listing view
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (selectedPreviewDoc && selectedPreviewDoc.id === id) {
          setSelectedPreviewDoc(res.data);
        }
        toast.success('Document archived successfully.');
        fetchStorageStats();
      }
    } catch (err: any) {
      toast.error('Failed to archive document.');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await DocumentApiService.restoreDocument(id);
      if (res.success && res.data) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (selectedPreviewDoc && selectedPreviewDoc.id === id) {
          setSelectedPreviewDoc(res.data);
        }
        toast.success('Document successfully restored to Active drive.');
        fetchStorageStats();
      }
    } catch (err: any) {
      toast.error('Failed to restore document.');
    }
  };

  const handleRenameTrigger = (id: string, currentTitle: string) => {
    setActionDocId(id);
    setRenameTitle(currentTitle);
    setRenameModalOpen(true);
  };

  const submitRename = async () => {
    if (!actionDocId || !renameTitle.trim()) return;
    try {
      const res = await DocumentApiService.updateDocument(actionDocId, { title: renameTitle.trim() });
      if (res.success && res.data) {
        setDocuments((prev) => prev.map((d) => (d.id === actionDocId ? res.data! : d)));
        toast.success('Document renamed successfully.');
        setRenameModalOpen(false);
      }
    } catch (err: any) {
      toast.error('Failed to rename document.');
    }
  };

  const handleMoveTrigger = (id: string, currentCategory: string) => {
    setActionDocId(id);
    setMoveCategory(currentCategory);
    setMoveModalOpen(true);
  };

  const submitMove = async () => {
    if (!actionDocId || !moveCategory) return;
    try {
      const res = await DocumentApiService.updateDocument(actionDocId, { category: moveCategory });
      if (res.success && res.data) {
        setDocuments((prev) => prev.map((d) => (d.id === actionDocId ? res.data! : d)));
        toast.success(`Document moved to category: ${moveCategory}`);
        setMoveModalOpen(false);
        fetchDocuments(); // refresh list in case it's category-filtered
      }
    } catch (err: any) {
      toast.error('Failed to move category.');
    }
  };

  const handleDeleteTrigger = (id: string) => {
    setActionDocId(id);
    setDeleteModalOpen(true);
  };

  const submitDelete = async () => {
    if (!actionDocId) return;
    try {
      const res = await DocumentApiService.deleteDocument(actionDocId);
      if (res.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== actionDocId));
        toast.success('Document deleted permanently from server disk.');
        setDeleteModalOpen(false);
        fetchStorageStats();
        fetchTagsList();
      }
    } catch (err: any) {
      toast.error('Failed to delete document.');
    }
  };

  const handleDuplicate = async (doc: DocumentResponse) => {
    try {
      toast.loading('Duplicating knowledge artifact...', { id: 'duplicate-toast' });
      // To duplicate, fetch file blob or just make simple backend copy request.
      // Since we don't have a direct backend 'duplicate' express route, we can download the file manually as a Blob
      // and upload it back! This is fully functional client-side duplication!
      const fetchResponse = await fetch(doc.filePath);
      const fileBlob = await fetchResponse.blob();
      const duplicateFile = new File([fileBlob], `Copy of ${doc.originalFilename}`, { type: doc.mimeType });

      const res = await DocumentApiService.uploadDocument(duplicateFile, {
        category: doc.category,
        description: `Duplicate clone of "${doc.title}". ${doc.description}`,
        tags: doc.tags,
      });

      toast.dismiss('duplicate-toast');
      if (res.success) {
        toast.success('Document cloned successfully.');
        fetchDocuments();
        fetchStorageStats();
      }
    } catch (err: any) {
      toast.dismiss('duplicate-toast');
      toast.error('Failed to clone document.');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4 md:p-6 text-zinc-800 dark:text-zinc-200 min-h-screen">
      {/* 1. Left Control Panel / Workspace Sidebar */}
      <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6 select-none">
        {/* New Document quick trigger */}
        <button
          onClick={() => {
            setActiveTab('upload');
            setSelectedCategory('');
          }}
          className="w-full py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Add Documents
        </button>

        {/* Dynamic Sidebar folders / categories */}
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3.5 mb-1.5">
            Personal Library
          </span>

          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedCategory('');
              setSelectedTag('');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all' && !selectedCategory
                ? 'bg-zinc-900 text-white dark:bg-zinc-900 dark:text-white'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Library className="w-4 h-4 shrink-0" />
              <span>All Documents</span>
            </div>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-md font-bold">
              {activeTab === 'all' && !selectedCategory ? totalDocs : 'Drive'}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('favorites');
              setSelectedCategory('');
              setSelectedTag('');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'favorites'
                ? 'bg-zinc-900 text-white dark:bg-zinc-900 dark:text-white'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 shrink-0" />
              <span>Starred Favorites</span>
            </div>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-md font-bold">
              ★
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('archived');
              setSelectedCategory('');
              setSelectedTag('');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'archived'
                ? 'bg-zinc-900 text-white dark:bg-zinc-900 dark:text-white'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Archive className="w-4 h-4 shrink-0" />
              <span>Archived Vault</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('storage');
              setSelectedCategory('');
              setSelectedTag('');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'storage'
                ? 'bg-zinc-900 text-white dark:bg-zinc-900 dark:text-white'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 shrink-0" />
              <span>Storage Metrics</span>
            </div>
          </button>
        </div>

        {/* Folder Categories Selection */}
        {activeTab !== 'storage' && activeTab !== 'upload' && (
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3.5 mb-1.5">
              Workspace Folders
            </span>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedTag('');
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 font-black'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-950/40 text-zinc-500 dark:text-zinc-450'
                }`}
              >
                <Folder className={`w-3.5 h-3.5 shrink-0 ${selectedCategory === cat ? 'fill-current' : ''}`} />
                <span>{cat}</span>
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Tags Explorer */}
        {allExtractedTags.length > 0 && activeTab !== 'storage' && activeTab !== 'upload' && (
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3.5 mb-1">
              Tag Explorer
            </span>
            <div className="flex flex-wrap gap-1 px-3">
              {allExtractedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? '' : tag);
                  }}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                    selectedTag === tag
                      ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white'
                      : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/50 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-350'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Small Storage Progress shortcut */}
        {!storageLoading && storageStats && (
          <div className="mt-auto p-4 rounded-xl border border-zinc-150 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-950/20 text-left select-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-zinc-500" /> Space Utilized
            </span>
            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden mt-2.5">
              <div
                style={{ width: `${Math.round((storageStats.totalStorageUsed / storageStats.maxStorage) * 100)}%` }}
                className="h-full bg-zinc-950 dark:bg-zinc-50 rounded-full"
              />
            </div>
            <p className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 mt-2 text-right">
              {Math.round((storageStats.totalStorageUsed / (1024 * 1024)))} MB / 1024 MB
            </p>
          </div>
        )}
      </div>

      {/* 2. Right Side: Contents & Documents Layout Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Dynamic header title banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div className="text-left">
            <h1 className="text-lg font-black text-zinc-950 dark:text-zinc-50 tracking-tight flex items-center gap-2">
              {activeTab === 'all' && (selectedCategory ? `Workspace: ${selectedCategory}` : 'Document Library')}
              {activeTab === 'favorites' && 'Starred Favorites'}
              {activeTab === 'archived' && 'Archived Vault'}
              {activeTab === 'storage' && 'Storage Insights'}
              {activeTab === 'upload' && 'Upload Center'}
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-medium">
              {activeTab === 'all' && 'Browse, categorize, search, and manage your text files.'}
              {activeTab === 'favorites' && 'Your curated quick-access document list.'}
              {activeTab === 'archived' && 'Archived files are isolated but safely retained.'}
              {activeTab === 'storage' && 'Visual breakdown of storage size distribution.'}
              {activeTab === 'upload' && 'Drag, drop, and process text and PDF documents.'}
            </p>
          </div>

          {/* Toggle buttons for layout formats */}
          {activeTab !== 'storage' && activeTab !== 'upload' && (
            <div className="flex items-center gap-1.5 bg-zinc-50/50 dark:bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-150 dark:border-zinc-900">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Render Active View content */}
        {activeTab === 'storage' ? (
          <StorageCard stats={storageStats} loading={storageLoading} />
        ) : activeTab === 'upload' ? (
          <div className="flex flex-col gap-6">
            <UploadZone onFilesSelected={handleFilesSelected} isUploading={isCurrentlyUploading} />
            <UploadQueue
              queue={uploadQueue}
              onRemove={handleRemoveQueueItem}
              onRetry={handleRetryQueueItem}
              onCancel={handleCancelQueueItem}
            />
          </div>
        ) : (
          /* Main listing views */
          <div className="flex flex-col gap-4">
            {/* Search and Filters Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
            >
              {/* Search text input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search titles, descriptions, tags, content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-zinc-150 bg-white focus:border-zinc-900 dark:border-zinc-900 dark:bg-zinc-950/30 dark:focus:border-zinc-50 text-xs text-zinc-800 dark:text-zinc-200"
                />
              </div>

              {/* Advanced Parameters */}
              <div className="flex gap-2 shrink-0 select-none">
                {/* File Type Filter */}
                <select
                  value={fileTypeFilter}
                  onChange={(e) => {
                    setFileTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3.5 py-2.5 rounded-2xl border border-zinc-150 bg-white dark:border-zinc-900 dark:bg-zinc-950/20 text-xs font-semibold text-zinc-700 dark:text-zinc-350 cursor-pointer"
                >
                  <option value="">Formats</option>
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="txt">TXT</option>
                </select>

                {/* Sort Option */}
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3.5 py-2.5 rounded-2xl border border-zinc-150 bg-white dark:border-zinc-900 dark:bg-zinc-950/20 text-xs font-semibold text-zinc-700 dark:text-zinc-350 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="name">Alphabetical</option>
                  <option value="size">Largest Size</option>
                  <option value="pages">Most Pages</option>
                </select>

                {/* Clear all */}
                {(searchQuery || selectedCategory || selectedTag || fileTypeFilter) && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="p-2.5 rounded-2xl border border-zinc-150 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-900 dark:bg-zinc-950 text-xs text-zinc-550 font-bold hover:text-zinc-800 transition-colors cursor-pointer"
                    title="Reset all filters"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            {/* List/Grid Documents container */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 select-none">
                <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                <span className="text-xs text-zinc-400 font-extrabold">Querying knowledge drive...</span>
              </div>
            ) : documents.length === 0 ? (
              /* Empty Library State */
              <div className="p-12 text-center border border-zinc-150 bg-white dark:border-zinc-900 dark:bg-zinc-950/20 rounded-3xl flex flex-col items-center gap-4 select-none">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-full text-zinc-400">
                  <UploadCloud className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="max-w-md flex flex-col gap-1">
                  <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                    {searchQuery || selectedCategory || selectedTag || fileTypeFilter
                      ? 'No documents matched search filters'
                      : 'Your Knowledge Base is currently empty'}
                  </h3>
                  <p className="text-[11px] text-zinc-450 dark:text-zinc-500 leading-normal">
                    {searchQuery || selectedCategory || selectedTag || fileTypeFilter
                      ? 'Try clearing active keywords, tag selections, format toggles, or category filters.'
                      : 'Index research articles, homework notes, textbooks, and document folders up to 100MB.'}
                  </p>
                </div>
                {searchQuery || selectedCategory || selectedTag || fileTypeFilter ? (
                  <button
                    onClick={handleClearAllFilters}
                    className="mt-2 px-4 py-2 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-extrabold rounded-xl hover:opacity-90"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-2 px-4 py-2 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-extrabold rounded-xl hover:opacity-90 flex items-center gap-1.5"
                  >
                    Upload first document <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              /* Document Listing rendering */
              <div className="flex flex-col gap-5">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onPreview={setSelectedPreviewDoc}
                        onToggleFavorite={handleToggleFavorite}
                        onArchive={handleArchive}
                        onRestore={handleRestore}
                        onRename={handleRenameTrigger}
                        onDelete={handleDeleteTrigger}
                        onDuplicate={handleDuplicate}
                        onMoveCategory={handleMoveTrigger}
                      />
                    ))}
                  </div>
                ) : (
                  <DocumentTable
                    documents={documents}
                    onPreview={setSelectedPreviewDoc}
                    onToggleFavorite={handleToggleFavorite}
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onRename={handleRenameTrigger}
                    onDelete={handleDeleteTrigger}
                    onDuplicate={handleDuplicate}
                    onMoveCategory={handleMoveTrigger}
                  />
                )}

                {/* Pagination Controls */}
                {totalPagesCount > 1 && (
                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900/50 pt-4 mt-2 select-none">
                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Page {currentPage} of {totalPagesCount} ({totalDocs} total)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-zinc-150 hover:bg-zinc-50 dark:border-zinc-850 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-450 disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage((c) => Math.min(totalPagesCount, c + 1))}
                        disabled={currentPage === totalPagesCount}
                        className="p-1.5 rounded-lg border border-zinc-150 hover:bg-zinc-50 dark:border-zinc-850 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-450 disabled:opacity-40"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Popups and Submodals overlays */}

      {/* Document Immersive Preview modal */}
      <AnimatePresence>
        {selectedPreviewDoc && (
          <DocumentPreviewModal
            document={selectedPreviewDoc}
            onClose={() => {
              setSelectedPreviewDoc(null);
              fetchDocuments(); // Sync title/details changes back to list
            }}
            onUpdate={(updated) => {
              setSelectedPreviewDoc(updated);
              setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
            }}
            onToggleFavorite={handleToggleFavorite}
            onArchive={handleArchive}
            onRestore={handleRestore}
          />
        )}
      </AnimatePresence>

      {/* Rename Dialog Modal */}
      <AnimatePresence>
        {renameModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" onClick={() => setRenameModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative z-10 text-left"
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3.5">
                Rename Knowledge Artifact
              </h3>
              <input
                type="text"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                placeholder="Document title"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-950 bg-white dark:border-zinc-850 dark:bg-zinc-900 dark:focus:border-zinc-50 text-xs font-extrabold text-zinc-800 dark:text-zinc-200"
              />
              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => setRenameModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-150 hover:bg-zinc-50 dark:border-zinc-850 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-550 dark:text-zinc-450"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRename}
                  disabled={!renameTitle.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 text-xs font-black hover:opacity-90 disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Move Category Dialog Modal */}
      <AnimatePresence>
        {moveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" onClick={() => setMoveModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative z-10 text-left"
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3.5">
                Move Category Folder
              </h3>
              <select
                value={moveCategory}
                onChange={(e) => setMoveCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-zinc-950 bg-white dark:border-zinc-850 dark:bg-zinc-900 dark:focus:border-zinc-50 text-xs font-extrabold text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => setMoveModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-150 hover:bg-zinc-50 dark:border-zinc-850 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-550 dark:text-zinc-450"
                >
                  Cancel
                </button>
                <button
                  onClick={submitMove}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 text-xs font-black hover:opacity-90"
                >
                  Move Folder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Permanent Delete Confirmation Dialog Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" onClick={() => setDeleteModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative z-10 text-left"
            >
              <div className="flex items-center gap-2 text-red-500 mb-3 select-none">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Delete Document Permanently?
                </h3>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                This action is irreversible. The document metadata and physical file will be deleted permanently from the server disk.
              </p>
              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-150 hover:bg-zinc-50 dark:border-zinc-850 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-550 dark:text-zinc-450"
                >
                  Cancel
                </button>
                <button
                  onClick={submitDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default KnowledgeBasePage;
