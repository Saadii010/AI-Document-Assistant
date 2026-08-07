import React, { useRef, useState, useEffect } from 'react';
import { IAnnotation, ViewerApiService } from '../../services/viewerApi';
import { FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface PDFViewerProps {
  documentId: string;
  currentPage: number;
  zoomLevel: number;
  annotations: IAnnotation[];
  onTextSelect: (text: string, pageNum: number, event: MouseEvent) => void;
  highlightedChunkIndex?: number | null;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  documentId,
  currentPage,
  zoomLevel,
  annotations,
  onTextSelect,
  highlightedChunkIndex,
}) => {
  const [chunks, setChunks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const fetchPageChunks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ViewerApiService.getPageContent(documentId, currentPage);
        if (response.success && response.data && active) {
          setChunks(response.data.chunks || []);
        } else if (active) {
          setError(response.message || 'Failed to load page content.');
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'An error occurred while loading this page.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchPageChunks();
    return () => {
      active = false;
    };
  }, [documentId, currentPage]);

  const handleMouseUp = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      onTextSelect(selectedText, currentPage, e.nativeEvent);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full flex justify-center py-6 focus:outline-none"
      onMouseUp={handleMouseUp}
    >
      <div 
        id="pdf-paper-sheet"
        className="relative bg-slate-950/40 border border-slate-800 rounded-2xl p-8 md:p-14 shadow-2xl transition-all font-sans text-slate-200 w-full max-w-4xl min-h-[900px] flex flex-col justify-between"
        style={{ 
          fontSize: `${15 * zoomLevel}px`,
          lineHeight: '1.75'
        }}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-8 text-[11px] font-medium tracking-wide text-slate-400">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" />
              <span>DIGITAL PDF PAGE WRAPPER</span>
            </div>
            <span>PAGE {currentPage}</span>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-500">Retrieving digital text chunks...</p>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-32 text-center p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl gap-3">
              <AlertCircle className="w-8 h-8 text-rose-400" />
              <p className="text-sm font-semibold text-rose-200">Failed to render PDF text</p>
              <p className="text-xs text-slate-400 max-w-md">{error}</p>
            </div>
          )}

          {/* Content area */}
          {!isLoading && !error && (
            <div className="space-y-6 select-text selection:bg-indigo-500/30 selection:text-indigo-200">
              {chunks.length > 0 ? (
                chunks.map((chunk, idx) => {
                  // Find matching annotations for this chunk's text
                  const activeAnn = annotations.find(
                    ann => ann.page === currentPage && ann.textSelection && chunk.text.includes(ann.textSelection)
                  );

                  const colorClasses: Record<string, string> = {
                    yellow: 'bg-yellow-500/25 text-yellow-100 border-l-2 border-yellow-500 pl-3.5',
                    blue: 'bg-sky-500/25 text-sky-100 border-l-2 border-sky-500 pl-3.5',
                    green: 'bg-emerald-500/25 text-emerald-100 border-l-2 border-emerald-500 pl-3.5',
                    pink: 'bg-pink-500/25 text-pink-100 border-l-2 border-pink-500 pl-3.5',
                    amber: 'bg-amber-500/25 text-amber-100 border-l-2 border-amber-500 pl-3.5',
                  };

                  const highlightStyle = activeAnn ? colorClasses[activeAnn.highlightColor || 'yellow'] : '';
                  const isChunkHighlighted = idx === highlightedChunkIndex;

                  return (
                    <div 
                      key={chunk.chunkId || idx}
                      className={`rounded py-2 px-3 transition-all duration-300 ${
                        highlightStyle 
                          ? highlightStyle 
                          : isChunkHighlighted 
                            ? 'bg-indigo-600/30 border-l-2 border-indigo-500 pl-3.5 text-white ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/5 animate-pulse'
                            : 'hover:bg-slate-800/10'
                      }`}
                    >
                      {chunk.text}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-36 text-slate-500 text-center gap-2">
                  <Sparkles className="w-8 h-8 text-indigo-400/50 mb-2" />
                  <p className="text-xs font-semibold text-slate-400">Secure PDF Outline</p>
                  <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                    This is an interactive PDF text preview. Standard annotations can still be placed.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-5 mt-12 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider">
          <span>Adobe Acrobat & NotebookLM Experience</span>
          <span>Digital Extract</span>
        </div>
      </div>
    </div>
  );
};
