import React, { useRef } from 'react';
import { IAnnotation } from '../../services/viewerApi';
import { FileText } from 'lucide-react';

interface DOCXViewerProps {
  textContent: string;
  currentPage: number;
  zoomLevel: number;
  annotations: IAnnotation[];
  onTextSelect: (text: string, pageNum: number, event: MouseEvent) => void;
  highlightedChunkIndex?: number | null;
}

export const DOCXViewer: React.FC<DOCXViewerProps> = ({
  textContent,
  currentPage,
  zoomLevel,
  annotations,
  onTextSelect,
  highlightedChunkIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Split text into paragraphs
  const paragraphs = textContent
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean);

  const paragraphsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(paragraphs.length / paragraphsPerPage));

  const startIdx = (currentPage - 1) * paragraphsPerPage;
  const pageParagraphs = paragraphs.slice(startIdx, startIdx + paragraphsPerPage);

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
        id="docx-paper-sheet"
        className="relative bg-slate-950/40 border border-slate-800 rounded-2xl p-10 md:p-16 shadow-2xl transition-all font-sans text-slate-200 w-full max-w-4xl min-h-[900px] flex flex-col justify-between"
        style={{ 
          fontSize: `${15 * zoomLevel}px`,
          lineHeight: '1.8'
        }}
      >
        <div>
          {/* Elegant Document Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-8 text-[11px] font-medium tracking-wide text-slate-400">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>OFFICE WORD DOCUMENT OUTLINE</span>
            </div>
            <span>PAGE {currentPage} / {totalPages}</span>
          </div>

          {/* Document Content */}
          <div className="space-y-6 select-text selection:bg-indigo-500/30 selection:text-indigo-200">
            {pageParagraphs.length > 0 ? (
              pageParagraphs.map((paragraph, idx) => {
                // Find matching annotations for this paragraph
                const activeAnn = annotations.find(
                  ann => ann.page === currentPage && ann.textSelection && paragraph.includes(ann.textSelection)
                );

                const colorClasses: Record<string, string> = {
                  yellow: 'bg-yellow-500/20 text-yellow-100 border-l-2 border-yellow-500/50 pl-3',
                  blue: 'bg-sky-500/20 text-sky-100 border-l-2 border-sky-500/50 pl-3',
                  green: 'bg-emerald-500/20 text-emerald-100 border-l-2 border-emerald-500/50 pl-3',
                  pink: 'bg-pink-500/20 text-pink-100 border-l-2 border-pink-500/50 pl-3',
                  amber: 'bg-amber-500/20 text-amber-100 border-l-2 border-amber-500/50 pl-3',
                };

                const highlightStyle = activeAnn ? colorClasses[activeAnn.highlightColor || 'yellow'] : '';
                const isChunkHighlighted = idx === highlightedChunkIndex;

                return (
                  <p 
                    key={idx} 
                    className={`rounded py-1 px-2 transition-all duration-300 ${
                      highlightStyle 
                        ? highlightStyle 
                        : isChunkHighlighted 
                          ? 'bg-indigo-600/30 border-l-2 border-indigo-500 pl-3 text-white ring-1 ring-indigo-500/20 animate-pulse'
                          : 'hover:bg-slate-800/10'
                    }`}
                  >
                    {paragraph}
                  </p>
                );
              })
            ) : (
              <div className="text-center py-24 text-slate-500 italic text-xs">
                This page has no text paragraphs.
              </div>
            )}
          </div>
        </div>

        {/* Professional Footer */}
        <div className="border-t border-slate-800 pt-5 mt-12 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider">
          <span>AI Personal Knowledge Assistant</span>
          <span>Draft Copy</span>
        </div>
      </div>
    </div>
  );
};
