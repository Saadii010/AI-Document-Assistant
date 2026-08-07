import React from 'react';
import { ISearchFilters } from './types';
import { 
  FileText, 
  Calendar, 
  Tag, 
  Folder, 
  Star, 
  Archive, 
  SlidersHorizontal, 
  RotateCcw, 
  ChevronDown 
} from 'lucide-react';

interface SearchFiltersProps {
  filters: ISearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<ISearchFilters>>;
  onReset: () => void;
  availableTags: string[];
  availableCategories: string[];
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  setFilters,
  onReset,
  availableTags = [],
  availableCategories = []
}) => {
  const handleFileTypeToggle = (type: string) => {
    const current = filters.fileTypes || [];
    let updated: string[];
    if (current.includes(type)) {
      updated = current.filter((t) => t !== type);
    } else {
      updated = [...current, type];
    }
    setFilters((prev) => ({ ...prev, fileTypes: updated }));
  };

  const handleTagToggle = (tag: string) => {
    const current = filters.tags || [];
    let updated: string[];
    if (current.includes(tag)) {
      updated = current.filter((t) => t !== tag);
    } else {
      updated = [...current, tag];
    }
    setFilters((prev) => ({ ...prev, tags: updated }));
  };

  const toggleFavoriteOnly = () => {
    setFilters((prev) => ({ 
      ...prev, 
      isFavorite: prev.isFavorite === true ? undefined : true 
    }));
  };

  const toggleArchivedOnly = () => {
    setFilters((prev) => ({ 
      ...prev, 
      isArchived: prev.isArchived === true ? undefined : true 
    }));
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', val: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: val || undefined,
    }));
  };

  const handleSizeChange = (field: 'minSize' | 'maxSize', val: number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  return (
    <div id="search-filters-container" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-6">
      
      {/* Filters Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-150 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Search Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* Scope Switchers */}
      <div className="flex flex-col gap-2">
        <button
          onClick={toggleFavoriteOnly}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            filters.isFavorite === true
              ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-300'
              : 'bg-zinc-50 border-zinc-200/50 text-zinc-600 dark:bg-zinc-900/40 dark:border-zinc-800/60 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <Star className={`w-3.5 h-3.5 ${filters.isFavorite === true ? 'fill-amber-400 text-amber-500' : ''}`} />
            <span>Favorites Only</span>
          </div>
          {filters.isFavorite === true && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
        </button>

        <button
          onClick={toggleArchivedOnly}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            filters.isArchived === true
              ? 'bg-zinc-100 border-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200'
              : 'bg-zinc-50 border-zinc-200/50 text-zinc-600 dark:bg-zinc-900/40 dark:border-zinc-800/60 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <Archive className="w-3.5 h-3.5" />
            <span>Include Archived</span>
          </div>
          {filters.isArchived === true && <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />}
        </button>
      </div>

      {/* File Types (Checkboxes styled as inline badges) */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          File Format
        </label>
        <div className="flex flex-wrap gap-2">
          {['pdf', 'docx', 'txt'].map((type) => {
            const isSelected = filters.fileTypes?.includes(type);
            return (
              <button
                key={type}
                onClick={() => handleFileTypeToggle(type)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all border ${
                  isSelected
                    ? 'bg-zinc-900 border-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950'
                    : 'bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 hover:border-zinc-300'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5" />
          Category
        </label>
        <div className="relative">
          <select
            value={filters.category || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value || undefined }))}
            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-50 appearance-none"
          >
            <option value="">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Date Uploaded
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500">From</span>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleDateChange('dateFrom', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500">To</span>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleDateChange('dateTo', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tags Panel */}
      {availableTags.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Filter by Tags
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {availableTags.map((tag) => {
              const isSelected = filters.tags?.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                    isSelected
                      ? 'bg-zinc-900 border-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-950'
                      : 'bg-zinc-50 border-zinc-200/70 text-zinc-500 dark:bg-zinc-900/60 dark:border-zinc-800/85 dark:text-zinc-400 hover:bg-zinc-100'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Document Size Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          File Size (MB)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 block mb-0.5">Min (MB)</span>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              value={filters.minSize !== undefined ? filters.minSize / (1024 * 1024) : ''}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) * 1024 * 1024 : undefined;
                handleSizeChange('minSize', val);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 block mb-0.5">Max (MB)</span>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="100"
              value={filters.maxSize !== undefined ? filters.maxSize / (1024 * 1024) : ''}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) * 1024 * 1024 : undefined;
                handleSizeChange('maxSize', val);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
