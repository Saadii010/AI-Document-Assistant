import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ViewerApiService, 
  IDocument, 
  IBookmark, 
  IAnnotation, 
  IReadingHistory, 
  IViewerSettings,
  ICitationInfo
} from '../services/viewerApi';

import { DocumentSidebar } from '../components/viewer/DocumentSidebar';
import { CitationPanel } from '../components/viewer/CitationPanel';
import { PDFViewer } from '../components/viewer/PDFViewer';
import { DOCXViewer } from '../components/viewer/DOCXViewer';
import { TXTViewer } from '../components/viewer/TXTViewer';

import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Settings, 
  MessageSquare, 
  Bookmark, 
  FolderOpen, 
  Home, 
  Menu, 
  Highlighter, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  PenLine,
  ChevronDown,
  Loader2
} from 'lucide-react';

export const ViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Primary State
  const [document, setDocument] = useState<IDocument | null>(null);
  const [bookmarks, setBookmarks] = useState<IBookmark[]>([]);
  const [annotations, setAnnotations] = useState<IAnnotation[]>([]);
  const [readingHistory, setReadingHistory] = useState<IReadingHistory[]>([]);
  const [settings, setSettings] = useState<IViewerSettings>({
    zoomLevel: 1.0,
    fitMode: 'none',
    theme: 'system',
    sidebarOpen: true,
    sidebarTab: 'pages'
  });

  // Flow State
  const [currentPage, setCurrentPage] = useState(1);
  const [textContent, setTextContent] = useState('');
  const [activeCitation, setActiveCitation] = useState<ICitationInfo | null>(null);
  const [highlightedChunkIndex, setHighlightedChunkIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Floating Selection Toolbar State
  const [selectionText, setSelectionText] = useState('');
  const [selectionPage, setSelectionPage] = useState(1);
  const [toolbarCoords, setToolbarCoords] = useState<{ x: number; y: number } | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteComment, setNoteComment] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');

  // Reading Time Tracker Ref
  const readSecondsAccumulator = useRef(0);
  const saveIntervalRef = useRef<any>(null);

  // Check state passed via router location (from AI Chat citations or Search)
  useEffect(() => {
    if (location.state && document) {
      const state = location.state as {
        page?: number;
        chunkId?: string;
        highlightText?: string;
        paragraphNumber?: number;
      };

      if (state.page) {
        setCurrentPage(state.page);
      }
      if (state.chunkId) {
        // Look up citation info dynamically
        ViewerApiService.getCitation(state.chunkId).then((res) => {
          if (res.success && res.data) {
            setActiveCitation(res.data);
          }
        });
      }
      if (state.paragraphNumber) {
        setHighlightedChunkIndex(state.paragraphNumber - 1);
      }
    }
  }, [location.state, document]);

  // Load Primary Data
  useEffect(() => {
    if (!id) return;
    
    const loadDocumentData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ViewerApiService.getDocument(id);
        if (response.success && response.data) {
          const data = response.data;
          setDocument(data.document);
          setBookmarks(data.bookmarks || []);
          setAnnotations(data.annotations || []);
          if (data.settings) {
            setSettings(data.settings);
          }
          if (data.history) {
            setCurrentPage(data.history.currentPage || 1);
          }
          if (data.textContent) {
            setTextContent(data.textContent);
          }

          // Trigger background history load
          ViewerApiService.getHistory().then((histRes) => {
            if (histRes.success && histRes.data) {
              setReadingHistory(histRes.data);
            }
          });
        } else {
          setError(response.message || 'Failed to load document view.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to connect to backend document storage.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocumentData();
  }, [id]);

  // Track Reading Progress Seconds
  useEffect(() => {
    readSecondsAccumulator.current = 0;
    
    // Clear old timer if any
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    // Set up continuous progress log every 30 seconds
    saveIntervalRef.current = setInterval(() => {
      if (!id || !document) return;
      readSecondsAccumulator.current += 30;

      const progressPercent = Math.min(100, Math.round((currentPage / (document.totalPages || 1)) * 100));

      ViewerApiService.updateProgress({
        documentId: id,
        currentPage,
        progress: progressPercent,
        readingTimeSeconds: 30,
        lastPosition: `Page ${currentPage}`
      });
    }, 30000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      // Report final pending reading time on unmount
      if (id && document && readSecondsAccumulator.current > 0) {
        const progressPercent = Math.min(100, Math.round((currentPage / (document.totalPages || 1)) * 100));
        ViewerApiService.updateProgress({
          documentId: id,
          currentPage,
          progress: progressPercent,
          readingTimeSeconds: readSecondsAccumulator.current % 30 || 10,
          lastPosition: `Page ${currentPage}`
        });
      }
    };
  }, [id, document, currentPage]);

  // Page turning triggers immediate save of page number
  const handlePageChange = (page: number) => {
    if (!document) return;
    const boundedPage = Math.max(1, Math.min(document.totalPages || 1, page));
    setCurrentPage(boundedPage);
    setToolbarCoords(null); // Clear selection floating tool

    const progressPercent = Math.min(100, Math.round((boundedPage / (document.totalPages || 1)) * 100));
    
    if (id) {
      ViewerApiService.updateProgress({
        documentId: id,
        currentPage: boundedPage,
        progress: progressPercent,
        readingTimeSeconds: 0,
        lastPosition: `Page ${boundedPage}`
      });
    }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if writing in input fields
      if (
        document && 
        window.getSelection()?.toString().length === 0 &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        switch (e.key) {
          case 'ArrowLeft':
          case 'PageUp':
            handlePageChange(currentPage - 1);
            break;
          case 'ArrowRight':
          case 'PageDown':
            handlePageChange(currentPage + 1);
            break;
          case 'b':
          case 'B':
            handleAddBookmark();
            break;
          case 'Escape':
            setToolbarCoords(null);
            setActiveCitation(null);
            setHighlightedChunkIndex(null);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, document]);

  // Bookmarks handlers
  const handleAddBookmark = async () => {
    if (!id || !document) return;
    try {
      const response = await ViewerApiService.createBookmark({
        documentId: id,
        title: `Page ${currentPage} Bookmark`,
        page: currentPage,
        paragraphIndex: 0
      });

      if (response.success && response.data) {
        setBookmarks((prev) => [...prev, response.data!]);
      }
    } catch (err) {
      console.error('Failed to create bookmark:', err);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      const response = await ViewerApiService.deleteBookmark(bookmarkId);
      if (response.success) {
        setBookmarks((prev) => prev.filter((b) => (b.id !== bookmarkId && b._id !== bookmarkId)));
      }
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
    }
  };

  // Annotations handlers
  const handleTextSelect = (text: string, pageNum: number, event: MouseEvent) => {
    setSelectionText(text);
    setSelectionPage(pageNum);
    
    // Position toolbar beautifully above selection
    setToolbarCoords({
      x: Math.min(window.innerWidth - 220, Math.max(20, event.clientX - 100)),
      y: Math.max(20, event.clientY - 60)
    });
    setIsAddingNote(false);
  };

  const handleApplyHighlight = async (color: string) => {
    if (!id || !selectionText) return;
    try {
      const response = await ViewerApiService.createNote({
        documentId: id,
        page: selectionPage,
        textSelection: selectionText,
        highlightColor: color,
        comment: '',
        isPrivate: true
      });

      if (response.success && response.data) {
        setAnnotations((prev) => [...prev, response.data!]);
        setToolbarCoords(null);
      }
    } catch (err) {
      console.error('Failed to save highlight:', err);
    }
  };

  const handleSaveNoteComment = async () => {
    if (!id || !selectionText) return;
    try {
      const response = await ViewerApiService.createNote({
        documentId: id,
        page: selectionPage,
        textSelection: selectionText,
        highlightColor: selectedColor,
        comment: noteComment,
        isPrivate: true
      });

      if (response.success && response.data) {
        setAnnotations((prev) => [...prev, response.data!]);
        setToolbarCoords(null);
        setNoteComment('');
      }
    } catch (err) {
      console.error('Failed to save note annotation:', err);
    }
  };

  const handleDeleteAnnotation = async (annId: string) => {
    try {
      const response = await ViewerApiService.deleteNote(annId);
      if (response.success) {
        setAnnotations((prev) => prev.filter((a) => (a.id !== annId && a._id !== annId)));
      }
    } catch (err) {
      console.error('Failed to delete annotation:', err);
    }
  };

  // Navigation Deep Links
  const handleAskAIAboutPassage = (passageText: string) => {
    // Cross-page navigation: open Chat with focused prefilled text & context
    navigate('/ai-chat', {
      state: {
        prefilledMessage: `Can you summarize this passage for me?\n\n"${passageText}"`,
        activeDocumentId: id
      }
    });
  };

  const handleSwitchDocument = (docId: string) => {
    navigate(`/viewer/${docId}`);
  };

  const toggleSidebar = () => {
    const nextOpen = !settings.sidebarOpen;
    setSettings((prev) => ({ ...prev, sidebarOpen: nextOpen }));
    ViewerApiService.updateSettings({ sidebarOpen: nextOpen });
  };

  const handleSidebarTabChange = (tab: string) => {
    setSettings((prev) => ({ ...prev, sidebarTab: tab }));
    ViewerApiService.updateSettings({ sidebarTab: tab });
  };

  const adjustZoom = (delta: number) => {
    const nextZoom = Math.max(0.6, Math.min(2.0, settings.zoomLevel + delta));
    setSettings((prev) => ({ ...prev, zoomLevel: nextZoom }));
    ViewerApiService.updateSettings({ zoomLevel: nextZoom });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Top Navigation Ribbon Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
            title="Go to Home Dashboard"
          >
            <Home className="w-5 h-5" />
          </button>
          
          <div className="h-4 w-px bg-slate-800" />

          {/* Document Title Metadata */}
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
              {document?.category || 'RESEARCH DOCUMENT'}
            </span>
            <h1 className="text-sm font-bold text-slate-100 truncate max-w-lg">
              {isLoading ? 'Loading document...' : document?.title}
            </h1>
          </div>
        </div>

        {/* Dynamic Zoom, Fit & Panel Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950/60 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => adjustZoom(-0.1)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 font-semibold text-slate-400 w-12 text-center select-none">
              {Math.round(settings.zoomLevel * 100)}%
            </span>
            <button
              onClick={() => adjustZoom(0.1)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Page Navigator toolbar */}
          <div className="flex items-center bg-slate-950/60 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-400">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold select-none text-slate-300">
              {currentPage} / {document?.totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!document || currentPage >= document.totalPages}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
              settings.sidebarOpen 
                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className="w-4 h-4" />
            <span className="text-xs font-semibold select-none hidden sm:inline">Outline</span>
          </button>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar panels */}
        {settings.sidebarOpen && document && (
          <DocumentSidebar
            totalPages={document.totalPages || 1}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            bookmarks={bookmarks}
            annotations={annotations}
            readingHistory={readingHistory}
            onAddBookmark={handleAddBookmark}
            onDeleteBookmark={handleDeleteBookmark}
            onAnnotationClick={(note) => {
              setCurrentPage(note.page);
              setHighlightedChunkIndex(null);
            }}
            onDeleteAnnotation={handleDeleteAnnotation}
            onSwitchDocument={handleSwitchDocument}
            activeTab={settings.sidebarTab}
            setActiveTab={handleSidebarTabChange}
          />
        )}

        {/* Main Document Frame */}
        <div className="flex-1 overflow-y-auto bg-slate-950 relative flex justify-center custom-scrollbar focus:outline-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-sm text-slate-400">Loading document canvas environment...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center gap-4 py-40">
              <AlertCircle className="w-12 h-12 text-rose-500" />
              <h2 className="text-lg font-bold">Failed to load reader</h2>
              <p className="text-xs text-slate-500">{error}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-lg"
              >
                Return to Dashboard
              </button>
            </div>
          ) : document ? (
            <div className="w-full max-w-5xl px-4 md:px-8">
              {document.fileType === 'pdf' && (
                <PDFViewer
                  documentId={document.id || document._id}
                  currentPage={currentPage}
                  zoomLevel={settings.zoomLevel}
                  annotations={annotations}
                  onTextSelect={handleTextSelect}
                  highlightedChunkIndex={highlightedChunkIndex}
                />
              )}
              {document.fileType === 'docx' && (
                <DOCXViewer
                  textContent={textContent}
                  currentPage={currentPage}
                  zoomLevel={settings.zoomLevel}
                  annotations={annotations}
                  onTextSelect={handleTextSelect}
                  highlightedChunkIndex={highlightedChunkIndex}
                />
              )}
              {document.fileType === 'txt' && (
                <TXTViewer
                  textContent={textContent}
                  currentPage={currentPage}
                  zoomLevel={settings.zoomLevel}
                  annotations={annotations}
                  onTextSelect={handleTextSelect}
                  highlightedChunkIndex={highlightedChunkIndex}
                />
              )}
            </div>
          ) : null}

          {/* Floating Text Selection Toolbar Popover */}
          <AnimatePresence>
            {toolbarCoords && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute z-50 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl p-2.5 flex flex-col gap-2.5 max-w-sm backdrop-blur-md"
                style={{
                  left: `${toolbarCoords.x}px`,
                  top: `${toolbarCoords.y}px`
                }}
              >
                {!isAddingNote ? (
                  <div className="flex items-center gap-1">
                    {/* Highlighter tool options */}
                    {['yellow', 'blue', 'green', 'pink', 'amber'].map((color) => {
                      const colorClasses: Record<string, string> = {
                        yellow: 'bg-yellow-400 hover:bg-yellow-300 text-yellow-950',
                        blue: 'bg-sky-400 hover:bg-sky-300 text-sky-950',
                        green: 'bg-emerald-400 hover:bg-emerald-300 text-emerald-950',
                        pink: 'bg-pink-400 hover:bg-pink-300 text-pink-950',
                        amber: 'bg-amber-400 hover:bg-amber-300 text-amber-950',
                      };
                      return (
                        <button
                          key={color}
                          onClick={() => handleApplyHighlight(color)}
                          className={`w-6 h-6 rounded-full transition-transform hover:scale-110 active:scale-95 ${colorClasses[color]}`}
                          title={`Highlight ${color}`}
                        />
                      );
                    })}

                    <div className="h-4 w-px bg-slate-800 mx-1.5" />

                    <button
                      onClick={() => setIsAddingNote(true)}
                      className="p-1.5 rounded hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 transition-colors"
                      title="Add Personal Note"
                    >
                      <PenLine className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleAskAIAboutPassage(selectionText)}
                      className="p-1.5 rounded hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 transition-colors"
                      title="Ask AI Chat about selection"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectionText);
                        setToolbarCoords(null);
                      }}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy text selection"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-56">
                    <textarea
                      placeholder="Type a custom annotation note..."
                      value={noteComment}
                      onChange={(e) => setNoteComment(e.target.value)}
                      className="w-full h-16 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {['yellow', 'blue', 'green'].map((col) => (
                          <button
                            key={col}
                            onClick={() => setSelectedColor(col)}
                            className={`w-4 h-4 rounded-full transition-transform ${
                              selectedColor === col ? 'ring-2 ring-indigo-400' : ''
                            }`}
                            style={{ backgroundColor: col === 'blue' ? '#38bdf8' : col === 'green' ? '#34d399' : '#facc15' }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setIsAddingNote(false)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNoteComment}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-[10px] font-bold text-white shadow"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Citation Insight Sidebar panel */}
        <AnimatePresence>
          {activeCitation && (
            <CitationPanel
              citation={activeCitation}
              onClose={() => {
                setActiveCitation(null);
                setHighlightedChunkIndex(null);
              }}
              onAskChat={handleAskAIAboutPassage}
              onAddBookmark={async (page, snip) => {
                if (!id) return;
                try {
                  const res = await ViewerApiService.createBookmark({
                    documentId: id,
                    title: snip,
                    page,
                    paragraphIndex: 0
                  });
                  if (res.success && res.data) {
                    setBookmarks((prev) => [...prev, res.data!]);
                  }
                } catch (e) {
                  console.error('Bookmark from citation failed:', e);
                }
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default ViewerPage;
