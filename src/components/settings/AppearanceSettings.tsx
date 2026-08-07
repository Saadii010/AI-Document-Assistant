import React, { useState } from 'react';
import { Sun, Moon, Laptop, Sliders, Save, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme, Theme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

export interface AppearanceData {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  compactMode: boolean;
  animationToggle: boolean;
  accentColor: string;
}

interface AppearanceSettingsProps {
  initialData: AppearanceData;
  onSave: (data: AppearanceData) => Promise<void>;
}

const ACCENT_COLORS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', border: 'border-indigo-200' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500', border: 'border-blue-200' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', border: 'border-emerald-200' },
  { id: 'violet', label: 'Violet', bg: 'bg-violet-500', border: 'border-violet-200' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500', border: 'border-amber-200' },
];

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  initialData,
  onSave,
}) => {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState<AppearanceData['fontSize']>(initialData.fontSize || 'base');
  const [compactMode, setCompactMode] = useState(initialData.compactMode || false);
  const [animationToggle, setAnimationToggle] = useState(initialData.animationToggle !== false);
  const [accentColor, setAccentColor] = useState(initialData.accentColor || 'indigo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        theme,
        fontSize,
        compactMode,
        animationToggle,
        accentColor,
      });
      toast.success('Appearance preferences updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update appearance settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {/* Title */}
      <div className="flex flex-col gap-1 pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Appearance & Theme</h3>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Personalize the look, typography scaling, responsive spacing densities, and interface accent tints.
        </p>
      </div>

      {/* Theme Picker */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Theme Mode
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'light', label: 'Light Mode', icon: Sun, color: 'text-amber-500' },
            { key: 'dark', label: 'Dark Mode', icon: Moon, color: 'text-indigo-400' },
            { key: 'system', label: 'System Theme', icon: Laptop, color: 'text-zinc-400' },
          ].map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setTheme(opt.key as Theme);
                  toast.success(`Theme mode set to: ${opt.label}`);
                }}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2.5 text-center transition-all group cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/15 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 font-extrabold shadow-inner'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${opt.color} group-hover:scale-110 transition-transform`} />
                <span className="text-[10px] tracking-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color Picker */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Accent Color Tint
        </label>
        <div className="flex items-center gap-3">
          {ACCENT_COLORS.map((col) => {
            const isSelected = accentColor === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setAccentColor(col.id)}
                className={`w-8 h-8 rounded-full ${col.bg} flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-sm ${
                  isSelected ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-zinc-950' : ''
                }`}
                title={col.label}
              >
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacing & Typography Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Font Size */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Interface Font Size
          </label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as AppearanceData['fontSize'])}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500 transition-colors shadow-sm cursor-pointer"
          >
            <option value="sm">Small (14px)</option>
            <option value="base">Standard (16px)</option>
            <option value="lg">Large (18px)</option>
            <option value="xl">Extra Large (20px)</option>
          </select>
        </div>

        {/* Compact Mode */}
        <div className="flex flex-col gap-1.5 justify-center">
          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
            Density Sizing
          </label>
          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm cursor-pointer hover:bg-zinc-50/50 transition-colors">
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(e) => setCompactMode(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-800"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200">Compact density spacing</span>
              <span className="text-[9px] text-zinc-400">Reduce structural gutters and content margins</span>
            </div>
          </label>
        </div>

        {/* Animation Toggle */}
        <div className="flex flex-col gap-1.5 justify-center sm:col-span-2">
          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
            Motion FX Settings
          </label>
          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm cursor-pointer hover:bg-zinc-50/50 transition-colors">
            <input
              type="checkbox"
              checked={animationToggle}
              onChange={(e) => setAnimationToggle(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-800"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200">Enable interface animations</span>
              <span className="text-[9px] text-zinc-400">Renders elegant sliding transitions and micro-state expansions</span>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save Preferences</span>
        </button>
      </div>
    </motion.form>
  );
};
