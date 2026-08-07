import React, { useState, useRef } from 'react';
import { Upload, File, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelected, isUploading = false }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndFilterFiles = (filesList: File[]): File[] => {
    setErrorMessage(null);
    const validFiles: File[] = [];
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB

    for (const file of filesList) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        setErrorMessage(`"${file.name}" is not supported. Please upload PDF, DOCX, or TXT files only.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        setErrorMessage(`"${file.name}" exceeds the 100MB limit. Please upload a smaller file.`);
        continue;
      }
      validFiles.push(file);
    }

    return validFiles;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      const filtered = validateAndFilterFiles(droppedFiles);
      if (filtered.length > 0) {
        onFilesSelected(filtered);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files) as File[];
      const filtered = validateAndFilterFiles(selectedFiles);
      if (filtered.length > 0) {
        onFilesSelected(filtered);
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <motion.div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        whileHover={{ scale: 0.995 }}
        whileTap={{ scale: 0.99 }}
        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all min-h-[220px] select-none ${
          isDragActive
            ? 'border-zinc-900 bg-zinc-50/55 dark:border-zinc-100 dark:bg-zinc-900/35'
            : 'border-zinc-200 hover:border-zinc-400 bg-white dark:border-zinc-800 dark:hover:border-zinc-700 dark:bg-zinc-950/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {/* Animated Upload Icon Container */}
        <div className={`p-4 rounded-full transition-all ${
          isDragActive 
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 scale-110' 
            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'
        }`}>
          <Upload className={`w-6 h-6 ${isUploading ? 'animate-bounce' : ''}`} />
        </div>

        <div className="flex flex-col gap-1.5 max-w-sm">
          <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
            Drag & Drop files here, or <span className="text-zinc-950 dark:text-white underline font-black decoration-2">browse</span>
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-normal">
            Support PDF, DOCX, and TXT files up to 100MB per document
          </span>
        </div>

        {isDragActive && (
          <div className="absolute inset-0 bg-zinc-900/10 dark:bg-zinc-100/5 rounded-2xl pointer-events-none flex items-center justify-center">
            <span className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
              Drop to Queue Upload
            </span>
          </div>
        )}
      </motion.div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-red-150 bg-red-50 text-red-600 dark:border-red-950/20 dark:bg-red-950/15 dark:text-red-400 text-xs font-semibold animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
