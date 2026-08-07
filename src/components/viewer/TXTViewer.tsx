import React, { useRef, useEffect } from 'react';
import { IAnnotation } from '../../services/viewerApi';

interface TXTViewerProps {
  textContent: string;
  currentPage: number;
  zoomLevel: number;
  annotations: IAnnotation[];
  onTextSelect: (text: string, pageNum: number, event: MouseEvent) => void;
  highlightedChunkIndex?: number | null;
}

export const TXTViewer: React.FC<TXTViewerProps> = ({
  textContent,
  currentPage,
  zoomLevel,
  annotations,
  onTextSelect,
  highlightedChunkIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Divide text into pages (e.g., ~45 lines or 3000 chars per page)
  const lines = textContent.split('\n');
  const linesPerPage = 45;
  const totalPages = Math.max(1, Math.ceil(lines.length / linesPerPage));
  
  const startIdx = (currentPage - 1) * linesPerPage;
  const pageLines = lines.slice(startIdx, startIdx + linesPerPage);
  const pageText = pageLines.join('\n');

  // Handle mouseup selection event
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
        id="txt-paper-sheet"
        className="relative bg-slate-950/50 border border-slate-800 rounded-xl p-8 md:p-12 shadow-2xl transition-all font-mono text-sm leading-relaxed text-slate-300 w-full max-w-3xl overflow-hidden min-h-[800px]"
        style={{ 
          fontSize: `${14 * zoomLevel}px`,
          lineHeight: '1.75'
        }}
      >
        {/* Page header indicator */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 text-[10px] tracking-wider text-slate-500">
          <span>PLAINTEXT DOCUMENT PREVIEW</span>
          <span>PAGE {currentPage} / {totalPages}</span>
        </div>

        {/* Text body */}
        <div className="whitespace-pre-wrap select-text selection:bg-indigo-500/30 selection:text-indigo-200">
          {pageText ? (
            pageText.split('\n').map((line, idx) => {
              // Find matching annotations for this line/page text
              const isLineHighlighted = annotations.some(
                ann => ann.page === currentPage && ann.textSelection && line.includes(ann.textSelection)
              );

              // Find current active note/highlight
              const activeAnn = annotations.find(
                ann => ann.page === currentPage && ann.textSelection && line.includes(ann.textSelection)
              );

              const colorClasses: Record<string, string> = {
                yellow: 'bg-yellow-500/20 text-yellow-200 border-b border-yellow-500/30',
                blue: 'bg-sky-500/20 text-sky-200 border-b border-sky-500/30',
                green: 'bg-emerald-500/20 text-emerald-200 border-b border-emerald-500/30',
                pink: 'bg-pink-500/20 text-pink-200 border-b border-pink-500/30',
                amber: 'bg-amber-500/20 text-amber-200 border-b border-amber-500/30',
              };

              const highlightStyle = activeAnn ? colorClasses[activeAnn.highlightColor || 'yellow'] : '';

              return (
                <div 
                  key={idx} 
                  className={`py-0.5 rounded px-1 transition-all ${
                    highlightStyle 
                      ? highlightStyle 
                      : idx === highlightedChunkIndex 
                        ? 'bg-indigo-600/30 text-indigo-100 ring-2 ring-indigo-500/40 animate-pulse'
                        : 'hover:bg-slate-800/20'
                  }`}
                >
                  {line || '\u00A0'}
                </div>
              );
            })
          ) : (
            <div className="text-center py-24 text-slate-500 italic text-xs">
              This page has no text content.
            </div>
          )}
        </div>

        {/* Floating background sheet lines */}
        <div className="absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      </div>
    </div>
  );
};
